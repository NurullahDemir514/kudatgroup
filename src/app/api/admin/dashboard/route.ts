import { NextResponse } from 'next/server';
import { customerService, productService, newsletterService, saleService } from '@/services/firebaseServices';

// Dashboard verilerini getirir (Firebase)
export async function GET(request: Request) {
    try {
        // URL'den sorgu parametrelerini al
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'month';

        // Tarih aralığını belirle
        const today = new Date();
        let startDate: Date;

        if (period === 'week') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
        } else if (period === 'month') {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 30);
        } else {
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 365);
        }

        // Önceki periyot için tarih hesapla
        const previousStartDate = new Date(startDate);
        if (period === 'week') {
            previousStartDate.setDate(previousStartDate.getDate() - 7);
        } else if (period === 'month') {
            previousStartDate.setDate(previousStartDate.getDate() - 30);
        } else {
            previousStartDate.setDate(previousStartDate.getDate() - 365);
        }

        // Tüm verileri Firebase'den getir
        const [allCustomers, allProducts, allNewsletters, allSales] = await Promise.all([
            customerService.getAll(),
            productService.getAll(),
            newsletterService.getAll(),
            saleService.getAll()
        ]);

        // Müşteri istatistikleri
        const totalCustomers = allCustomers.length;
        const newCustomers = allCustomers.filter((c: any) => {
            const createdAt = c.createdAt ? new Date(c.createdAt) : new Date(0);
            return createdAt >= startDate;
        }).length;
        const previousPeriodCustomers = allCustomers.filter((c: any) => {
            const createdAt = c.createdAt ? new Date(c.createdAt) : new Date(0);
            return createdAt >= previousStartDate && createdAt < startDate;
        }).length;
        const customerTrend = previousPeriodCustomers !== 0
            ? Math.round(((newCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100)
            : newCustomers > 0 ? 100 : 0;

        // Ürün istatistikleri
        const totalProducts = allProducts.length;
        const newProducts = allProducts.filter((p: any) => {
            const createdAt = p.createdAt ? new Date(p.createdAt) : new Date(0);
            return createdAt >= startDate;
        }).length;
        const previousPeriodProducts = allProducts.filter((p: any) => {
            const createdAt = p.createdAt ? new Date(p.createdAt) : new Date(0);
            return createdAt >= previousStartDate && createdAt < startDate;
        }).length;
        const productTrend = previousPeriodProducts !== 0
            ? Math.round(((newProducts - previousPeriodProducts) / previousPeriodProducts) * 100)
            : newProducts > 0 ? 100 : 0;

        // Newsletter istatistikleri
        const activeNewsletters = allNewsletters.filter((n: any) => n.active).length;
        const newNewsletters = allNewsletters.filter((n: any) => {
            const subscriptionDate = n.subscriptionDate ? new Date(n.subscriptionDate) : new Date(0);
            return n.active && subscriptionDate >= startDate;
        }).length;
        const previousPeriodNewsletters = allNewsletters.filter((n: any) => {
            const subscriptionDate = n.subscriptionDate ? new Date(n.subscriptionDate) : new Date(0);
            return n.active && subscriptionDate >= previousStartDate && subscriptionDate < startDate;
        }).length;
        const newsletterTrend = previousPeriodNewsletters !== 0
            ? Math.round(((newNewsletters - previousPeriodNewsletters) / previousPeriodNewsletters) * 100)
            : newNewsletters > 0 ? 100 : 0;

        // Satış istatistikleri
        const totalSales = allSales.length;
        const recentSales = allSales.filter((s: any) => {
            const saleDate = s.saleDate ? new Date(s.saleDate) : new Date(0);
            return saleDate >= startDate;
        });
        const newSalesCount = recentSales.length;
        const previousPeriodSales = allSales.filter((s: any) => {
            const saleDate = s.saleDate ? new Date(s.saleDate) : new Date(0);
            return saleDate >= previousStartDate && saleDate < startDate;
        }).length;
        const salesTrend = previousPeriodSales !== 0
            ? Math.round(((newSalesCount - previousPeriodSales) / previousPeriodSales) * 100)
            : newSalesCount > 0 ? 100 : 0;

        // Toplam satış tutarı
        const totalRevenue = recentSales.reduce((sum: number, sale: any) => {
            return sum + (sale.totalAmount || 0);
        }, 0);
        const previousRevenue = allSales
            .filter((s: any) => {
                const saleDate = s.saleDate ? new Date(s.saleDate) : new Date(0);
                return saleDate >= previousStartDate && saleDate < startDate;
            })
            .reduce((sum: number, sale: any) => sum + (sale.totalAmount || 0), 0);
        const revenueTrend = previousRevenue !== 0
            ? Math.round(((totalRevenue - previousRevenue) / previousRevenue) * 100)
            : totalRevenue > 0 ? 100 : 0;

        // Son müşteriler
        const recentCustomers = allCustomers
            .sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5)
            .map((c: any) => ({
                id: c.id || c._id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                createdAt: c.createdAt
            }));

        // Satış grafiği verileri (günlük)
        const salesByDate: { [key: string]: number } = {};
        recentSales.forEach((sale: any) => {
            const saleDate = sale.saleDate ? new Date(sale.saleDate) : new Date();
            const dateKey = saleDate.toISOString().split('T')[0];
            salesByDate[dateKey] = (salesByDate[dateKey] || 0) + (sale.totalAmount || 0);
        });

        const sortedDates = Object.keys(salesByDate).sort();
        const salesChartData = {
            labels: sortedDates.map(date => {
                const d = new Date(date);
                return `${d.getDate()}/${d.getMonth() + 1}`;
            }),
            datasets: [
                {
                    label: 'Satışlar',
                    data: sortedDates.map(date => salesByDate[date])
                }
            ]
        };

        // Dashboard yanıtı
        const response = {
            success: true,
            summary: {
                customers: {
                    total: totalCustomers,
                    new: newCustomers,
                    trend: customerTrend
                },
                products: {
                    total: totalProducts,
                    new: newProducts,
                    trend: productTrend
                },
                subscribers: {
                    total: activeNewsletters,
                    new: newNewsletters,
                    trend: newsletterTrend
                },
                sales: {
                    total: newSalesCount,
                    revenue: totalRevenue,
                    trend: salesTrend,
                    revenueTrend: revenueTrend
                }
            },
            recentCustomers,
            salesChart: salesChartData,
            recentActivities: [],
            period
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Dashboard yükleme hatası:', error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message || 'Dashboard verileri yüklenirken bir hata oluştu'
            },
            { status: 500 }
        );
    }
}
