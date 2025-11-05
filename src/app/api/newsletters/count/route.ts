import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/services/firebaseServices";

// Filtrelere göre abone sayısını getir
export async function POST(req: NextRequest) {
    try {
        const { filters } = await req.json();

        // Tüm aboneleri getir
        const allNewsletters = await newsletterService.getAll();
        
        // Aktif aboneleri filtrele
        let filtered = allNewsletters.filter((n: any) => n.active === true);

        // Ek filtreler
        if (filters) {
            // Etiket filtresi
            if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
                filtered = filtered.filter((n: any) => 
                    n.tags && n.tags.some((tag: string) => filters.tags.includes(tag))
                );
            }

            // Şirket adı filtresi
            if (filters.companyName) {
                const searchTerm = filters.companyName.toLowerCase();
                filtered = filtered.filter((n: any) => 
                    n.companyName && n.companyName.toLowerCase().includes(searchTerm)
                );
            }
        }

        return NextResponse.json({
            success: true,
            count: filtered.length
        });
    } catch (error: any) {
        console.error("Abone sayısı hesaplanırken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
