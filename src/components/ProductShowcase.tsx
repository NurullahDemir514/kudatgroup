'use client';

import { useState, useEffect } from 'react';
import { IProduct } from '@/models/Product';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductShowcase() {
    const [products, setProducts] = useState<IProduct[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showImageModal, setShowImageModal] = useState(false);

    // Ürünleri getir
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/products');
                const result = await response.json();

                if (result.success) {
                    setProducts(result.data);
                } else {
                    setError(result.error || 'Ürünler yüklenirken bir hata oluştu');
                }
            } catch (err) {
                setError('Sunucu ile bağlantı kurulamadı');
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
                const response = await fetch('/api/products/categories');
                const result = await response.json();

                if (result.success) {
                    setCategories(result.data);
                }
            } catch (err) {
                console.error('Kategoriler yüklenirken hata:', err);
            }
        };

        fetchCategories();
    }, [products]);

    // Para formatı
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        }).format(amount);
    };

    // Filtreleme
    const filteredProducts = selectedCategory
        ? products.filter((product) => product.category === selectedCategory)
        : products;

    // Resmi büyütmek için modal aç
    const openImageModal = (imageUrl: string) => {
        setSelectedImage(imageUrl);
        setShowImageModal(true);
    };

    // Modal kapat
    const closeImageModal = () => {
        setShowImageModal(false);
        setSelectedImage(null);
    };

    return (
        <div className="py-12">
            <div className="container mx-auto px-4">
                <h2 className="mb-8 text-center text-3xl font-bold text-gray-800">Koleksiyonumuz</h2>

                {/* Kategori filtreleme */}
                <div className="mb-12 flex flex-wrap justify-center">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`m-1 rounded-full px-5 py-2 text-sm transition-all duration-300 ${selectedCategory === null
                                ? 'bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } border border-gray-200`}
                    >
                        Tümü
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`m-1 rounded-full px-5 py-2 text-sm transition-all duration-300 ${selectedCategory === category
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                } border border-gray-200`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {error && (
                    <div className="mx-auto mb-6 max-w-2xl rounded-md bg-red-50 p-4 text-sm text-red-600 border border-red-200">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
                    </div>
                ) : (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="mx-auto max-w-2xl rounded-md bg-gray-50 p-8 text-center text-gray-600 border border-gray-200">
                                <p>Bu kategoride henüz ürün bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product._id}
                                        className="group overflow-hidden rounded-lg bg-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-gray-200"
                                    >
                                        <div className="relative h-64 w-full overflow-hidden">
                                            {product.image ? (
                                                <div className="h-full w-full">
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            openImageModal(product.image || '');
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-800 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                                                </div>
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-gray-100">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-16 w-16 text-gray-400"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={1}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 border-t border-gray-100">
                                            <div className="mb-2 flex items-center">
                                                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700 border border-teal-100">
                                                    {product.category}
                                                </span>
                                            </div>

                                            <h3 className="mb-2 text-lg font-semibold text-gray-800 transition-colors group-hover:text-teal-600">
                                                {product.name}
                                            </h3>

                                            <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                                                {product.description || 'Ürün açıklaması bulunmuyor.'}
                                            </p>

                                            <div className="mt-auto flex items-center justify-between">
                                                <span className="text-lg font-bold text-teal-700">{formatCurrency(product.salePrice)}</span>
                                                <span
                                                    className={`text-sm font-medium ${product.stock > 10
                                                            ? 'text-emerald-600'
                                                            : product.stock > 0
                                                                ? 'text-amber-600'
                                                                : 'text-red-600'
                                                        }`}
                                                >
                                                    {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
                                                </span>
                                            </div>

                                            <Link
                                                href={`/products/${product._id}`}
                                                className="mt-4 block w-full rounded-md bg-gradient-to-r from-teal-600 to-blue-600 p-2.5 text-center text-sm font-medium text-white transition-all hover:shadow-md"
                                            >
                                                Detayları Görüntüle
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Resim Modalı */}
            {showImageModal && selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4"
                    onClick={closeImageModal}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] rounded-lg overflow-hidden border border-gray-200 shadow-xl bg-white"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={selectedImage}
                            alt="Ürün Detayı"
                            className="max-h-[90vh] max-w-full object-contain"
                        />
                        <button
                            className="absolute right-4 top-4 rounded-full bg-white bg-opacity-80 p-2 text-gray-800 hover:bg-opacity-100 transition-all shadow-md"
                            onClick={closeImageModal}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
} 