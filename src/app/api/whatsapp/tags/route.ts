import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/services/firebaseServices";

// WhatsApp için mevcut tüm benzersiz etiketleri getir
export async function GET(req: NextRequest) {
    try {
        // Tüm aboneleri getir
        const newsletters = await newsletterService.getAll();

        // WhatsApp'a açık ve aktif aboneleri filtrele
        const whatsappSubscribers = newsletters.filter((n: any) => 
            n.whatsappEnabled && n.active
        );

        // Benzersiz etiketleri topla
        const allTags = new Set<string>();

        whatsappSubscribers.forEach((newsletter: any) => {
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
