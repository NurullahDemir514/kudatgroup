import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Sale from '@/models/Sale';
import Newsletter from '@/models/Newsletter';
import Product from '@/models/Product';

// Veritabanından dashboard verilerini getirir
export async function GET(request: Request) {
    try {
        // Veritabanına bağlan
        await connectToDatabase();

        // URL'den sorgu parametrelerini al
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';

        // Tarih aralığını belirle
        const today = new Date();
        let startDate: Date;

        if (period === 'week') {
            // Son 7 gün
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
        } else if (period === 'month') {
            // Son 30 gün
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
        } else {
            // Son 365 gün (yıl)
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 365);
        }

        // Veritabanı sorgularını paralel çalıştır
        const [totalCustomers, totalProducts, totalSubscribers, recentCustomers, salesData] = await Promise.all([
            // Toplam müşteri sayısı
            Customer.countDocuments(),

            // Toplam ürün sayısı
            Product.countDocuments(),

            // Toplam abone sayısı
            Newsletter.countDocuments({ active: true }),

            // Son eklenen müşteriler
            Customer.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('name email createdAt'),

            // Satış verileri
            Sale.find({
                saleDate: { $gte: startDate }
            })
                .sort({ saleDate: -1 })
                .select('saleDate totalAmount items orderStatus')
        ]);

        // Dönem içi müşteri sayısı
        const periodCustomers = await Customer.countDocuments({
            createdAt: { $gte: startDate }
        });

        // Dönem içi abone sayısı
        const periodSubscribers = await Newsletter.countDocuments({
            createdAt: { $gte: startDate },
            active: true
        });

        // Toplam satış tutarı hesapla
        const totalSalesAmount = salesData.reduce((total, sale) => total + sale.totalAmount, 0);

        // Önceki dönem satış tutarını hesapla (trend için)
        let previousPeriodStartDate: Date;
        if (period === 'week') {
            previousPeriodStartDate = new Date(startDate);
            previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 7);
        } else if (period === 'month') {
            previousPeriodStartDate = new Date(startDate);
            previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 30);
        } else {
            previousPeriodStartDate = new Date(startDate);
            previousPeriodStartDate.setDate(previousPeriodStartDate.getDate() - 365);
        }

        const previousSales = await Sale.find({
            saleDate: { $gte: previousPeriodStartDate, $lt: startDate }
        }).select('totalAmount');

        const previousSalesAmount = previousSales.reduce((total, sale) => total + sale.totalAmount, 0);

        // Trend hesapla (yüzde değişim)
        const calculateTrend = (current: number, previous: number) => {
            if (previous === 0) return { value: 100, positive: true };
            const percentChange = Math.round(((current - previous) / previous) * 100);
            return { value: Math.abs(percentChange), positive: percentChange >= 0 };
        };

        // Grafik verileri için satışları tarihe göre grupla
        let labels: string[] = [];
        let salesByPeriod: number[] = [];

        if (period === 'week') {
            // Son 7 günün verileri
            labels = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
            const salesByDay = new Array(7).fill(0);

            salesData.forEach(sale => {
                const day = new Date(sale.saleDate).getDay(); // 0-6 (Pazar-Cumartesi)
                const adjustedIndex = day === 0 ? 6 : day - 1; // 0-6 (Pazartesi-Pazar)
                salesByDay[adjustedIndex] += sale.totalAmount;
            });

            salesByPeriod = salesByDay;
        } else if (period === 'month') {
            // Son 4 haftanın verileri
            labels = ['Hafta 1', 'Hafta 2', 'Hafta 3', 'Hafta 4'];
            const salesByWeek = new Array(4).fill(0);

            salesData.forEach(sale => {
                const weeksSinceStart = Math.floor((new Date(sale.saleDate).getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
                if (weeksSinceStart >= 0 && weeksSinceStart < 4) {
                    salesByWeek[weeksSinceStart] += sale.totalAmount;
                }
            });

            salesByPeriod = salesByWeek;
        } else {
            // Son 12 ayın verileri
            labels = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            const salesByMonth = new Array(12).fill(0);

            salesData.forEach(sale => {
                const saleMonth = new Date(sale.saleDate).getMonth(); // 0-11
                salesByMonth[saleMonth] += sale.totalAmount;
            });

            salesByPeriod = salesByMonth;
        }

        // Son aktiviteler (satışlar ve müşteri kayıtları)
        const recentSales = await Sale.find()
            .sort({ createdAt: -1 })
            .limit(4)
            .select('customerName totalAmount saleDate orderStatus createdAt');

        // Aktiviteleri formatla
        const recentActivities = recentSales.map((sale, index) => {
            return {
                id: sale._id,
                title: 'Yeni sipariş alındı',
                description: `${sale.customerName} ${sale.totalAmount.toLocaleString('tr-TR')} ₺ tutarında sipariş verdi`,
                time: formatTimeAgo(sale.createdAt),
                status: sale.orderStatus === 'Tamamlandı' ? 'success' :
                    sale.orderStatus === 'İşlemde' ? 'info' :
                        sale.orderStatus === 'Kargoda' ? 'warning' : 'error',
                user: { name: 'Sipariş Sistemi' },
                originalData: sale // Orijinal veriyi de koruyalım
            };
        });

        // API yanıtını hazırla
        const response = {
            success: true,
            summary: {
                customers: {
                    total: totalCustomers,
                    trend: calculateTrend(periodCustomers, totalCustomers - periodCustomers)
                },
                products: {
                    total: totalProducts,
                    trend: { value: 0, positive: true } // Ürün trendi mevcut değil, sabit değer
                },
                subscribers: {
                    total: totalSubscribers,
                    trend: calculateTrend(periodSubscribers, totalSubscribers - periodSubscribers)
                },
                sales: {
                    total: totalSalesAmount.toLocaleString('tr-TR'),
                    trend: calculateTrend(totalSalesAmount, previousSalesAmount)
                }
            },
            recentCustomers: recentCustomers,
            recentSales: recentSales, // Son siparişleri doğrudan ekle
            salesChart: {
                labels: labels,
                datasets: [
                    {
                        label: 'Satışlar',
                        data: salesByPeriod,
                    }
                ]
            },
            recentActivities: recentActivities
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Dashboard API hatası:', error);
        return NextResponse.json(
            { success: false, error: 'Sunucu hatası oluştu' },
            { status: 500 }
        );
    }
}

// Tarih formatlayıcı yardımcı fonksiyon
function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} saniye önce`;

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} gün önce`;

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `${diffInMonths} ay önce`;

    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} yıl önce`;
} 