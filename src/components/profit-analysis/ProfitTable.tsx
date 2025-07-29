'use client';

import React, { useState } from 'react';
import { IProduct } from '@/models/Product';

interface ProfitTableProps {
    products: IProduct[];
    onEditClick: (productId: string) => void;
    onImageClick: (product: IProduct) => void;
    editProductId: string | null;
    onSaveEdit: (productId: string, newWholesalePrice: number, newSalePrice: number) => void;
    formatCurrency: (amount: number | undefined) => string;
    calculateProfit: (wholesalePrice: number | undefined, salePrice: number | undefined) => number;
    calculateProfitPercentage: (wholesalePrice: number | undefined, salePrice: number | undefined) => number;
}

const ProfitTable: React.FC<ProfitTableProps> = ({
    products,
    onEditClick,
    onImageClick,
    editProductId,
    onSaveEdit,
    formatCurrency,
    calculateProfit,
    calculateProfitPercentage
}) => {
    const [editFormData, setEditFormData] = useState<{
        wholesalePrice: string;
        salePrice: string;
    }>({
        wholesalePrice: '',
        salePrice: '',
    });

    // Düzenleme moduna geçtiğinde form verilerini güncelle
    React.useEffect(() => {
        if (editProductId && products && Array.isArray(products)) {
            const productToEdit = products.find(p => p && p._id === editProductId);
            if (productToEdit) {
                setEditFormData({
                    wholesalePrice: productToEdit.wholesalePrice?.toString() || '',
                    salePrice: productToEdit.salePrice?.toString() || '',
                });
            }
        }
    }, [editProductId, products]);

    // Form girdilerini güncelle
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditFormData({
            ...editFormData,
            [e.target.name]: e.target.value,
        });
    };

    // Düzenleme formunu gönder
    const handleSaveClick = (productId: string) => {
        onSaveEdit(
            productId,
            editFormData.wholesalePrice ? parseFloat(editFormData.wholesalePrice) : 0,
            editFormData.salePrice ? parseFloat(editFormData.salePrice) : 0
        );
    };

    // Düzenleme modunu iptal et
    const handleCancelEdit = () => {
        onEditClick('');
    };

    // Ürünlerin olmadığı veya geçersiz olduğu durumu göster
    if (!products || !Array.isArray(products) || products.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Gösterilecek ürün bulunamadı</h3>
                <p className="mt-2 text-sm text-gray-500">Filtreleri değiştirmeyi veya farklı bir arama terimi kullanmayı deneyin.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
                <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr className="text-xs sm:text-sm font-medium uppercase tracking-wider">
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700">Ürün</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700 hidden sm:table-cell">Kategori</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700 hidden sm:table-cell">Tedarikçi</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-center text-gray-700">Stok</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700">Toptan</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700">Satış</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700 hidden md:table-cell">Kar</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700 hidden lg:table-cell">Kar %</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-center text-gray-700">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {products.filter(product => product && product._id).map((product, index) => (
                                <tr
                                    key={product._id}
                                    className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors`}
                                >
                                    <td className="px-3 sm:px-4 py-3 sm:py-4">
                                        <div className="flex items-center">
                                            {product.image && (
                                                <div
                                                    className="mr-2 h-8 w-8 overflow-hidden rounded-md flex-shrink-0 border border-gray-200 cursor-pointer"
                                                    onClick={() => product.image && onImageClick(product)}
                                                >
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <span className="text-sm text-gray-800 font-medium truncate">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">
                                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                                            {product.category || 'Kategorisiz'}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">
                                        {product.supplier ? product.supplier : <span className="text-gray-400 italic text-xs">Belirtilmemiş</span>}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                        <span className={`text-sm font-medium ${product.stock > 10 ? 'text-emerald-600' :
                                            product.stock > 0 ? 'text-amber-600' : 'text-rose-600'
                                            }`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-600 text-sm">
                                        {editProductId === product._id ? (
                                            <input
                                                type="number"
                                                name="wholesalePrice"
                                                value={editFormData.wholesalePrice}
                                                onChange={handleInputChange}
                                                className="w-20 rounded border px-2 py-1 bg-white border-gray-300 text-right text-sm"
                                                step="0.01"
                                                min="0"
                                            />
                                        ) : (
                                            formatCurrency(product.wholesalePrice)
                                        )}
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-800 text-sm font-medium">
                                        {editProductId === product._id ? (
                                            <input
                                                type="number"
                                                name="salePrice"
                                                value={editFormData.salePrice}
                                                onChange={handleInputChange}
                                                className="w-20 rounded border px-2 py-1 bg-white border-gray-300 text-right text-sm"
                                                step="0.01"
                                                min="0"
                                            />
                                        ) : (
                                            formatCurrency(product.salePrice)
                                        )}
                                    </td>
                                    <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm font-medium hidden md:table-cell ${calculateProfit(product.wholesalePrice, product.salePrice) > 0
                                        ? 'text-emerald-600'
                                        : calculateProfit(product.wholesalePrice, product.salePrice) < 0
                                            ? 'text-rose-600'
                                            : 'text-gray-600'
                                        }`}>
                                        {formatCurrency(calculateProfit(product.wholesalePrice, product.salePrice))}
                                    </td>
                                    <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm hidden lg:table-cell ${calculateProfitPercentage(product.wholesalePrice, product.salePrice) > 0
                                        ? 'text-emerald-600'
                                        : calculateProfitPercentage(product.wholesalePrice, product.salePrice) < 0
                                            ? 'text-rose-600'
                                            : 'text-gray-600'
                                        }`}>
                                        {calculateProfitPercentage(product.wholesalePrice, product.salePrice).toFixed(2)}%
                                    </td>
                                    <td className="px-3 sm:px-4 py-3 sm:py-4 text-center">
                                        {editProductId === product._id ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleSaveClick(product._id as string)}
                                                    className="rounded-md px-2 py-1 bg-emerald-50 text-emerald-700 text-xs border border-emerald-200 hover:bg-emerald-100 transition-all"
                                                    title="Değişiklikleri kaydet"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    className="rounded-md px-2 py-1 bg-rose-50 text-rose-700 text-xs border border-rose-200 hover:bg-rose-100 transition-all"
                                                    title="İptal et"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => onEditClick(product._id as string)}
                                                className="rounded-md px-2 py-1 bg-gray-100 text-gray-700 text-xs border border-gray-200 hover:bg-gray-200 transition-all"
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
            </div>
        </div>
    );
};

export default ProfitTable; 