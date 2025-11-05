import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/services/firebaseServices";

// Tüm ürün kategorilerini getir
export async function GET() {
    try {
        const categories = await productService.getCategories();

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