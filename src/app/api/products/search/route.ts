import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/firebaseServices';

// Ürün arama
export async function GET(request: NextRequest) {
    try {
        // URL parametrelerini al
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q') || '';
        const category = searchParams.get('category') || '';
        const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
        const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
        const inStock = searchParams.get('inStock') === 'true';

        // Tüm ürünleri getir
        let products = await productService.getAll();

        // Client-side filtreleme
        if (query) {
            const lowerQuery = query.toLowerCase();
            products = products.filter((p: any) => 
                p.name?.toLowerCase().includes(lowerQuery) || 
                p.description?.toLowerCase().includes(lowerQuery)
            );
        }

        if (category) {
            products = products.filter((p: any) => p.category === category);
        }

        if (minPrice !== undefined) {
            products = products.filter((p: any) => p.salePrice >= minPrice);
        }

        if (maxPrice !== undefined) {
            products = products.filter((p: any) => p.salePrice <= maxPrice);
        }

        if (inStock) {
            products = products.filter((p: any) => p.stock > 0);
        }

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