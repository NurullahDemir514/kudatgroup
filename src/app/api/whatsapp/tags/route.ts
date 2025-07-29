import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

/**
 * WhatsApp API aboneler için var olan etiketleri getiren endpoint
 * 
 * Döndürdüğü veriler:
 * - Sistemde kayıtlı tüm benzersiz etiketler
 */
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Önbelleği devre dışı bırak
        const headers = new Headers();
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');

        // Tüm abone etiketlerini tekrarsız olarak getir
        const result = await Newsletter.aggregate([
            // Sadece aktif ve WhatsApp mesajlarına açık aboneler
            { $match: { active: true, whatsappEnabled: true } },
            // Etiketleri düzleştir
            { $unwind: { path: "$tags", preserveNullAndEmptyArrays: false } },
            // Tekrarlı etiketleri kaldır
            { $group: { _id: "$tags" } },
            // Sonucu formatlı hale getir
            { $project: { _id: 0, tag: "$_id" } },
            // İsme göre sırala
            { $sort: { tag: 1 } }
        ]);

        const tags = result.map(item => item.tag);
        console.log(`${tags.length} etiket bulundu ve gönderiliyor`);

        return NextResponse.json({
            success: true,
            tags,
            timestamp: new Date().toISOString()
        }, { headers });
    } catch (error: any) {
        console.error("Etiketler yüklenirken hata:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Toplu etiket ekleme veya kaldırma
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { subscriberIds, tags, action } = data;

        if (!subscriberIds || !Array.isArray(subscriberIds) || subscriberIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Abone ID\'leri belirtilmelidir' },
                { status: 400 }
            );
        }

        if (!tags || !Array.isArray(tags) || tags.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Etiketler belirtilmelidir' },
                { status: 400 }
            );
        }

        if (!action || !['add', 'remove'].includes(action)) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir işlem belirtilmelidir (add veya remove)' },
                { status: 400 }
            );
        }

        // Etiket ekleme veya kaldırma işlemi
        let result;
        if (action === 'add') {
            // Etiketleri ekle ($addToSet, etiket zaten varsa tekrar eklemez)
            result = await Newsletter.updateMany(
                { _id: { $in: subscriberIds } },
                { $addToSet: { tags: { $each: tags } } }
            );
        } else {
            // Etiketleri kaldır
            result = await Newsletter.updateMany(
                { _id: { $in: subscriberIds } },
                { $pullAll: { tags: tags } }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${result.modifiedCount} abonenin etiketleri güncellendi`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Etiket güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 