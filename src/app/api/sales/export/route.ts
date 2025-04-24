import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sale } from '@/models/Sale';
import * as XLSX from 'xlsx';

// Excel'e aktarma fonksiyonu
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // URL parametrelerini al
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerName = searchParams.get('customerName');

        // Filtre koşullarını oluştur
        const filter: Record<string, any> = {};

        // Tarih aralığı filtresi
        if (startDate || endDate) {
            filter.saleDate = {};
            if (startDate) {
                filter.saleDate.$gte = new Date(startDate);
            }
            if (endDate) {
                // endDate için günün sonuna ayarla (23:59:59.999)
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                filter.saleDate.$lte = endOfDay;
            }
        }

        // Müşteri adı filtresi (kısmi eşleşme)
        if (customerName) {
            filter.customerName = { $regex: customerName, $options: 'i' };
        }

        // Satışları al
        const sales = await Sale.find(filter)
            .sort({ saleDate: -1 })
            .lean()
            .exec();

        // Excel verisi için düzleştirilmiş satırlar oluştur
        const rows: any[] = [];

        for (const sale of sales) {
            // Her satış kalemi için ayrı bir satır oluştur
            for (const item of sale.items) {
                rows.push({
                    "Satış ID": sale._id.toString(),
                    "Müşteri Adı": sale.customerName,
                    "Müşteri Telefon": sale.customerPhone || "-",
                    "Müşteri E-posta": sale.customerEmail || "-",
                    "Satış Tarihi": new Date(sale.saleDate).toLocaleDateString("tr-TR"),
                    "Ödeme Yöntemi": sale.paymentMethod,
                    "Ürün Adı": item.productName,
                    "Miktar": item.quantity,
                    "Birim Fiyat": item.unitPrice.toFixed(2) + " ₺",
                    "Toplam Fiyat": item.totalPrice.toFixed(2) + " ₺",
                });
            }

            // Satış için toplam satırı ekle
            rows.push({
                "Satış ID": sale._id.toString(),
                "Müşteri Adı": sale.customerName,
                "Müşteri Telefon": sale.customerPhone || "-",
                "Müşteri E-posta": sale.customerEmail || "-",
                "Satış Tarihi": new Date(sale.saleDate).toLocaleDateString("tr-TR"),
                "Ödeme Yöntemi": sale.paymentMethod,
                "Ürün Adı": "TOPLAM",
                "Miktar": "",
                "Birim Fiyat": "",
                "Toplam Fiyat": sale.totalAmount.toFixed(2) + " ₺",
            });

            // Boş satır ekle
            rows.push({});
        }

        // Excel çalışma kitabı oluştur
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(rows);

        // Çalışma sayfasına stil ekle
        const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
        worksheet['!cols'] = [
            { width: 24 },  // Satış ID
            { width: 20 },  // Müşteri Adı
            { width: 15 },  // Müşteri Telefon
            { width: 20 },  // Müşteri E-posta
            { width: 15 },  // Satış Tarihi
            { width: 15 },  // Ödeme Yöntemi
            { width: 25 },  // Ürün Adı
            { width: 10 },  // Miktar
            { width: 15 },  // Birim Fiyat
            { width: 15 },  // Toplam Fiyat
        ];

        // Çalışma kitabına ekle
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Satışlar');

        // Excel dosyasını oluştur (binary string)
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Dosyayı indirme olarak gönder
        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="satislar.xlsx"',
            },
        });
    } catch (error) {
        console.error('Excel export hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 