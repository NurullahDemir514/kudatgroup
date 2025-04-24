import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

// Ürün arama
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // URL parametrelerini al
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const inStock = searchParams.get('inStock') === 'true';

        // Arama filtresini oluştur
        const filter: any = {};

        // Metin araması (isim veya açıklama içinde)
        if (query) {
            filter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ];
        }

        // Kategori filtresi
        if (category) {
            filter.category = category;
        }

        // Fiyat filtresi
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.salePrice = {};

            if (minPrice !== undefined) {
                filter.salePrice.$gte = minPrice;
            }

            if (maxPrice !== undefined) {
                filter.salePrice.$lte = maxPrice;
            }
        }

        // Stok durumu filtresi
        if (inStock) {
            filter.stock = { $gt: 0 };
        }

        // Ürünleri getir
        const products = await Product.find(filter).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: products,
            count: products.length,
            query: {
                search: query,
                category,
                minPrice,
                maxPrice,
                inStock
            }
        });
    } catch (error) {
        console.error('Ürün arama hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 