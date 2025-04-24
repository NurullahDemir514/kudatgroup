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
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(product => !selectedCategory || product.category === selectedCategory);

    return (
        <div className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Ürün Kar Analizi</h1>

            {/* Filtreleme ve Arama */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Ürün adı veya kategori ara..."
                        className="w-full rounded-md border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-64">
                    <select
                        className="w-full rounded-md border border-gray-300 px-4 py-2 dark:bg-gray-800 dark:border-gray-700"
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
            </div>

            {/* Hata Mesajı */}
            {error && (
                <div className="my-4 rounded-md bg-red-100 p-4 text-red-700">
                    <p>{error}</p>
                </div>
            )}

            {/* Ürün Listesi */}
            {loading ? (
                <div className="my-8 flex justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                            <tr className="bg-gray-200 dark:bg-gray-700">
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Ürün</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Kategori</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Stok</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Fiyat</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Toptan Alım</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Satış Fiyatı</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Kar</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">Kar Oranı</th>
                                <th className="border border-gray-300 p-2 text-left dark:border-gray-600">İşlemler</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="border border-gray-300 p-2 text-center dark:border-gray-600">
                                        Gösterilecek ürün bulunamadı
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr
                                        key={product._id}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">
                                            <div className="flex items-center">
                                                {product.image && (
                                                    <div className="mr-2 h-10 w-10 overflow-hidden rounded-md">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <span>{product.name}</span>
                                            </div>
                                        </td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">{product.category}</td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">{product.stock}</td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">{formatCurrency(product.salePrice)}</td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">
                                            {editingProductId === product._id ? (
                                                <input
                                                    type="number"
                                                    name="wholesalePrice"
                                                    value={formData.wholesalePrice}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded border px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            ) : (
                                                formatCurrency(product.wholesalePrice)
                                            )}
                                        </td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">
                                            {editingProductId === product._id ? (
                                                <input
                                                    type="number"
                                                    name="salePrice"
                                                    value={formData.salePrice}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded border px-2 py-1 dark:bg-gray-700 dark:border-gray-600"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            ) : (
                                                formatCurrency(product.salePrice)
                                            )}
                                        </td>
                                        <td className={`border border-gray-300 p-2 dark:border-gray-600 ${calculateProfit(product.wholesalePrice, product.salePrice) > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : calculateProfit(product.wholesalePrice, product.salePrice) < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : ''
                                            }`}>
                                            {formatCurrency(calculateProfit(product.wholesalePrice, product.salePrice))}
                                        </td>
                                        <td className={`border border-gray-300 p-2 dark:border-gray-600 ${calculateProfitPercentage(product.wholesalePrice, product.salePrice) > 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : calculateProfitPercentage(product.wholesalePrice, product.salePrice) < 0
                                                ? 'text-red-600 dark:text-red-400'
                                                : ''
                                            }`}>
                                            {calculateProfitPercentage(product.wholesalePrice, product.salePrice).toFixed(2)}%
                                        </td>
                                        <td className="border border-gray-300 p-2 dark:border-gray-600">
                                            {editingProductId === product._id ? (
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleUpdatePrices(product._id!)}
                                                        className="rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                    >
                                                        Kaydet
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="rounded-md bg-gray-500 px-2 py-1 text-white hover:bg-gray-600"
                                                    >
                                                        İptal
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleStartEdit(product)}
                                                    className="rounded-md bg-blue-500 px-2 py-1 text-white hover:bg-blue-600"
                                                >
                                                    Düzenle
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Özet Bilgiler */}
            {!loading && filteredProducts.length > 0 && (
                <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                        <h3 className="mb-2 text-lg font-semibold">Toplam Toptan Alım Değeri</h3>
                        <p className="text-2xl font-bold">
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
                    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                        <h3 className="mb-2 text-lg font-semibold">Toplam Satış Değeri</h3>
                        <p className="text-2xl font-bold">
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
                    <div className="rounded-lg bg-white p-4 shadow-md dark:bg-gray-800">
                        <h3 className="mb-2 text-lg font-semibold">Toplam Potansiyel Kar</h3>
                        <p className={`text-2xl font-bold ${filteredProducts.reduce(
                            (sum, product) => {
                                const profit = calculateProfit(product.wholesalePrice, product.salePrice);
                                return sum + (isNaN(profit) ? 0 : profit) * product.stock;
                            },
                            0
                        ) > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
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
            )}
        </div>
    );
} 