"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import customers from "@/data/customers.json";
import products from "@/data/products.json";
import newsletters from "@/data/newsletters.json";
import campaigns from "@/data/campaigns.json";

// Özet kartı bileşeni
function SummaryCard({
    title,
    value,
    description,
    icon,
    link,
    trend,
    gradientFrom = "from-gray-300",
    gradientTo = "to-gray-400"
}: {
    title: string;
    value: number | string;
    description?: string;
    icon: React.ReactNode;
    link: string;
    trend?: { value: number; positive: boolean };
    gradientFrom?: string;
    gradientTo?: string;
}) {
    return (
        <Link
            href={link}
            className="rounded-xl bg-black bg-opacity-40 border border-gray-800 p-4 sm:p-6 transition-all hover:border-gray-400/30 hover:shadow-lg hover:shadow-gray-400/5 backdrop-blur-sm"
        >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                    <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r ${gradientFrom} ${gradientTo} bg-opacity-20 text-gray-900`}>
                        {icon}
                    </div>
                    <h3 className="ml-2 sm:ml-3 text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-400">{title}</h3>
                </div>
                {trend && (
                    <div className={`text-xs sm:text-sm ${trend.positive ? 'text-emerald-400' : 'text-rose-400'} flex items-center`}>
                        <span className="mr-1">
                            {trend.positive ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            )}
                        </span>
                        {trend.value}%
                    </div>
                )}
            </div>
            <div className="mb-1 text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                {value}
            </div>
            {description && <p className="text-xs sm:text-sm text-gray-500">{description}</p>}
        </Link>
    );
}

// Veri tablosu bileşeni
function DataTable({
    title,
    columns,
    data,
    viewAllLink,
    viewAllText,
    renderRow
}: {
    title: string;
    columns: { key: string; label: string }[];
    data: any[];
    viewAllLink: string;
    viewAllText: string;
    renderRow: (item: any, index: number) => React.ReactNode;
}) {
    return (
        <div className="rounded-xl bg-black bg-opacity-40 border border-gray-800 backdrop-blur-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-800">
                <h2 className="text-base sm:text-lg font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                    {title}
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-900/50">
                        <tr className="text-left">
                            {columns.map((column) => (
                                <th key={column.key} className="px-3 sm:px-6 py-2 sm:py-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                                    {column.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {data.map((item, index) => renderRow(item, index))}
                    </tbody>
                </table>
            </div>
            <div className="p-3 sm:p-4 border-t border-gray-800 text-right">
                <Link
                    href={viewAllLink}
                    className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-300 hover:text-white"
                >
                    {viewAllText}
                    <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 sm:ml-1.5 h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </Link>
            </div>
        </div>
    );
}

// Skelaton yükleme göstergesi
function SkeletonLoader() {
    return (
        <div className="space-y-6 sm:space-y-8 animate-pulse">
            <div className="h-10 bg-gray-800 rounded w-1/3"></div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-64 bg-gray-800 rounded-xl"></div>
                ))}
            </div>

            <div className="h-64 bg-gray-800 rounded-xl"></div>
        </div>
    );
}

export default function AdminDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

    // Dashboard verilerini API'den getir
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/dashboard?period=${period}`);
                const data = await response.json();

                if (data.success) {
                    setDashboardData(data);
                    setError(null);
                } else {
                    setError(data.error || "Veriler yüklenirken bir hata oluştu");
                }
            } catch (error) {
                setError("Sunucu ile bağlantı kurulamadı");
                console.error(error);
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

    // Yükleme durumunda gösterilecek içerik
    if (loading) {
        return <SkeletonLoader />;
    }

    // Hata durumunda gösterilecek içerik
    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <div className="text-rose-400 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 sm:h-16 sm:w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">Veriler Yüklenemedi</h3>
                    <p className="text-sm sm:text-base text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={() => setPeriod(period)}
                        className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    // Veri başarıyla yüklendiğinde, değişkenleri al
    const { summary, recentCustomers, campaignStats } = dashboardData;

    return (
        <div className="space-y-6 sm:space-y-8">
            <div className="flex flex-col space-y-4 sm:space-y-6 md:space-y-0 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-400">
                        Hoş Geldiniz!
                    </h1>
                    <p className="mt-1 text-sm sm:text-base text-gray-400">Kudat Steel Jewelry yönetim panelinde son durumu görebilirsiniz.</p>
                </div>
                <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
                    <div className="flex space-x-1 bg-gray-800 bg-opacity-50 rounded-lg p-1">
                        {[
                            { value: 'week', label: 'Hafta' },
                            { value: 'month', label: 'Ay' },
                            { value: 'year', label: 'Yıl' }
                        ].map((option) => (
                            <button
                                key={option.value}
                                onClick={() => handlePeriodChange(option.value as 'week' | 'month' | 'year')}
                                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md ${period === option.value
                                    ? 'bg-gray-700 text-white'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="flex space-x-2 sm:space-x-3">
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gray-500/10 text-gray-300 border border-gray-500/30 hover:bg-gray-500/20 transition-colors flex items-center text-xs sm:text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Rapor İndir
                        </button>
                        <button className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900 font-medium hover:from-gray-400 hover:to-gray-500 transition-colors flex items-center text-xs sm:text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Yeni Ürün
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard
                    title="Toplam Müşteri"
                    value={summary.customers.total}
                    description={`Son ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    }
                    link="/admin/customers"
                    trend={summary.customers.trend}
                />
                <SummaryCard
                    title="Toplam Ürün"
                    value={summary.products.total}
                    description="Stokta mevcut"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    }
                    link="/admin/products"
                    trend={summary.products.trend}
                    gradientFrom="from-rose-300"
                    gradientTo="to-rose-400"
                />
                <SummaryCard
                    title="Aktif Aboneler"
                    value={summary.subscribers.total}
                    description="E-bülten abonelikleri"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                    link="/admin/newsletters"
                    trend={summary.subscribers.trend}
                    gradientFrom="from-blue-300"
                    gradientTo="to-blue-400"
                />
                <SummaryCard
                    title="Toplam Satış"
                    value={summary.sales.total}
                    description={`Bu ${period === 'week' ? 'hafta' : period === 'month' ? 'ay' : 'yıl'}`}
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                    link="/admin/sales"
                    trend={summary.sales.trend}
                    gradientFrom="from-emerald-300"
                    gradientTo="to-emerald-400"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                {/* Son Müşteriler */}
                <DataTable
                    title="Son Eklenen Müşteriler"
                    columns={[
                        { key: "name", label: "İsim" },
                        { key: "email", label: "Email" },
                        { key: "date", label: "Kayıt Tarihi" },
                    ]}
                    data={recentCustomers}
                    viewAllLink="/admin/customers"
                    viewAllText="Tüm müşterileri görüntüle"
                    renderRow={(customer, index) => (
                        <tr key={customer._id} className={`${index % 2 === 0 ? 'bg-black bg-opacity-20' : ''} hover:bg-gray-800/40 transition-colors`}>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-gradient-to-r from-gray-700 to-gray-800 flex items-center justify-center text-gray-300 text-xs sm:text-sm">
                                        {customer.name.charAt(0)}
                                    </div>
                                    <div className="ml-2 sm:ml-3">
                                        <p className="text-xs sm:text-sm font-medium text-gray-200">{customer.name}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <p className="text-xs sm:text-sm text-gray-400">{customer.email}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <p className="text-xs sm:text-sm text-gray-400">
                                    {new Date(customer.createdAt).toLocaleDateString("tr-TR")}
                                </p>
                            </td>
                        </tr>
                    )}
                />

                {/* Kampanya İstatistikleri */}
                <DataTable
                    title="Kampanya İstatistikleri"
                    columns={[
                        { key: "name", label: "Kampanya" },
                        { key: "status", label: "Durum" },
                        { key: "sent", label: "Gönderilen" },
                        { key: "rate", label: "Tıklama Oranı" },
                    ]}
                    data={campaignStats}
                    viewAllLink="/admin/campaigns"
                    viewAllText="Tüm kampanyaları görüntüle"
                    renderRow={(campaign, index) => (
                        <tr key={campaign._id} className={`${index % 2 === 0 ? 'bg-black bg-opacity-20' : ''} hover:bg-gray-800/40 transition-colors`}>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <p className="text-xs sm:text-sm font-medium text-gray-200">{campaign.name}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <span
                                    className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${campaign.status === "active"
                                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700"
                                        : campaign.status === "completed"
                                            ? "bg-gray-800 text-gray-400 border border-gray-700"
                                            : "bg-gray-900/30 text-gray-300 border border-gray-700"
                                        }`}
                                >
                                    {campaign.status === "active" ? (
                                        <>
                                            <span className="w-1 h-1 mr-1 sm:mr-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                                            Aktif
                                        </>
                                    ) : campaign.status === "completed" ? (
                                        "Tamamlandı"
                                    ) : (
                                        "Planlandı"
                                    )}
                                </span>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <p className="text-xs sm:text-sm text-gray-400">{campaign.sentEmails}</p>
                            </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="w-10 sm:w-16 bg-gray-800 rounded-full h-1.5 sm:h-2.5 mr-1 sm:mr-2">
                                        <div
                                            className="bg-gradient-to-r from-gray-300 to-gray-400 h-1.5 sm:h-2.5 rounded-full"
                                            style={{ width: `${campaign.clickRate}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-xs sm:text-sm text-gray-400">
                                        {campaign.clickRate > 0 ? `%${campaign.clickRate}` : "-"}
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>
        </div>
    );
} 