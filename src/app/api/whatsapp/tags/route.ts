import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

/**
 * WhatsApp API aboneler için var olan etiketleri getiren endpoint
 * 
 * Döndürdüğü veriler:
 * - Sistemde kayıtlı tüm benzersiz etiketler
 */
export async function GET() {
    try {
        await connectToDatabase();

        // Tüm benzersiz etiketleri getir
        const distinctTags = await Newsletter.distinct('tags');

        // Etiketlerin boş olup olmadığını kontrol et
        const validTags = distinctTags
            .filter(tag => tag && tag.trim() !== '')
            .sort();

        return NextResponse.json({
            success: true,
            tags: validTags || [],
        });
    } catch (error) {
        console.error('Etiketler alınırken hata:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
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