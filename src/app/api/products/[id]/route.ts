import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

interface RouteParams {
    params: {
        id: string;
    };
}

// Belirli bir ürünü getir
export async function GET(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const product = await Product.findById(id);

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Ürün bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: product });
    } catch (error) {
        console.error('Ürün getirme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Ürün güncelle
export async function PUT(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
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

        // Sayısal değerleri sayıya dönüştür
        if (data.wholesalePrice) data.wholesalePrice = Number(data.wholesalePrice);
        if (data.salePrice) data.salePrice = Number(data.salePrice);
        if (data.stock) data.stock = Number(data.stock);

        // Sayısal değerlerin doğruluğunu kontrol et
        if (
            (data.wholesalePrice !== undefined && isNaN(data.wholesalePrice)) ||
            isNaN(data.salePrice) ||
            (data.stock !== undefined && isNaN(data.stock))
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri sayısal olmalıdır' },
                { status: 400 }
            );
        }

        // Negatif değer kontrolü
        if (
            (data.wholesalePrice !== undefined && data.wholesalePrice < 0) ||
            data.salePrice < 0 ||
            (data.stock !== undefined && data.stock < 0)
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri negatif olamaz' },
                { status: 400 }
            );
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json(
                { success: false, error: 'Ürün bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Ürün kısmi güncelleme
export async function PATCH(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const data = await request.json();

        // Price alanını temizle (artık kullanılmıyor)
        if (data.price !== undefined) {
            delete data.price;
        }

        // Sayısal değerleri sayıya dönüştür
        if (data.wholesalePrice !== undefined) data.wholesalePrice = Number(data.wholesalePrice);
        if (data.salePrice !== undefined) data.salePrice = Number(data.salePrice);
        if (data.stock !== undefined) data.stock = Number(data.stock);

        // Sayısal değerlerin doğruluğunu kontrol et
        if (
            (data.wholesalePrice !== undefined && isNaN(data.wholesalePrice)) ||
            (data.salePrice !== undefined && isNaN(data.salePrice)) ||
            (data.stock !== undefined && isNaN(data.stock))
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri sayısal olmalıdır' },
                { status: 400 }
            );
        }

        // Negatif değer kontrolü
        if (
            (data.wholesalePrice !== undefined && data.wholesalePrice < 0) ||
            (data.salePrice !== undefined && data.salePrice < 0) ||
            (data.stock !== undefined && data.stock < 0)
        ) {
            return NextResponse.json(
                { success: false, error: 'Fiyat ve stok değerleri negatif olamaz' },
                { status: 400 }
            );
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return NextResponse.json(
                { success: false, error: 'Ürün bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Ürün sil
export async function DELETE(
    request: NextRequest,
    { params }: RouteParams
) {
    try {
        await connectToDatabase();

        const { id } = params;
        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return NextResponse.json(
                { success: false, error: 'Ürün bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: { message: 'Ürün başarıyla silindi', id }
        });
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Ürün silinirken bir hata oluştu' },
            { status: 500 }
        );
    }
} 