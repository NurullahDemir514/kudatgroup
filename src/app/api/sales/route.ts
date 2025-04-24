import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sale, ISale } from '@/models/Sale';
import { Product } from '@/models/Product';

// Tüm satışları al (filtreleme ve sıralama ile)
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // URL parametrelerini al
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const customerName = searchParams.get('customerName');
        const sortBy = searchParams.get('sortBy') || 'saleDate';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

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
            .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
            .populate('items.product')
            .exec();

        return NextResponse.json({ success: true, data: sales });
    } catch (error) {
        console.error('Satışları alma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni satış kaydet
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();
        const data = await request.json();

        // Gelen veriyi doğrula
        if (!data.customerName || !data.items || !data.items.length) {
            return NextResponse.json(
                { success: false, error: 'Müşteri adı ve en az bir ürün zorunludur' },
                { status: 400 }
            );
        }

        // Gerekli alanları kontrol et
        for (const item of data.items) {
            if (!item.product || !item.quantity) {
                return NextResponse.json(
                    { success: false, error: 'Her ürün için geçerli bir ürün ID ve miktar gereklidir' },
                    { status: 400 }
                );
            }

            // Sayısal değerlerin geçerliliğini kontrol et
            if (item.quantity <= 0 || isNaN(item.quantity)) {
                return NextResponse.json(
                    { success: false, error: 'Ürün miktarı geçerli ve pozitif bir sayı olmalıdır' },
                    { status: 400 }
                );
            }
        }

        // Toplam tutarı hesapla ve stok kontrolü yap
        let calculatedTotal = 0;
        const stockUpdates = [];

        for (const item of data.items) {
            // Ürünü veritabanından al
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Ürün bulunamadı: ${item.product}` },
                    { status: 404 }
                );
            }

            // Stok kontrolü
            if (product.stock < item.quantity) {
                return NextResponse.json(
                    {
                        success: false,
                        error: `Yetersiz stok: ${product.name}. Mevcut: ${product.stock}, İstenen: ${item.quantity}`
                    },
                    { status: 400 }
                );
            }

            // Ürün bilgilerini ekle
            item.productName = product.name;
            item.unitPrice = product.salePrice;
            item.totalPrice = product.salePrice * item.quantity;

            // Toplam tutarı güncelle
            calculatedTotal += item.totalPrice;

            // Stok güncellemelerini topla
            stockUpdates.push({
                id: product._id,
                newStock: product.stock - item.quantity
            });
        }

        // Toplam tutarı güncelle
        // Varsa indirim ve vergi hesabını da dahil et
        const discountAmount = data.discountAmount || 0;
        const taxRate = data.taxRate || 18;

        const subTotal = calculatedTotal;
        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        let totalAmount = subTotal - discountAmount + taxAmount;

        // NaN kontrol etme
        if (isNaN(totalAmount)) {
            totalAmount = 0;

            // Ayrıca her bir ürün için NaN kontrolü yap
            for (const item of data.items) {
                if (isNaN(item.totalPrice)) {
                    item.totalPrice = 0;
                }
                if (isNaN(item.unitPrice)) {
                    item.unitPrice = 0;
                }
            }
        }

        data.totalAmount = totalAmount;

        // Satış tarihi yoksa şimdi olarak ayarla
        if (!data.saleDate) {
            data.saleDate = new Date();
        }

        // Satışı kaydet
        const newSale = await Sale.create(data);

        // Ürün stoklarını güncelle
        for (const update of stockUpdates) {
            await Product.findByIdAndUpdate(update.id, { stock: update.newStock });
        }

        return NextResponse.json({ success: true, data: newSale }, { status: 201 });
    } catch (error) {
        console.error('Satış oluşturma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 