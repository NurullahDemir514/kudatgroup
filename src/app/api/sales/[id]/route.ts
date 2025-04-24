import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Sale } from '@/models/Sale';
import { Product } from '@/models/Product';

interface RouteParams {
    params: {
        id: string;
    };
}

// Belirli bir satışı getir
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const sale = await Sale.findById(id).populate('items.product');

        if (!sale) {
            return NextResponse.json(
                { success: false, error: 'Satış kaydı bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: sale });
    } catch (error) {
        console.error('Satış getirme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Satışı güncelle
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const data = await request.json();

        // Satışı bul
        const existingSale = await Sale.findById(id);
        if (!existingSale) {
            return NextResponse.json(
                { success: false, error: 'Satış kaydı bulunamadı' },
                { status: 404 }
            );
        }

        // Gelen veriyi doğrula
        if (!data.customerName || !data.items || !data.items.length) {
            return NextResponse.json(
                { success: false, error: 'Müşteri adı ve en az bir ürün zorunludur' },
                { status: 400 }
            );
        }

        // Toplam tutarı hesapla
        let calculatedTotal = 0;

        for (const item of data.items) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return NextResponse.json(
                    { success: false, error: 'Her ürün için geçerli bir ürün ID ve miktar gereklidir' },
                    { status: 400 }
                );
            }

            // Ürünü veritabanından al
            const product = await Product.findById(item.product);
            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Ürün bulunamadı: ${item.product}` },
                    { status: 404 }
                );
            }

            // Ürün bilgilerini ekle/güncelle
            item.productName = product.name;
            item.unitPrice = product.price;
            item.totalPrice = product.price * item.quantity;

            // Toplam tutarı güncelle
            calculatedTotal += item.totalPrice;
        }

        // Toplam tutarı güncelle
        data.totalAmount = calculatedTotal;

        // Satışı güncelle
        const updatedSale = await Sale.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        return NextResponse.json({ success: true, data: updatedSale });
    } catch (error) {
        console.error('Satış güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Satışı sil
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;

        // Satışı bul ve sil
        const deletedSale = await Sale.findByIdAndDelete(id);

        if (!deletedSale) {
            return NextResponse.json(
                { success: false, error: 'Satış kaydı bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Satış kaydı başarıyla silindi'
        });
    } catch (error) {
        console.error('Satış silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 