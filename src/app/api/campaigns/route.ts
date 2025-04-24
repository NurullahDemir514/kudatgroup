import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';

// Tüm kampanyaları getir
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        // URL parametrelerini al
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Filtre oluştur
        const filter: any = {};

        // Durum filtresi ekle
        if (status && ['active', 'planned', 'completed'].includes(status)) {
            filter.status = status;
        }

        // Kampanyaları getir
        const campaigns = await Campaign.find(filter).sort({ startDate: -1 });

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
        await connectToDatabase();

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

        if (endDate <= startDate) {
            return NextResponse.json(
                { success: false, error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' },
                { status: 400 }
            );
        }

        // Yeni kampanya oluştur
        const newCampaign = await Campaign.create(data);

        return NextResponse.json(
            { success: true, data: newCampaign },
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