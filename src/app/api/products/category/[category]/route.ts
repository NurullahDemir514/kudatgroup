import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

// Kategoriye göre ürünleri getir
export async function GET(
    request: NextRequest,
    { params }: { params: { category: string } }
) {
    try {
        await connectToDatabase();

        // URL'den alınan kategori adını decode et
        const decodedCategory = decodeURIComponent(params.category);

        // Kategoriye ait ürünleri getir
        const products = await Product.find({
            category: decodedCategory
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: products,
            category: decodedCategory
        });
    } catch (error) {
        console.error('Kategori ürünleri listeleme hatası:', error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message || `"${params.category}" kategorisindeki ürünler listelenirken bir hata oluştu`
            },
            { status: 500 }
        );
    }
} 