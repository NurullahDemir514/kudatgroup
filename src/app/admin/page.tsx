"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

// Bileşenleri import et
import StatisticsCard from "@/components/admin/dashboard/StatisticsCard";
import ChartCard from "@/components/admin/dashboard/ChartCard";
import DataTable from "@/components/admin/dashboard/DataTable";
import ActivitySummary from "@/components/admin/dashboard/ActivitySummary";

// Mevsim dönemleri için sabit değerler
const PERIODS = [
    { value: 'week', label: 'Hafta' },
    { value: 'month', label: 'Ay' },
    { value: 'year', label: 'Yıl' },
];

// Veri tipleri için arayüzler
interface Product {
    sku?: string;
    name: string;
    stock: number;
    minStockLevel?: number;
}

interface Sale {
    _id: string;
    orderStatus: string;
    totalAmount: number;
    saleDate: string;
    customerName: string;
    createdAt: string;
}

// İstatistik kartları için ikonlar
const ICONS = {
    customers: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    products: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    subscribers: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    ),
    sales: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');
    const [salesChartData, setSalesChartData] = useState<any>(null);
    const [activities, setActivities] = useState<any[]>([]);

    // Dashboard verilerini API'den getir
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // API endpoint
                const response = await fetch(`/api/admin/dashboard?period=${period}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    cache: 'no-store'
                });

                if (!response.ok) {
                    throw new Error(`API yanıtı başarısız: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    console.log('Dashboard verileri yüklendi:', data);
                    setDashboardData(data);
                    setSalesChartData(data.salesChart);
                    setActivities(data.recentActivities || []);

                    setError(null);
                } else {
                    setError(data.error || "Veriler yüklenirken bir hata oluştu");
                }
            } catch (error) {
                console.error("Dashboard veri yükleme hatası:", error);
                setError("Sunucu ile bağlantı kurulamadı veya veri alınamadı");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [period]);

    // Period değiştirme işleyicisi
    const handlePeriodChange = (newPeriod: 'week' | 'month' | 'year') => {
        setPeriod(newPeriod);
    };

    return (
        <div className="space-y-6 sm:space-y-8 pb-8 mb-8">
            {/* Üst başlık ve dönem seçici */}
            <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        Hoş Geldiniz!
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-600">
                        Kudat Steel Jewelry yönetim panelinde son durumu görebilirsiniz.
                    </p>
                </motion.div>

                <motion.div
                    className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                        {PERIODS.map((option) => (
                            <motion.button
                                key={option.value}
                                onClick={() => handlePeriodChange(option.value as 'week' | 'month' | 'year')}
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${period === option.value
                                    ? 'bg-white text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
                                    }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {option.label}
                            </motion.button>
                        ))}
                    </div>

                    <div className="flex space-x-2 sm:space-x-3">
                        <motion.button
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 transition-colors flex items-center text-xs sm:text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Rapor İndir
                        </motion.button>

                        <motion.button
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-colors flex items-center text-xs sm:text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Yeni Ürün
                        </motion.button>
                    </div>
                </motion.div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[...Array(4)].map((_, index) => (
                        <StatisticsCard
                            key={index}
                            title=""
                            value={0}
                            icon={<></>}
                            color="blue"
                            isLoading={true}
                        />
                    ))}
                </div>
            ) : error ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="text-rose-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2">Veriler Yüklenemedi</h3>
                            <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
                            <motion.button
                                onClick={() => setPeriod(period)}
                                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Tekrar Dene
                            </motion.button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* İstatistik Kartları */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                            <StatisticsCard
                                title="Toplam Müşteri"
                                    value={dashboardData.summary.customers.total}
                                    subtitle={`Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
                                    icon={ICONS.customers}
                                    color="indigo"
                                    trend={dashboardData.summary.customers.trend}
                                    link="/admin/customers"
                />

                                <StatisticsCard
                    title="Toplam Ürün"
                                    value={dashboardData.summary.products.total}
                                    subtitle="Stokta mevcut"
                                    icon={ICONS.products}
                                    color="rose"
                                    trend={dashboardData.summary.products.trend}
                                    link="/admin/products"
                                />

                                <StatisticsCard
                                    title="Aboneler"
                                    value={dashboardData.summary.subscribers.total}
                                    subtitle="Aktif aboneler"
                                    icon={ICONS.subscribers}
                                    color="emerald"
                                    trend={dashboardData.summary.subscribers.trend}
                                    link="/admin/newsletters"
                />

                                <StatisticsCard
                    title="Toplam Satış"
                                    value={`${dashboardData.summary.sales.revenue?.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00'} ₺`}
                                    subtitle={`${dashboardData.summary.sales.total} satış - Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
                                    icon={ICONS.sales}
                                    color="blue"
                                    trend={dashboardData.summary.sales.revenueTrend}
                                    link="/admin/sales"
                                />
                            </div>

                            {/* Grafikler */}
                            <div className="grid grid-cols-1 gap-4 sm:gap-6">
                                <div>
                                    {salesChartData && (
                                        <ChartCard
                                            title="Satış Performansı"
                                            type="line"
                                            data={salesChartData}
                                            color="blue"
                                            description={`Bu grafik son ${period === 'week' ? 'haftadaki' : period === 'month' ? 'aydaki' : 'yıldaki'} satış performansını göstermektedir.`}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Veri Tabloları */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                {/* Son Müşteriler */}
                                <DataTable
                                    title="Son Eklenen Müşteriler"
                                    columns={[
                                        { key: "name", header: "İSİM", sortable: true },
                                        { key: "email", header: "EMAIL", sortable: true },
                                        {
                                            key: "createdAt", header: "KAYIT TARİHİ", sortable: true, cell: (customer) => (
                                                new Date(customer.createdAt).toLocaleDateString("tr-TR")
                                            )
                                        },
                                    ]}
                                    data={dashboardData.recentCustomers}
                                    viewAllLink="/admin/customers"
                                    viewAllText="Tüm müşterileri görüntüle"
                                    actionButtons={[
                                        {
                                            label: "Görüntüle",
                                            color: "blue",
                                            onClick: (customer) => console.log("Görüntüle", customer),
                                            icon: (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )
                                        }
                                    ]}
                                    rowKeyField="_id"
                                />

                                {/* Son Siparişler Tablosu */}
                                <DataTable
                                    title="Son Siparişler"
                                    columns={[
                                        {
                                            key: "_id", header: "SİPARİŞ NO", width: "30%", sortable: true, cell: (sale) => (
                                                `SİP-${String(sale._id).substring(18)}`
                                            )
                                        },
                                        {
                                            key: "saleDate", header: "TARİH", width: "25%", sortable: true, cell: (sale) => (
                                                new Date(sale.saleDate).toLocaleDateString("tr-TR")
                                            )
                                        },
                                        {
                                            key: "totalAmount", header: "TUTAR", sortable: true, cell: (sale) => (
                                                `${sale.totalAmount?.toLocaleString('tr-TR') || 0} ₺`
                                            )
                                        },
                                        {
                                            key: "orderStatus", header: "DURUM", sortable: true, cell: (sale) => {
                                                type StatusType = "Beklemede" | "İşlemde" | "Tamamlandı" | "İptal Edildi" | "Kargoda";

                                                const statusColors: Record<StatusType, string> = {
                                                    "Beklemede": "bg-amber-100 text-amber-800",
                                                    "İşlemde": "bg-blue-100 text-blue-800",
                                                    "Tamamlandı": "bg-green-100 text-green-800",
                                                    "İptal Edildi": "bg-red-100 text-red-800",
                                                    "Kargoda": "bg-purple-100 text-purple-800"
                                                };

                                                const status = (sale.orderStatus || "Beklemede") as StatusType;
                                                const colorClass = statusColors[status];

                                                return (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                                                        {status}
                                                    </span>
                                                );
                                            }
                                        },
                                    ]}
                                    data={dashboardData.recentSales || []}
                                    viewAllLink="/admin/sales"
                                    viewAllText="Tüm siparişleri görüntüle"
                                    onRowClick={(row) => console.log("Satış detayı:", row)}
                                    emptyStateText="Henüz sipariş bulunmuyor"
                                    rowKeyField="_id"
                                />
                            </div>
                        </>
            )}
        </div>
    );
}
