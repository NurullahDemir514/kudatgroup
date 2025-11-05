import { NextRequest, NextResponse } from 'next/server';
import { campaignService } from '@/services/firebaseServices';

// Kampanya durumunu güncelle
export async function PUT(request: NextRequest) {
    try {
        const { id, status } = await request.json();

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Kampanya ID ve durum gereklidir' },
                { status: 400 }
            );
        }

        if (!['active', 'planned', 'completed'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz kampanya durumu' },
                { status: 400 }
            );
        }

        await campaignService.update(id, { status });

        return NextResponse.json({
            success: true,
            message: 'Kampanya durumu güncellendi',
        });
    } catch (error) {
        console.error('Kampanya durumu güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
