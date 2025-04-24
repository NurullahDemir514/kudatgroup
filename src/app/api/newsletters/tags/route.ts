import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Newsletter } from "@/models/Newsletter";

// Mevcut tüm benzersiz etiketleri getir
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Tüm abonelerden etiketleri topla
        const newsletters = await Newsletter.find({ tags: { $exists: true, $ne: [] } });

        // Benzersiz etiketleri bul
        const allTags = new Set<string>();

        newsletters.forEach(newsletter => {
            if (newsletter.tags && Array.isArray(newsletter.tags)) {
                newsletter.tags.forEach((tag: string) => {
                    if (tag && typeof tag === 'string') {
                        allTags.add(tag);
                    }
                });
            }
        });

        // Set'i diziye çevir ve sırala
        const uniqueTags = Array.from(allTags).sort();

        return NextResponse.json({
            success: true,
            data: uniqueTags
        });
    } catch (error: any) {
        console.error("Etiketler getirilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 