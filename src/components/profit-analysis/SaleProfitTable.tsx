'use client';

import React from 'react';
import { ISale, ISaleItem } from '@/models/Sale';

interface SaleProfitTableProps {
    sales: ISale[];
    formatCurrency: (amount: number | undefined) => string;
    formatDate: (date: Date) => string;
}

const SaleProfitTable: React.FC<SaleProfitTableProps> = ({
    sales,
    formatCurrency,
    formatDate
}) => {
    // Satış kaleminin kar miktarını hesapla
    const calculateItemProfit = (item: ISaleItem): number => {
        if (!item.product || typeof item.product === 'string') {
            return 0; // Ürün bilgisi yoksa kar hesaplayamayız
        }

        // Toptan fiyat üzerinden kar hesabı (ürün nesnesi varsa)
        const wholesalePrice = item.product.wholesalePrice || 0;
        const totalCost = wholesalePrice * item.quantity;
        return item.totalPrice - totalCost;
    };

    // Satışın toplam karını hesapla
    const calculateSaleProfit = (sale: ISale): number => {
        if (!sale.items || !Array.isArray(sale.items)) return 0;

        return sale.items.reduce((total, item) => {
            return total + calculateItemProfit(item);
        }, 0);
    };

    // Kar yüzdesini hesapla
    const calculateProfitPercentage = (sale: ISale): number => {
        const profit = calculateSaleProfit(sale);
        const totalCost = calculateTotalCost(sale);

        if (totalCost === 0) return 0;
        return (profit / totalCost) * 100;
    };

    // Satışın toplam maliyetini hesapla
    const calculateTotalCost = (sale: ISale): number => {
        if (!sale.items || !Array.isArray(sale.items)) return 0;

        return sale.items.reduce((total, item) => {
            if (!item.product || typeof item.product === 'string') return total;

            const wholesalePrice = item.product.wholesalePrice || 0;
            return total + (wholesalePrice * item.quantity);
        }, 0);
    };

    // Ürün adlarını birleştir
    const getProductNames = (sale: ISale): string => {
        if (!sale.items || !Array.isArray(sale.items) || sale.items.length === 0) {
            return '---';
        }

        // İlk 2 ürünü göster, daha fazlası varsa "ve X daha" şeklinde belirt
        const names = sale.items.map(item => item.productName);

        if (names.length <= 2) {
            return names.join(', ');
        }

        return `${names[0]}, ${names[1]} ve ${names.length - 2} ürün daha`;
    };

    // Satışın ana tedarikçisini bul
    const getMainSupplier = (sale: ISale): string => {
        if (!sale.items || !Array.isArray(sale.items) || sale.items.length === 0) {
            return '---';
        }

        // Tedarikçileri topla
        const suppliers: { [key: string]: number } = {};

        sale.items.forEach(item => {
            if (item.product && typeof item.product !== 'string') {
                const supplier = item.product.supplier || 'Belirtilmemiş';
                suppliers[supplier] = (suppliers[supplier] || 0) + 1;
            }
        });

        // En çok tekrar eden tedarikçiyi bul
        let mainSupplier = 'Belirtilmemiş';
        let maxCount = 0;

        Object.entries(suppliers).forEach(([supplier, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mainSupplier = supplier;
            }
        });

        return mainSupplier;
    };

    // Satışların olmadığı veya geçersiz olduğu durumu göster
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">Gösterilecek satış kaydı bulunamadı</h3>
                <p className="mt-2 text-sm text-gray-500">Filtreleri değiştirmeyi veya farklı bir tarih aralığı seçmeyi deneyin.</p>
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
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700">Tarih</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700">Müşteri</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700 hidden sm:table-cell">Ürünler</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-left text-gray-700 hidden md:table-cell">Tedarikçi</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-center text-gray-700 hidden sm:table-cell">Ödeme Yöntemi</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700">Ciro</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700">Maliyet</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700">Kar</th>
                                <th scope="col" className="px-3 sm:px-4 py-3 text-right text-gray-700 hidden lg:table-cell">Kar %</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {sales.map((sale, index) => {
                                const profit = calculateSaleProfit(sale);
                                const profitPercentage = calculateProfitPercentage(sale);
                                const totalCost = calculateTotalCost(sale);

                                return (
                                    <tr
                                        key={sale._id}
                                        className={`${index % 2 === 0 ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-colors`}
                                    >
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-900 font-medium">
                                            {sale.saleDate ? formatDate(new Date(sale.saleDate)) : '---'}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-800 font-medium truncate">{sale.customerName}</span>
                                                {sale.customerPhone && (
                                                    <span className="text-xs text-gray-500">{sale.customerPhone}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden sm:table-cell">
                                            {getProductNames(sale)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-sm text-gray-600 hidden md:table-cell">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-50 border border-blue-100 text-blue-700">
                                                {getMainSupplier(sale)}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-center text-sm text-gray-600 hidden sm:table-cell">
                                            <span className="px-2 py-1 rounded-full text-xs bg-gray-100 border border-gray-200">
                                                {sale.paymentMethod}
                                            </span>
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-800 text-sm font-medium">
                                            {formatCurrency(sale.totalAmount)}
                                        </td>
                                        <td className="px-3 sm:px-4 py-3 sm:py-4 text-right text-gray-600 text-sm">
                                            {formatCurrency(totalCost)}
                                        </td>
                                        <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm font-medium ${profit > 0
                                            ? 'text-emerald-600'
                                            : profit < 0
                                                ? 'text-rose-600'
                                                : 'text-gray-600'
                                            }`}>
                                            {formatCurrency(profit)}
                                        </td>
                                        <td className={`px-3 sm:px-4 py-3 sm:py-4 text-right text-sm hidden lg:table-cell ${profitPercentage > 0
                                            ? 'text-emerald-600'
                                            : profitPercentage < 0
                                                ? 'text-rose-600'
                                                : 'text-gray-600'
                                            }`}>
                                            {profitPercentage.toFixed(2)}%
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot className="border-t border-gray-200 bg-gray-50 font-medium">
                            <tr>
                                <td colSpan={5} className="px-3 sm:px-4 py-3 text-right text-gray-700">
                                    Toplam ({sales.length} satış):
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-right text-gray-900">
                                    {formatCurrency(
                                        sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
                                    )}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-right text-gray-900">
                                    {formatCurrency(
                                        sales.reduce((sum, sale) => sum + calculateTotalCost(sale), 0)
                                    )}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-right text-emerald-700">
                                    {formatCurrency(
                                        sales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0)
                                    )}
                                </td>
                                <td className="px-3 sm:px-4 py-3 text-right text-emerald-700 hidden lg:table-cell">
                                    {(
                                        (sales.reduce((sum, sale) => sum + calculateSaleProfit(sale), 0) /
                                            sales.reduce((sum, sale) => sum + calculateTotalCost(sale), 0)) * 100
                                    ).toFixed(2)}%
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SaleProfitTable; 