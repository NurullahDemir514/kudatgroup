import { NextRequest, NextResponse } from 'next/server';
import { customerService, productService, newsletterService, saleService } from '@/services/firebaseServices';

/**
 * Dashboard verilerini getiren API endpoint'i (Firebase)
 */
export async function GET(request: NextRequest) {
    try {
        // Tarih filtreleri için parametreler
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get('period') || 'month';

        // Period parametresine göre tarih aralığı hesapla
        const now = new Date();
        let startDate = new Date();

        switch (periodParam) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }

        // Önceki periyot için tarih hesapla
        const previousStartDate = new Date(startDate);
        switch (periodParam) {
            case 'week':
                previousStartDate.setDate(previousStartDate.getDate() - 7);
                break;
            case 'month':
                previousStartDate.setMonth(previousStartDate.getMonth() - 1);
                break;
            case 'year':
                previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
                break;
        }

        // Tüm verileri Firebase'den getir
        const [allCustomers, allProducts, allNewsletters, allSales] = await Promise.all([
            customerService.getAll(),
            productService.getAll(),
            newsletterService.getAll(),
            saleService.getAll()
        ]);

        // Müşteri sayısı ve trend (client-side filtreleme)
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
            : 100;

        // Ürün sayısı ve trend
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
            : 100;

        // Newsletter sayısı ve trend
        const activeNewsletters = allNewsletters.filter((n: any) => n.active).length;
        const newNewsletters = allNewsletters.filter((n: any) => {
            const createdAt = n.subscriptionDate ? new Date(n.subscriptionDate) : new Date(0);
            return n.active && createdAt >= startDate;
        }).length;
        const previousPeriodNewsletters = allNewsletters.filter((n: any) => {
            const createdAt = n.subscriptionDate ? new Date(n.subscriptionDate) : new Date(0);
            return n.active && createdAt >= previousStartDate && createdAt < startDate;
        }).length;
        const newsletterTrend = previousPeriodNewsletters !== 0
            ? Math.round(((newNewsletters - previousPeriodNewsletters) / previousPeriodNewsletters) * 100)
            : 100;

        // Satış sayısı ve trend
        const totalSales = allSales.length;
        const newSales = allSales.filter((s: any) => {
            const saleDate = s.saleDate ? new Date(s.saleDate) : new Date(0);
            return saleDate >= startDate;
        }).length;
        const previousPeriodSales = allSales.filter((s: any) => {
            const saleDate = s.saleDate ? new Date(s.saleDate) : new Date(0);
            return saleDate >= previousStartDate && saleDate < startDate;
        }).length;
        const salesTrend = previousPeriodSales !== 0
            ? Math.round(((newSales - previousPeriodSales) / previousPeriodSales) * 100)
            : 100;

        // Son 5 müşteri
        const recentCustomers = allCustomers
            .sort((a: any, b: any) => {
                const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                return dateB - dateA;
            })
            .slice(0, 5);

        // Dashboard verilerini döndür
        const dashboardData = {
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
            newsletters: {
                total: activeNewsletters,
                new: newNewsletters,
                trend: newsletterTrend
            },
            sales: {
                total: totalSales,
                new: newSales,
                trend: salesTrend
            },
            recentCustomers: recentCustomers.map((c: any) => ({
                id: c.id || c._id,
                name: c.name,
                email: c.email,
                phone: c.phone,
                createdAt: c.createdAt
            })),
            period: periodParam
        };

        return NextResponse.json({
            success: true,
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message || 'Dashboard verileri yüklenirken bir hata oluştu'
            },
            { status: 500 }
        );
    }
}
