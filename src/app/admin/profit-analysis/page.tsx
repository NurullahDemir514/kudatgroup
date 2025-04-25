"use client";

import { useState, useEffect } from "react";
import { IProduct } from "@/models/Product";

export default function ProfitAnalysisPage() {
    // State tanımlamaları
    const [products, setProducts] = useState<IProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        wholesalePrice: "",
        salePrice: "",
    });
    // Resim modalı için state tanımlamaları
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Ürünleri API'den getir
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch("/api/products");
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data);
                } else {
                    setError(result.error || "Ürünler yüklenirken bir hata oluştu");
                }
            } catch (err) {
                setError("Sunucu ile bağlantı kurulamadı");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Kategorileri getir
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("/api/products/categories");
                const result = await response.json();

                if (result.success) {
                    setCategories(result.data);
                }
            } catch (err) {
                console.error("Kategoriler yüklenirken hata:", err);
            }
        };

        fetchCategories();
    }, []);

    // Form verilerini güncelle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    // Ürün fiyatlarını güncelle
    const handleUpdatePrices = async (productId: string) => {
        try {
            const response = await fetch(`/api/products/${productId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    wholesalePrice: Number(formData.wholesalePrice),
                    salePrice: Number(formData.salePrice),
                }),
            });

            const result = await response.json();

            if (result.success) {
                // Ürünler listesini güncelle
                setProducts(prevProducts =>
                    prevProducts.map(product =>
                        product._id === productId
                            ? {
                                ...product,
                                wholesalePrice: Number(formData.wholesalePrice),
                                salePrice: Number(formData.salePrice),
                            }
                            : product
                    )
                );
                setEditingProductId(null);
            } else {
                setError(result.error || "Ürün güncellenirken bir hata oluştu");
            }
        } catch (err) {
            setError("Sunucu ile bağlantı kurulamadı");
            console.error(err);
        }
    };

    // Ürün düzenleme modunu başlat
    const handleStartEdit = (product: IProduct) => {
        setEditingProductId(product._id || null);
        setFormData({
            wholesalePrice: product.wholesalePrice?.toString() || "",
            salePrice: product.salePrice?.toString() || "",
        });
    };

    // Düzenlemeyi iptal et
    const handleCancelEdit = () => {
        setEditingProductId(null);
    };

    // Para birimi formatı
    const formatCurrency = (amount: number | undefined) => {
        if (amount === undefined || isNaN(amount)) return "₺0,00";
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY",
        }).format(amount);
    };

    // Kar marjını hesapla
    const calculateProfit = (wholesalePrice: number | undefined, salePrice: number | undefined) => {
        if (wholesalePrice === undefined || isNaN(wholesalePrice) || salePrice === undefined || isNaN(salePrice)) return 0;
        return salePrice - wholesalePrice;
    };

    // Kar marjı yüzdesini hesapla
    const calculateProfitPercentage = (wholesalePrice: number | undefined, salePrice: number | undefined) => {
        if (wholesalePrice === undefined || isNaN(wholesalePrice) || salePrice === undefined || isNaN(salePrice) || wholesalePrice === 0) return 0;
        return ((salePrice - wholesalePrice) / wholesalePrice) * 100;
    };

    // Filtreleme işlemleri
    const filteredProducts = products
        .filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.supplier && product.supplier.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .filter(product => !selectedCategory || product.category === selectedCategory);

    // Resmi büyütme işlevi
    const handleImageClick = (e: React.MouseEvent, imageUrl: string | undefined) => {
        e.stopPropagation(); // Tablodaki satır tıklamasını engellemek için
        if (imageUrl) {
            setSelectedImage(imageUrl);
            setShowImageModal(true);
        }
    };

    // Modalı kapatma işlevi
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="space-y-6">
            {/* Başlık ve Özet Göstergeleri */}
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between">
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    Ürün Kar Analizi
                </h1>

                {!loading && filteredProducts.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        <div className="rounded-lg px-3 py-1.5 border border-emerald-700 bg-emerald-900/30 text-xs text-emerald-400">
                            Toplam Ürün: <span className="font-semibold">{filteredProducts.length}</span>
                        </div>
                        <div className="rounded-lg px-3 py-1.5 border border-blue-700 bg-blue-900/30 text-xs text-blue-400">
                            Toplam Tedarikçi: <span className="font-semibold">{new Set(filteredProducts.map(product => product.supplier).filter(Boolean)).size || 0}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Filtreleme ve Arama */}
            <div className="rounded-xl bg-black bg-opacity-40 border border-gray-800 p-4 backdrop-blur-sm">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    <div className="col-span-1 sm:col-span-2 lg:col-span-2">
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Arama</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Ürün adı, kategori veya tedarikçi ara..."
                                className="w-full rounded-md border border-gray-800 bg-black bg-opacity-70 pl-10 pr-4 py-2 text-gray-300 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-gray-500">Kategori</label>
                        <select
                            className="w-full rounded-md border border-gray-800 bg-black bg-opacity-70 px-4 py-2 text-gray-300 focus:border-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-700"
                            value={selectedCategory || ""}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                        >
                            <option value="">Tüm Kategoriler</option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        {searchTerm || selectedCategory ? (
                            <button
                                onClick={() => {
                                    setSearchTerm("");
                                    setSelectedCategory(null);
                                }}
                                className="w-full flex items-center justify-center rounded-md border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Filtreleri Temizle
                            </button>
                        ) : (
                            <div className="text-xs text-gray-500 pl-2">
                                {filteredProducts.length} ürün listeleniyor
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
                <div className="rounded-xl bg-red-900 bg-opacity-20 p-4 text-sm text-red-200 border border-red-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>{error}</p>
                </div>
            )}

            {/* Yükleme Göstergesi */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-gray-300"></div>
                    <p className="mt-4 text-sm text-gray-400">Ürün verileri yükleniyor...</p>
                </div>
            ) : (
                <>
                    {/* Özet Bilgiler - Toplam İstatistikler */}
                    {filteredProducts.length > 0 && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl bg-black bg-opacity-40 p-4 border border-gray-800 backdrop-blur-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-blue-900/20 text-blue-400 border border-blue-800/40 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Tedarikçi Sayısı</h3>
                                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                                            {new Set(filteredProducts.map(product => product.supplier).filter(Boolean)).size || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-black bg-opacity-40 p-4 border border-gray-800 backdrop-blur-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-amber-900/20 text-amber-400 border border-amber-800/40 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Toptan Alım Değeri</h3>
                                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                                            {formatCurrency(
                                                filteredProducts.reduce(
                                                    (sum, product) => {
                                                        const wholesalePrice = product.wholesalePrice || 0;
                                                        return sum + (isNaN(wholesalePrice) ? 0 : wholesalePrice) * product.stock;
                                                    },
                                                    0
                                                )
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-black bg-opacity-40 p-4 border border-gray-800 backdrop-blur-sm">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-cyan-900/20 text-cyan-400 border border-cyan-800/40 mr-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Toplam Satış Değeri</h3>
                                        <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                                            {formatCurrency(
                                                filteredProducts.reduce(
                                                    (sum, product) => {
                                                        const salePrice = product.salePrice || 0;
                                                        return sum + (isNaN(salePrice) ? 0 : salePrice) * product.stock;
                                                    },
                                                    0
                                                )
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl bg-black bg-opacity-40 p-4 border border-gray-800 backdrop-blur-sm">
                                <div className="flex items-center">
                                    <div className={`p-3 rounded-lg ${filteredProducts.reduce(
                                        (sum, product) => {
                                            const profit = calculateProfit(product.wholesalePrice, product.salePrice);
                                            return sum + (isNaN(profit) ? 0 : profit) * product.stock;
                                        },
                                        0
                                    ) > 0
                                        ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/40'
                                        : 'bg-rose-900/20 text-rose-400 border border-rose-800/40'
                                        } mr-4`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-medium uppercase tracking-wider text-gray-500">Potansiyel Kar</h3>
                                        <p className={`text-2xl font-bold ${filteredProducts.reduce(
                                            (sum, product) => {
                                                const profit = calculateProfit(product.wholesalePrice, product.salePrice);
                                                return sum + (isNaN(profit) ? 0 : profit) * product.stock;
                                            },
                                            0
                                        ) > 0
                                            ? 'text-emerald-400'
                                            : 'text-rose-400'
                                            }`}>
                                            {formatCurrency(
                                                filteredProducts.reduce(
                                                    (sum, product) => {
                                                        const profit = calculateProfit(product.wholesalePrice, product.salePrice);
                                                        return sum + (isNaN(profit) ? 0 : profit) * product.stock;
                                                    },
                                                    0
                                                )
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Ürün Tablosu */}
                    {filteredProducts.length === 0 ? (
                        <div className="rounded-xl bg-black bg-opacity-40 p-6 text-center border border-gray-800 backdrop-blur-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="mt-4 text-lg font-medium text-gray-300">Gösterilecek ürün bulunamadı</h3>
                            <p className="mt-2 text-sm text-gray-500">Filtreleri değiştirmeyi veya farklı bir arama terimi kullanmayı deneyin.</p>
                        </div>
                    ) : (
                                <div className="overflow-x-auto rounded-lg border border-gray-800 bg-black bg-opacity-40 shadow-lg">
                                    <table className="min-w-full divide-y divide-gray-800">
                                        <thead className="bg-gradient-to-r from-zinc-900 to-black">
                                            <tr className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-300">Ürün</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-300 hidden sm:table-cell">Kategori</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-300 hidden sm:table-cell">Tedarikçi</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-center text-gray-300">Stok</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-300">Toptan</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-300">Satış</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-300 hidden md:table-cell">Kar</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-300 hidden lg:table-cell">Kar %</th>
                                                <th scope="col" className="px-3 sm:px-4 py-3 text-center text-gray-300">İşlem</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800 bg-black bg-opacity-60">
                                            {filteredProducts.map((product, index) => (
                                                <tr
                                                    key={product._id}
                                                    className={`${index % 2 === 0 ? 'bg-black bg-opacity-20' : ''} hover:bg-zinc-900 hover:bg-opacity-50 transition-colors`}
                                                >
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                                        <div className="flex items-center">
                                                            {product.image && (
                                                                <div
                                                                    className="mr-2 h-8 w-8 overflow-hidden rounded-md flex-shrink-0 border border-gray-700 cursor-pointer"
                                                                    onClick={(e) => product.image && handleImageClick(e, product.image)}
                                                                >
                                                                    <img
                                                                        src={product.image}
                                                                        alt={product.name}
                                                                        className="h-full w-full object-cover"
                                                                        onClick={(e) => product.image && handleImageClick(e, product.image)}
                                                                    />
                                                                </div>
                                                            )}
                                                            <span className="text-sm text-gray-200 font-medium truncate">{product.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-400 hidden sm:table-cell">
                                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-800 bg-opacity-70 border border-gray-700">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-400 hidden sm:table-cell">
                                                        {product.supplier ? product.supplier : <span className="text-gray-600 italic text-xs">Belirtilmemiş</span>}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                                        <span className={`text-sm font-medium ${product.stock > 10 ? 'text-emerald-400' :
                                                            product.stock > 0 ? 'text-amber-400' : 'text-rose-400'
                                                            }`}>
                                                            {product.stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-400 text-sm">
                                                        {editingProductId === product._id ? (
                                                            <input
                                                                type="number"
                                                                name="wholesalePrice"
                                                                value={formData.wholesalePrice}
                                                                onChange={handleInputChange}
                                                                className="w-20 rounded border px-2 py-1 bg-gray-900 border-gray-700 text-right text-sm"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            formatCurrency(product.wholesalePrice)
                                                        )}
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-200 text-sm font-medium">
                                                        {editingProductId === product._id ? (
                                                            <input
                                                                type="number"
                                                                name="salePrice"
                                                                value={formData.salePrice}
                                                                onChange={handleInputChange}
                                                                className="w-20 rounded border px-2 py-1 bg-gray-900 border-gray-700 text-right text-sm"
                                                                step="0.01"
                                                                min="0"
                                                            />
                                                        ) : (
                                                            formatCurrency(product.salePrice)
                                                        )}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm font-medium hidden md:table-cell ${calculateProfit(product.wholesalePrice, product.salePrice) > 0
                                                        ? 'text-emerald-400'
                                                        : calculateProfit(product.wholesalePrice, product.salePrice) < 0
                                                            ? 'text-rose-400'
                                                            : 'text-gray-400'
                                            }`}>
                                                        {formatCurrency(calculateProfit(product.wholesalePrice, product.salePrice))}
                                                    </td>
                                                    <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm hidden lg:table-cell ${calculateProfitPercentage(product.wholesalePrice, product.salePrice) > 0
                                                        ? 'text-emerald-400'
                                                        : calculateProfitPercentage(product.wholesalePrice, product.salePrice) < 0
                                                            ? 'text-rose-400'
                                                            : 'text-gray-400'
                                            }`}>
                                                        {calculateProfitPercentage(product.wholesalePrice, product.salePrice).toFixed(2)}%
                                                    </td>
                                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                                        {editingProductId === product._id ? (
                                                            <div className="flex items-center justify-center space-x-2">
                                                                <button
                                                                    onClick={() => handleUpdatePrices(product._id!)}
                                                                    className="rounded-md px-2 py-1 bg-gradient-to-r from-emerald-700 to-emerald-900 text-emerald-100 text-xs border border-emerald-600 hover:from-emerald-600 hover:to-emerald-800 transition-all"
                                                                    title="Değişiklikleri kaydet"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="rounded-md px-2 py-1 bg-gradient-to-r from-rose-700 to-rose-900 text-rose-100 text-xs border border-rose-600 hover:from-rose-600 hover:to-rose-800 transition-all"
                                                                    title="İptal et"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleStartEdit(product)}
                                                                    className="rounded-md px-2 py-1 bg-gradient-to-r from-gray-700 to-gray-900 text-gray-300 text-xs border border-gray-600 hover:from-gray-600 hover:to-gray-800 transition-all"
                                                                >
                                                                <span className="hidden sm:inline">Düzenle</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Sayfa sonu bilgisi */}
                        {filteredProducts.length > 0 && (
                            <div className="mt-4 text-xs text-gray-500 text-right">
                                Tabloda {filteredProducts.length} ürün gösteriliyor
                            </div>
                        )}
                </>
            )}

            {/* Resim Modal */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm transition-opacity"
                    onClick={closeImageModal}
                >
                    <div className="relative max-w-3xl max-h-[90vh] overflow-hidden rounded-lg border border-gray-700 bg-black bg-opacity-90 shadow-xl">
                        <button
                            onClick={closeImageModal}
                            className="absolute right-3 top-3 rounded-full bg-black bg-opacity-50 p-2 text-gray-300 hover:bg-opacity-70 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <img
                            src={selectedImage}
                            alt="Ürün görseli"
                            className="max-h-[90vh] max-w-full object-contain"
                            onClick={(e) => e.stopPropagation()} // Resme tıklama modal kapatmasını engeller
                        />
                    </div>
                </div>
            )}
        </div>
    );
} 