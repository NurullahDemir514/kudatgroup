import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Newsletter } from "@/models/Newsletter";

// Filtrelere göre abone sayısını getir
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const { filters } = await req.json();

        // Temel filtre: aktif aboneler
        const filter: any = { active: true };

        // Ek filtreler (opsiyonel)
        if (filters) {
            // Etiket filtresi
            if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
                filter.tags = { $in: filters.tags };
            }

            // Şirket adı filtresi
            if (filters.companyName) {
                filter.companyName = { $regex: new RegExp(filters.companyName, 'i') };
            }
        }

        // Filtrelere uyan abone sayısını getir
        const count = await Newsletter.countDocuments(filter);

        return NextResponse.json({
            success: true,
            count
        });
    } catch (error: any) {
        console.error("Abone sayısı hesaplanırken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 