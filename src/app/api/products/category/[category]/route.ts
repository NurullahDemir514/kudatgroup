import { NextRequest, NextResponse } from 'next/server';
import { productService } from '@/services/firebaseServices';

// Kategoriye göre ürünleri getir
export async function GET(
    request: NextRequest,
    { params }: { params: { category: string } }
) {
    try {
        // URL'den alınan kategori adını decode et
        const decodedCategory = decodeURIComponent(params.category);

        // Tüm ürünleri getir ve kategoriye göre filtrele
        const allProducts = await productService.getAll();
        const products = allProducts.filter((p: any) => p.category === decodedCategory);

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