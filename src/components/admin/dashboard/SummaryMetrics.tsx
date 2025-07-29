import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface StockItem {
    code: string;
    name: string;
    current: number;
    minimum: number;
    status: 'kritik' | 'azalıyor' | 'tükendi' | 'normal';
}

interface StockSummaryProps {
    stockLevels?: {
        inStock: number;
        lowStock: number;
        outOfStock: number;
        onOrder: number;
    };
    criticalItems?: StockItem[];
    isLoading?: boolean;
}

const statusColors = {
    kritik: 'bg-rose-100 text-rose-800',
    azalıyor: 'bg-amber-100 text-amber-800',
    tükendi: 'bg-rose-100 text-rose-800',
    normal: 'bg-green-100 text-green-800',
};

export default function StockSummary({
    stockLevels = {
        inStock: 152,
        lowStock: 28,
        outOfStock: 5,
        onOrder: 12,
    },
    criticalItems = [
        {
            code: 'KS-145',
            name: 'Gümüş Kolye',
            current: 2,
            minimum: 10,
            status: 'kritik',
        },
        {
            code: 'KS-287',
            name: 'Altın Kaplama Bilezik',
            current: 5,
            minimum: 8,
            status: 'azalıyor',
        },
        {
            code: 'KS-302',
            name: 'Çelik Erkek Yüzük',
            current: 0,
            minimum: 5,
            status: 'tükendi',
        },
    ],
    isLoading = false,
}: StockSummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mt-2 sm:mt-0"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, index) => (
                        <div key={index} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mt-1"></div>
                                </div>
                                <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                            </div>
                            <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mt-1"></div>
                        </div>
                    ))}
                </div>

                <div className="mt-6">
                    <div className="h-5 w-36 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="space-y-2">
                        {[...Array(3)].map((_, index) => (
                            <div key={index} className="h-10 bg-gray-200 rounded animate-pulse"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <h3 className="text-base sm:text-lg font-medium text-gray-800">
                    Stok Durumu Özeti
                </h3>
                <div className="mt-2 sm:mt-0">
                    <Link
                        href="/admin/inventory"
                        className="inline-flex items-center text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        Stok Yönetimi
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <motion.div
                    className="p-4 rounded-lg bg-green-50 border border-green-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-600">Stokta</p>
                            <p className="mt-1 text-2xl font-bold text-green-700">{stockLevels.inStock}</p>
                        </div>
                        <div className="bg-green-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-green-700">Yeterli stok mevcut</p>
                </motion.div>

                <motion.div
                    className="p-4 rounded-lg bg-amber-50 border border-amber-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-amber-600">Azalan</p>
                            <p className="mt-1 text-2xl font-bold text-amber-700">{stockLevels.lowStock}</p>
                        </div>
                        <div className="bg-amber-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-amber-700">Stok kontrol edilmeli</p>
                </motion.div>

                <motion.div
                    className="p-4 rounded-lg bg-rose-50 border border-rose-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-rose-600">Tükenen</p>
                            <p className="mt-1 text-2xl font-bold text-rose-700">{stockLevels.outOfStock}</p>
                        </div>
                        <div className="bg-rose-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-rose-700">Acil sipariş verilmeli</p>
                </motion.div>

                <motion.div
                    className="p-4 rounded-lg bg-blue-50 border border-blue-100"
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-600">Sipariş Bekleyen</p>
                            <p className="mt-1 text-2xl font-bold text-blue-700">{stockLevels.onOrder}</p>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8" />
                            </svg>
                        </div>
                    </div>
                    <p className="mt-1 text-xs text-blue-700">Tedarikçi siparişleri</p>
                </motion.div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Kritik Stok Ürünleri</h4>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Kodu</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ürün Adı</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mevcut</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minimum</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {criticalItems.map((item, index) => (
                                <motion.tr
                                    key={item.code}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    whileHover={{ backgroundColor: '#f9fafb' }}
                                >
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.code}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.current}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-gray-800">{item.minimum}</td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[item.status]}`}>
                                            {item.status === 'kritik' ? 'Kritik' :
                                                item.status === 'azalıyor' ? 'Azalıyor' :
                                                    item.status === 'tükendi' ? 'Tükendi' : 'Normal'}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
} 