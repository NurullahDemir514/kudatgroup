import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/services/firebaseServices';

// Tek bir kampanyayı getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const campaign = await campaignService.getById(params.id);

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: campaign });
    } catch (error) {
        console.error('Kampanya getirme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Kampanyayı güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        let status = data.status || 'planned';
        if (now >= startDate && now <= endDate) {
            status = 'active';
        } else if (now > endDate) {
            status = 'completed';
        }

        // Kampanyayı güncelle
        const updatedCampaign = await campaignService.update(params.id, {
            ...data,
            status,
        });

        return NextResponse.json({ success: true, data: updatedCampaign });
    } catch (error) {
        console.error('Kampanya güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Kampanyayı sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await campaignService.delete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Kampanya başarıyla silindi',
        });
    } catch (error) {
        console.error('Kampanya silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
