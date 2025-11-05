import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/firebaseServices';

// Tüm ürünleri getir
export async function GET(request: NextRequest) {
    try {
        const products = await productService.getAll();

        return NextResponse.json({ success: true, data: products });
    } catch (error) {
        console.error('Ürün listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni ürün ekle
export async function POST(request: NextRequest) {
    try {

        const data = await request.json();

        // Price alanını temizle (artık kullanılmıyor)
        if (data.price !== undefined) {
            delete data.price;
        }

        // Zorunlu alanları kontrol et
        if (!data.name || !data.salePrice || !data.category) {
            return NextResponse.json(
                { success: false, error: 'Ürün adı, satış fiyatı ve kategori alanları zorunludur' },
                { status: 400 }
            );
        }

        // Sayısal değerleri kontrol et
        const wholesalePrice = parseFloat(data.wholesalePrice);
        const salePrice = parseFloat(data.salePrice);
        const stock = parseInt(data.stock);

        if (
            (data.wholesalePrice && isNaN(wholesalePrice)) ||
            isNaN(salePrice) ||
            (data.stock && isNaN(stock))
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri sayısal olmalıdır' },
                { status: 400 }
            );
        }

        // Negatif değer kontrolü
        if (
            (data.wholesalePrice && wholesalePrice < 0) ||
            salePrice < 0 ||
            (data.stock && stock < 0)
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri negatif olamaz' },
                { status: 400 }
            );
        }

        // Yeni ürün oluştur (Firebase)
        const newProduct = await productService.create({
            ...data,
            wholesalePrice: data.wholesalePrice ? wholesalePrice : undefined,
            salePrice,
            stock: data.stock ? stock : 0
        });

        return NextResponse.json(
            { success: true, data: newProduct },
            { status: 201 }
        );
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 