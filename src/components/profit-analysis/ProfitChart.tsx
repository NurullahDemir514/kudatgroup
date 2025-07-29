'use client';

import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell, Label, Legend, LineChart, Line, AreaChart, Area,
    Sector, ReferenceLine
} from 'recharts';
import { IProduct } from '@/models/Product';

interface ProfitChartProps {
    products: IProduct[];
    calculateProfit: (wholesalePrice: number | undefined, salePrice: number | undefined) => number;
    calculateProfitPercentage: (wholesalePrice: number | undefined, salePrice: number | undefined) => number;
    formatCurrency: (amount: number | undefined) => string;
}

interface ChartData {
    name: string;
    profit: number;
    profitMargin: number;
    color?: string;
    fill?: string;
}

interface CategoryData {
    name: string;
    value: number;
    count: number;
    fill?: string;
}

interface TrendData {
    month: string;
    profit: number;
    cost: number;
}

// Gelişmiş renk paleti
const COLORS = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#14b8a6', '#f97316', '#6366f1', '#ec4899', '#0ea5e9'
];

// Özel etiket render fonksiyonu
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null;

    return (
        <text
            x={x}
            y={y}
            fill="#333333"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize={12}
            fontWeight="600"
            stroke="#ffffff"
            strokeWidth={0.7}
            paintOrder="stroke"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

// Aktif pasta dilimi render fonksiyonu - hover özelliği
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value, name
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 10}
                fill={fill}
            />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={12}>{name}</text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#666" fontSize={12}>
                {`${(percent * 100).toFixed(2)}%`}
            </text>
        </g>
    );
};

// Özel tooltip bileşeni
const CustomTooltip = ({ active, payload, label, formatCurrency }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div className="custom-tooltip bg-gray-800/95 p-2.5 border-l-2 border-blue-500 shadow-lg rounded-md"
            style={{
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                maxWidth: '220px'
            }}>
            {payload[0].payload.name && (
                <p className="font-medium text-xs text-gray-200 border-b border-gray-600/50 pb-1.5 mb-1.5">
                    {payload[0].payload.name}
                </p>
            )}
            {payload.map((entry: any, index: number) => (
                <div key={`tooltip-${index}`} className="flex items-center gap-2 py-1">
                    <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: entry.color || entry.fill }}
                    />
                    <div className="flex justify-between w-full items-center">
                        <span className="text-xs text-gray-300">{entry.name}: </span>
                        <span className="text-xs font-medium text-white ml-1">
                            {entry.name.includes('Kâr') || entry.name === 'Profit' || entry.dataKey === 'profit' || entry.dataKey === 'value'
                                ? formatCurrency(entry.value)
                                : entry.name === 'Ürün Sayısı' || entry.dataKey === 'count'
                                    ? `${entry.value} adet`
                                    : entry.value}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const ProfitChart: React.FC<ProfitChartProps> = ({
    products,
    calculateProfit,
    calculateProfitPercentage,
    formatCurrency
}) => {
    const [topProducts, setTopProducts] = useState<ChartData[]>([]);
    const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [activeChartType, setActiveChartType] = useState<'top' | 'category'>('top');

    useEffect(() => {
        if (!products || !Array.isArray(products) || products.length === 0) {
            return;
        }

        try {
            // En kârlı ürünleri hesapla
            const productData = products
                .filter(product => product.name && product.wholesalePrice && product.salePrice)
                .map(product => ({
                    name: product.name,
                    profit: calculateProfit(product.wholesalePrice, product.salePrice),
                    profitMargin: calculateProfitPercentage(product.wholesalePrice, product.salePrice),
                }))
                .sort((a, b) => b.profit - a.profit)
                .slice(0, 10); // En kârlı 10 ürün

            setTopProducts(productData);

            // Kategori bazlı kâr hesaplaması
            const categories: Record<string, { profit: number; count: number }> = {};

            products.forEach(product => {
                if (product.wholesalePrice && product.salePrice) {
                    const category = product.category || 'Kategorisiz';
                    const profit = calculateProfit(product.wholesalePrice, product.salePrice);

                    if (!categories[category]) {
                        categories[category] = { profit: 0, count: 0 };
                    }

                    categories[category].profit += profit;
                    categories[category].count += 1;
                }
            });

            const categoryChartData = Object.entries(categories)
                .map(([name, { profit, count }], index) => ({
                    name,
                    value: profit,
                    count,
                    fill: COLORS[index % COLORS.length]
                }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 6); // En yüksek 6 kategoriyi göster

            setCategoryData(categoryChartData);
        } catch (error) {
            console.error('Grafik verisi hesaplanırken hata oluştu:', error);
            setTopProducts([]);
            setCategoryData([]);
        }
    }, [products, calculateProfit, calculateProfitPercentage]);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    if (!products || !Array.isArray(products) || products.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Grafik verisi yok</h3>
                <p className="mt-2 text-sm text-gray-500">Grafik oluşturmak için ürün verileri gereklidir.</p>
            </div>
        );
    }

    if (topProducts.length === 0 && categoryData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">İşlenebilir grafik verisi yok</h3>
                <p className="mt-2 text-sm text-gray-500">Ürünlerin fiyat bilgileri eksik olabilir.</p>
            </div>
        );
    }

    return (
        <div>
            {/* Grafik Seçici Butonlar */}
            <div className="flex flex-wrap justify-center mb-6 gap-2">
                <div className="inline-flex rounded-md shadow-sm">
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-l-lg ${activeChartType === 'top'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        onClick={() => setActiveChartType('top')}
                    >
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                            En Kârlı Ürünler
                        </div>
                    </button>
                    <button
                        type="button"
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${activeChartType === 'category'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border border-blue-600'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                        onClick={() => setActiveChartType('category')}
                    >
                        <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                            </svg>
                            Kategori Analizi
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-100 shadow-lg p-4 transition-all duration-300">
                {activeChartType === 'top' && (
                    <div>
                        <div className="w-full h-[500px]">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">En Yüksek Kârlı Ürünler</h3>
                                <p className="text-sm text-gray-500 mb-2">Her bir ürünün sağladığı toplam kâr miktarı (₺)</p>
                            </div>
                            <div className="h-[400px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={topProducts}
                                        layout="vertical"
                                        margin={{ top: 5, right: 50, left: 80, bottom: 20 }}
                                    >
                                        <defs>
                                            {topProducts.map((entry, index) => (
                                                <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="0">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.5} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis type="number" tickFormatter={(value: number) => formatCurrency(value)} fontSize={11} />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            width={80}
                                            fontSize={11}
                                            tick={{ fill: '#4b5563' }}
                                        />
                                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                        <Bar
                                            dataKey="profit"
                                            name="Kâr Miktarı"
                                            radius={[0, 6, 6, 0]}
                                            barSize={24}
                                            label={(props) => {
                                                const { x, y, width, height, value } = props;
                                                return (
                                                    <g>
                                                        <text
                                                            x={x + width + 5}
                                                            y={y + height / 2}
                                                            fill="#374151"
                                                            textAnchor="start"
                                                            dominantBaseline="middle"
                                                            fontSize={12}
                                                            fontWeight="500"
                                                        >
                                                            {formatCurrency(value)}
                                                        </text>
                                                    </g>
                                                );
                                            }}
                                        >
                                            {topProducts.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeChartType === 'category' && (
                    <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-1/2 h-[500px]">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Kategori Bazlı Kâr Dağılımı</h3>
                                <p className="text-sm text-gray-500 mb-2">Kategorilere göre toplam kâr miktarları</p>
                            </div>
                            <div className="h-[400px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <defs>
                                            {categoryData.map((entry, index) => (
                                                <linearGradient key={`pie-gradient-${index}`} id={`pie-gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.9} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.7} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            label={renderCustomizedLabel}
                                            labelLine={false}
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            onMouseEnter={onPieEnter}
                                            animationBegin={200}
                                            animationDuration={800}
                                            animationEasing="ease-out"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell
                                                    key={`cell-${index}`}
                                                    fill={`url(#pie-gradient-${index})`}
                                                    stroke="#fff"
                                                    strokeWidth={1}
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={36}
                                            formatter={(value, entry, index) => (
                                                <span className="text-xs text-gray-700">{value}</span>
                                            )}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 h-[500px] mt-6 lg:mt-0">
                            <div className="p-4 border-b border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Kategori / Ürün Oranı</h3>
                                <p className="text-sm text-gray-500 mb-2">Her kategorideki ürün sayısı</p>
                            </div>
                            <div className="h-[400px] pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={categoryData}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 60 }}
                                    >
                                        <defs>
                                            {categoryData.map((entry, index) => (
                                                <linearGradient key={`gradient-cat-${index}`} id={`gradient-cat-${index}`} x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.8} />
                                                    <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.4} />
                                                </linearGradient>
                                            ))}
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis
                                            dataKey="name"
                                            interval={0}
                                            angle={-45}
                                            textAnchor="end"
                                            height={70}
                                            fontSize={11}
                                            tick={{ fill: '#4b5563' }}
                                        />
                                        <YAxis
                                            fontSize={11}
                                            tick={{ fill: '#4b5563' }}
                                        />
                                        <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                                        <Bar
                                            dataKey="count"
                                            name="Ürün Sayısı"
                                            radius={[6, 6, 0, 0]}
                                            barSize={30}
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={`url(#gradient-cat-${index})`} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitChart; 