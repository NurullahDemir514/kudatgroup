import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

// Ürün stok güncelleme
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { action, quantity } = data;

        // Giriş parametrelerini kontrol et
        if (!action || (action !== 'increase' && action !== 'decrease')) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir işlem belirtilmedi (increase veya decrease)' },
                { status: 400 }
            );
        }

        if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir miktar belirtilmedi. Pozitif bir sayı girilmelidir.' },
                { status: 400 }
            );
        }

        // Ürünü bul
        const product = await Product.findById(params.id);

        if (!product) {
            return NextResponse.json(
                { success: false, error: 'Ürün bulunamadı' },
                { status: 404 }
            );
        }

        const numQuantity = Number(quantity);

        // Stok güncellemesi
        let update = {};
        if (action === 'increase') {
            update = { $inc: { stock: numQuantity } };
        } else {
            // Stokta yeterli ürün var mı kontrol et
            if (product.stock === 0) {
                return NextResponse.json(
                    { success: false, error: 'Stokta hiç ürün bulunmamaktadır' },
                    { status: 400 }
                );
            }

            if (product.stock < numQuantity) {
                return NextResponse.json(
                    { success: false, error: `Yeterli stok yok. Mevcut stok: ${product.stock}` },
                    { status: 400 }
                );
            }
            update = { $inc: { stock: -numQuantity } };
        }

        // Stok güncelle
        const updatedProduct = await Product.findByIdAndUpdate(
            params.id,
            update,
            { new: true }
        );

        return NextResponse.json({
            success: true,
            data: updatedProduct,
            message: `Ürün stoğu ${action === 'increase' ? 'artırıldı' : 'azaltıldı'}`
        });
    } catch (error) {
        console.error('Stok güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message || 'Stok güncellenirken bir hata oluştu' },
            { status: 500 }
        );
    }
} 