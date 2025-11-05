import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/services/firebaseServices';

// Tüm kampanyaları getir
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Tüm kampanyaları getir
        let campaigns = await campaignService.getAll();

        // Durum filtresi
        if (status && ['active', 'planned', 'completed'].includes(status)) {
            campaigns = campaigns.filter((c: any) => c.status === status);
        }

        // Başlangıç tarihine göre sırala
        campaigns.sort((a: any, b: any) => {
            const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
            const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Kampanya listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni kampanya ekle
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.description || !data.startDate || !data.endDate) {
            return NextResponse.json(
                { success: false, error: 'Kampanya adı, açıklama, başlangıç ve bitiş tarihleri zorunludur' },
                { status: 400 }
            );
        }

        // Başlangıç ve bitiş tarihlerini kontrol et
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (startDate >= endDate) {
            return NextResponse.json(
                { success: false, error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' },
                { status: 400 }
            );
        }

        // Kampanya durumunu hesapla
        const now = new Date();
        let status = 'planned';
        if (now >= startDate && now <= endDate) {
            status = 'active';
        } else if (now > endDate) {
            status = 'completed';
        }

        // Kampanyayı kaydet
        const campaign = await campaignService.create({
            ...data,
            status,
        });

        return NextResponse.json(
            { success: true, data: campaign },
            { status: 201 }
        );
    } catch (error) {
        console.error('Kampanya ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
