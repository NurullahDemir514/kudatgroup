"use client";

import React, { useEffect, useState } from 'react';
import { IProduct } from '@/models/Product';
import { ISale } from '@/models/Sale';
import ProfitTable from '@/components/profit-analysis/ProfitTable';
import ProfitChart from '@/components/profit-analysis/ProfitChart';
import SaleProfitTable from '@/components/profit-analysis/SaleProfitTable';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import FormAlert from '@/components/ui/FormAlert';

export default function ProfitAnalysisPage() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<IProduct[]>([]);
    const [sales, setSales] = useState<ISale[]>([]);
    const [filteredSales, setFilteredSales] = useState<ISale[]>([]);
    const [loading, setLoading] = useState(true);
    const [salesLoading, setSalesLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [salesError, setSalesError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [editProductId, setEditProductId] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState('');

    // Kategorilerin listesini ürünlerden almak için
    const categories = products && products.length > 0
        ? ['all', ...Array.from(new Set(products.map(p => p.category || 'Kategorisiz')))]
        : ['all'];

    useEffect(() => {
        fetchProducts();
        fetchSales();
    }, []);

    useEffect(() => {
        if (products && Array.isArray(products)) {
            filterAndSortProducts();
        }
    }, [products, searchTerm, categoryFilter]);

    useEffect(() => {
        if (sales && Array.isArray(sales)) {
            filterSales();
        }
    }, [sales, startDate, endDate]);

    const fetchProducts = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch('/api/products');

                if (!response.ok) {
                    throw new Error('Ürünleri getirirken bir hata oluştu');
                }

                const result = await response.json();

                // API yanıtı {success: true, data: [...]} formatında olabilir
                // veya doğrudan dizi olabilir
                if (result && result.success === true && Array.isArray(result.data)) {
                // Başarılı API yanıtı - {success: true, data: [...]} formatında
                    setProducts(result.data);
                } else if (Array.isArray(result)) {
                    // API doğrudan dizi döndürüyor
                    setProducts(result);
                } else {
                    console.error('API geçerli bir ürün dizisi döndürmedi:', result);
                    setError('Ürün verileri uygun formatta değil');
                    setProducts([]);
                }
            } catch (err) {
                console.error('Ürünleri getirme hatası:', err);
                setError('Ürünleri getirirken bir hata oluştu. Lütfen tekrar deneyin.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

    const fetchSales = async () => {
        setSalesLoading(true);
        setSalesError(null);

        try {
            let url = "/api/sales";
            const params = new URLSearchParams();

            if (startDate) {
                params.append("startDate", startDate);
            }

            if (endDate) {
                params.append("endDate", endDate);
            }

            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Satışları getirirken bir hata oluştu');
            }

            const result = await response.json();

            if (result && result.success === true && Array.isArray(result.data)) {
                setSales(result.data);
            } else {
                console.error('API geçerli bir satış dizisi döndürmedi:', result);
                setSalesError('Satış verileri uygun formatta değil');
                setSales([]);
            }
        } catch (err) {
            console.error('Satışları getirme hatası:', err);
            setSalesError('Satışları getirirken bir hata oluştu. Lütfen tekrar deneyin.');
            setSales([]);
        } finally {
            setSalesLoading(false);
        }
    };

    const filterAndSortProducts = () => {
        if (!Array.isArray(products)) {
            console.error('products bir dizi değil:', products);
            setFilteredProducts([]);
            return;
        }

        let result = [...products];

        // Arama terimine göre filtreleme
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            result = result.filter(product =>
                (product.name?.toLowerCase().includes(searchLower)) ||
                (product.barcode?.toLowerCase().includes(searchLower)) ||
                (product.sku?.toLowerCase().includes(searchLower))
            );
        }

        // Kategoriye göre filtreleme
        if (categoryFilter !== 'all') {
            result = result.filter(product =>
                categoryFilter === 'Kategorisiz'
                    ? !product.category
                    : product.category === categoryFilter
            );
        }

        // Varsayılan sıralama (kâr bazlı azalan sıralama)
        result.sort((a, b) => {
            const profitA = calculateProfit(a.wholesalePrice, a.salePrice);
            const profitB = calculateProfit(b.wholesalePrice, b.salePrice);
            return profitB - profitA;
        });

        setFilteredProducts(result);
    };

    const filterSales = () => {
        if (!Array.isArray(sales)) {
            console.error('sales bir dizi değil:', sales);
            setFilteredSales([]);
            return;
        }

        let result = [...sales];

        // Tarih aralığına göre filtreleme
        if (startDate) {
            const startDateTime = new Date(startDate);
            result = result.filter(sale => {
                const saleDate = new Date(sale.saleDate);
                return saleDate >= startDateTime;
            });
        }

        if (endDate) {
            const endDateTime = new Date(endDate);
            endDateTime.setHours(23, 59, 59, 999); // Günün sonuna ayarla
            result = result.filter(sale => {
                const saleDate = new Date(sale.saleDate);
                return saleDate <= endDateTime;
            });
        }

        // Satışları tarihe göre sırala (en yeniden en eskiye)
        result.sort((a, b) => {
            const dateA = new Date(a.saleDate);
            const dateB = new Date(b.saleDate);
            return dateB.getTime() - dateA.getTime();
        });

        setFilteredSales(result);
    };

    const calculateProfit = (wholesalePrice: number | undefined, salePrice: number | undefined): number => {
        if (!wholesalePrice || !salePrice) return 0;
        return salePrice - wholesalePrice;
    };

    const calculateProfitPercentage = (wholesalePrice: number | undefined, salePrice: number | undefined): number => {
        if (!wholesalePrice || !salePrice || wholesalePrice === 0) return 0;
        return ((salePrice - wholesalePrice) / wholesalePrice) * 100;
    };

    const formatCurrency = (amount: number | undefined): string => {
        if (amount === undefined) return '₺0,00';
        return amount.toLocaleString('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        });
    };

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleEditClick = (productId: string) => {
        setEditProductId(productId);
    };

    const handleSaveEdit = async (productId: string, newWholesalePrice: number, newSalePrice: number) => {
        try {
            const product = products.find(p => p._id === productId);

            if (!product) {
                throw new Error('Ürün bulunamadı');
            }

            const updatedProduct = {
                ...product,
                wholesalePrice: newWholesalePrice,
                salePrice: newSalePrice
            };

            const response = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedProduct),
            });

            if (!response.ok) {
                throw new Error('Ürün güncellenirken bir hata oluştu');
            }

            const result = await response.json();

            // API yanıtı başarılı olup olmadığını kontrol edin
            if (result.success === false) {
                throw new Error(result.error || 'Ürün güncellenirken bir hata oluştu');
            }

            // Ürünü listede güncelle
            setProducts(prevProducts =>
                prevProducts.map(p =>
                    p._id === productId ? { ...p, wholesalePrice: newWholesalePrice, salePrice: newSalePrice } : p
                )
            );

            // Düzenleme modunu kapat
            setEditProductId(null);
        } catch (err) {
            console.error('Ürün güncelleme hatası:', err);
            setError('Ürünü güncellerken bir hata oluştu. Lütfen tekrar deneyin.');
        }
    };

    const handleImageClick = (product: IProduct) => {
        // Ürün detaylarını gösteren modal veya başka bir sayfa açılabilir
        console.log('Ürün detayları görüntülendi:', product);
    };

    const clearDateFilters = () => {
        setStartDate('');
        setEndDate('');
    };

    return (
        <div className="p-3 space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                <h1 className="text-xl font-bold text-gray-800">Kâr Analizi</h1>
            </div>

            {error && (
                <FormAlert
                    type="error"
                    title="Hata"
                    message={error}
                    onClose={() => setError(null)}
                />
            )}

            <div className="bg-white rounded-lg shadow-sm p-3">
                {/* Filtreleme Bölümü - Daha kompakt */}
                <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-medium text-gray-800">Filtreler</h2>
                        {(searchTerm || categoryFilter !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setCategoryFilter('all');
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Temizle
                            </button>
                        )}
            </div>

                    <div className="bg-gray-50 p-2 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {/* Arama */}
                            <div className="relative">
                                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                                    Arama
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="search"
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Ürün adı, barkod veya SKU..."
                                        className="block w-full pl-8 pr-3 py-1.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs text-gray-700 bg-white"
                                    />
                                    {searchTerm && (
                                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
                                            <button
                                                onClick={() => setSearchTerm('')}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="Temizle"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Kategori Filtresi */}
                            <div>
                                <label htmlFor="category" className="block text-xs font-medium text-gray-700 mb-1">
                                    Kategori
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                    </div>
                                    <select
                                        id="category"
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="block w-full pl-8 pr-8 py-1.5 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs appearance-none text-gray-700 bg-white"
                                    >
                                        <option value="all">Tüm Kategoriler</option>
                                        {categories.filter(c => c !== 'all').map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filtre Özeti - Daha kompakt */}
                {(searchTerm || categoryFilter !== 'all') && (
                    <div className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 mb-3 text-xs">
                        <div className="flex flex-wrap items-center gap-1">
                            <span className="text-gray-600">
                                <span className="font-medium text-gray-900">{filteredProducts.length}</span> ürün
                            </span>

                            {searchTerm && (
                                <div className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                                    <span>"{searchTerm}"</span>
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="ml-1 text-blue-700 hover:text-blue-900"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            {categoryFilter !== 'all' && (
                                <div className="inline-flex items-center bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                                    <span>{categoryFilter}</span>
                                    <button
                                        onClick={() => setCategoryFilter('all')}
                                        className="ml-1 text-green-700 hover:text-green-900"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-2 w-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center my-6">
                        <LoadingSpinner size="large" />
                    </div>
                ) : (
                        <div className="space-y-3">
                            {/* Grafik Bölümü - Daha kompakt */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                <div className="relative">
                                    {/* Başlık - Daha kompakt */}
                                    <div className="px-3 py-2 border-b border-gray-100 bg-blue-600">
                                        <div className="flex items-center justify-between">
                                            <div className="text-white">
                                                <h2 className="text-base font-semibold">Kâr Analizi Grafikleri</h2>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="bg-white/20 rounded px-2 py-1 text-center">
                                                    <div className="text-sm font-bold text-white">{filteredProducts.length}</div>
                                                    <div className="text-xs text-blue-100">Ürün</div>
                                                </div>
                                                <div className="bg-white/20 rounded px-2 py-1 text-center">
                                                    <div className="text-sm font-bold text-white">
                                                        {formatCurrency(filteredProducts.reduce((sum, product) =>
                                                            sum + calculateProfit(product.wholesalePrice, product.salePrice), 0))}
                                                    </div>
                                                    <div className="text-xs text-blue-100">Toplam Kâr</div>
                                                </div>
                                            </div>
                                    </div>
                                </div>
                                    {/* Renk Şeridi */}
                                    <div className="absolute -bottom-1 left-0 right-0 h-1 bg-blue-500"></div>
                            </div>

                                {/* Grafikler Bölümü - Daha kompakt */}
                                <div className="p-0 bg-white">
                                    <div className="flex justify-between items-center px-3 py-1 bg-gray-50 text-xs">
                                        <div className="flex flex-wrap gap-2">
                                <div className="flex items-center">
                                                <div className="h-2 w-2 bg-blue-500 rounded-full mr-1"></div>
                                                <span className="text-gray-700 font-medium">Kâr</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Grafik Bileşeni */}
                                    <div className="p-2 relative bg-white">
                                        <ProfitChart
                                            products={filteredProducts}
                                            calculateProfit={calculateProfit}
                                            calculateProfitPercentage={calculateProfitPercentage}
                                            formatCurrency={formatCurrency}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Tablo Bölümü - Daha kompakt */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <h2 className="text-base font-bold text-gray-800">Ürün Kârlılık Tablosu</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Tüm ürünlerinizin detaylı kâr bilgileri
                                    </p>
                                </div>
                                <div className="p-0">
                                    <ProfitTable
                                        products={filteredProducts}
                                        calculateProfit={calculateProfit}
                                        calculateProfitPercentage={calculateProfitPercentage}
                                        formatCurrency={formatCurrency}
                                        onEditClick={handleEditClick}
                                        onSaveEdit={handleSaveEdit}
                                        onImageClick={handleImageClick}
                                        editProductId={editProductId}
                                    />
                                </div>
                            </div>

                            {/* Satış Kârlılık Tablosu */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                                <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h2 className="text-base font-bold text-gray-800">Satışlara Göre Kârlılık Tablosu</h2>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Satışlarınızın detaylı kâr ve maliyet analizi
                                            </p>
                                                        </div>
                                        <div className="flex space-x-2">
                                            {/* Tarih filtreleri */}
                                            <div className="flex items-center gap-1">
                                                <div>
                                                    <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                                                        Başlangıç
                                                    </label>
                                                            <input
                                                        id="startDate"
                                                        type="date"
                                                        value={startDate}
                                                        onChange={(e) => setStartDate(e.target.value)}
                                                        className="w-32 rounded border border-gray-300 px-2 py-1 text-xs bg-blue-50 text-gray-900"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="endDate" className="block text-xs font-medium text-gray-700 mb-1">
                                                        Bitiş
                                                    </label>
                                                            <input
                                                        id="endDate"
                                                        type="date"
                                                        value={endDate}
                                                        onChange={(e) => setEndDate(e.target.value)}
                                                        className="w-32 rounded border border-gray-300 px-2 py-1 text-xs bg-blue-50 text-gray-900"
                                                    />
                                                </div>
                                                {(startDate || endDate) && (
                                                                <button
                                                        onClick={clearDateFilters}
                                                        className="h-7 mt-5 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded border border-gray-300 hover:bg-gray-200"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-0">
                                    {salesLoading ? (
                                        <div className="flex justify-center my-6">
                                            <LoadingSpinner size="medium" />
                                        </div>
                                    ) : salesError ? (
                                        <div className="p-4 text-center text-red-600">
                                            <p>{salesError}</p>
                                        </div>
                                    ) : (
                                        <SaleProfitTable
                                            sales={filteredSales}
                                            formatCurrency={formatCurrency}
                                            formatDate={formatDate}
                                        />
                                    )}
                                </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 