import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Customer from '@/models/Customer';
import Product from '@/models/Product';
import Newsletter from '@/models/Newsletter';
import Sale from '@/models/Sale';

/**
 * Dashboard verilerini getiren API endpoint'i
 * 
 * Döndürülen veriler:
 * - Toplam müşteri sayısı ve artış oranı
 * - Toplam ürün sayısı ve artış oranı
 * - Aktif e-bülten aboneleri ve artış oranı
 * - Toplam satış ve artış oranı
 * - Son 5 müşteri
 * - Son 5 kampanya
 */
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // Tarih filtreleri için parametreler
        const { searchParams } = new URL(request.url);
        const periodParam = searchParams.get('period') || 'month'; // 'week', 'month', 'year'

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
        const previousEndDate = new Date(startDate);

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

        // Müşteri sayısı ve trend
        const totalCustomers = await Customer.countDocuments();
        const newCustomers = await Customer.countDocuments({
            createdAt: { $gte: startDate }
        });
        const previousPeriodCustomers = await Customer.countDocuments({
            createdAt: { $gte: previousStartDate, $lt: startDate }
        });

        // Müşteri trend hesaplaması
        const customerTrend = previousPeriodCustomers !== 0
            ? Math.round(((newCustomers - previousPeriodCustomers) / previousPeriodCustomers) * 100)
            : 100; // Önceki dönemde müşteri yoksa %100 artış sayılır

        // Ürün sayısı ve trend
        const totalProducts = await Product.countDocuments();
        const newProducts = await Product.countDocuments({
            createdAt: { $gte: startDate }
        });
        const previousPeriodProducts = await Product.countDocuments({
            createdAt: { $gte: previousStartDate, $lt: startDate }
        });

        // Ürün trend hesaplaması
        const productTrend = previousPeriodProducts !== 0
            ? Math.round(((newProducts - previousPeriodProducts) / previousPeriodProducts) * 100)
            : 100;

        // Aktif aboneler ve trend
        const activeSubscribers = await Newsletter.countDocuments({ active: true });
        const newSubscribers = await Newsletter.countDocuments({
            subscriptionDate: { $gte: startDate },
            active: true
        });
        const previousPeriodSubscribers = await Newsletter.countDocuments({
            subscriptionDate: { $gte: previousStartDate, $lt: startDate },
            active: true
        });

        // Abone trend hesaplaması
        const subscriberTrend = previousPeriodSubscribers !== 0
            ? Math.round(((newSubscribers - previousPeriodSubscribers) / previousPeriodSubscribers) * 100)
            : 100;


        // Satış istatistikleri
        const periodSales = await Sale.aggregate([
            {
                $match: {
                    orderStatus: 'Tamamlandı',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const previousPeriodSales = await Sale.aggregate([
            {
                $match: {
                    orderStatus: 'Tamamlandı',
                    createdAt: { $gte: previousStartDate, $lt: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$totalAmount' }
                }
            }
        ]);

        const currentPeriodTotal = periodSales.length > 0 ? periodSales[0].total : 0;
        const previousPeriodTotal = previousPeriodSales.length > 0 ? previousPeriodSales[0].total : 0;

        // Satış trend hesaplaması
        const salesTrend = previousPeriodTotal !== 0
            ? Math.round(((currentPeriodTotal - previousPeriodTotal) / previousPeriodTotal) * 100)
            : 100;

        // Toplam satış tutarını formatla
        const formatter = new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
        });

        const totalSales = formatter.format(currentPeriodTotal);

        // Son eklenen 5 müşteri
        const recentCustomers = await Customer.find()
            .sort({ createdAt: -1 })
            .limit(5);

        // Tüm verileri döndür
        return NextResponse.json({
            success: true,
            period: periodParam,
            summary: {
                customers: {
                    total: totalCustomers,
                    trend: { value: Math.abs(customerTrend), positive: customerTrend >= 0 }
                },
                products: {
                    total: totalProducts,
                    trend: { value: Math.abs(productTrend), positive: productTrend >= 0 }
                },
                subscribers: {
                    total: activeSubscribers,
                    trend: { value: Math.abs(subscriberTrend), positive: subscriberTrend >= 0 }
                },
                sales: {
                    total: totalSales,
                    trend: { value: Math.abs(salesTrend), positive: salesTrend >= 0 }
                }
            },
            recentCustomers
        });
    } catch (error) {
        console.error('Dashboard verileri yüklenirken hata:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 