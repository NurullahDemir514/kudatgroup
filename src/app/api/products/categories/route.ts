import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

// Tüm ürün kategorilerini getir
export async function GET() {
    try {
        await connectToDatabase();

        // Benzersiz kategorileri al
        const categories = await Product.distinct('category');

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('Kategori listeleme hatası:', error);
        return NextResponse.json(
            {
                success: false,
                error: (error as Error).message || 'Kategoriler listelenirken bir hata oluştu'
            },
            { status: 500 }
        );
    }
} 