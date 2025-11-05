import { NextRequest, NextResponse } from 'next/server';
import { saleService, productService } from '@/services/firebaseServices';

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
        const { id } = params;
        const sale = await saleService.getById(id);

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
        const { id } = params;
        const data = await request.json();

        // Satışı bul
        const existingSale = await saleService.getById(id);
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

            // Ürünü Firebase'den al
            const product = await productService.getById(item.product);
            if (!product) {
                return NextResponse.json(
                    { success: false, error: `Ürün bulunamadı: ${item.product}` },
                    { status: 404 }
                );
            }

            // Ürün bilgilerini ekle/güncelle
            item.productName = product.name;
            item.unitPrice = product.salePrice;
            item.totalPrice = product.salePrice * item.quantity;

            // NaN kontrolü
            if (isNaN(item.totalPrice)) {
                item.totalPrice = 0;
            }

            // Toplam tutarı güncelle
            calculatedTotal += item.totalPrice;
        }

        // Toplam tutarı güncelle
        // Varsa indirim ve vergi hesabını da dahil et
        const discountAmount = data.discountAmount || 0;
        const taxRate = data.taxRate || 18;

        const subTotal = calculatedTotal;
        const taxAmount = (subTotal - discountAmount) * (taxRate / 100);
        let totalAmount = subTotal - discountAmount + taxAmount;

        // NaN kontrolü
        if (isNaN(totalAmount)) {
            totalAmount = 0;
        }

        // Toplam tutarı güncelle
        data.totalAmount = totalAmount;

        // Satışı Firebase'de güncelle
        const updatedSale = await saleService.update(id, data);

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
        const { id } = params;

        // Satışı Firebase'den sil
        await saleService.delete(id);

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