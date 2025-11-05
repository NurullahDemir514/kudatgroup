import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/services/firebaseServices';

// WhatsApp aboneliğini güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();

        const updatedSubscriber = await newsletterService.update(params.id, {
            whatsappEnabled: data.whatsappEnabled,
            active: data.active
        });

        return NextResponse.json({
            success: true,
            data: updatedSubscriber,
            message: 'Abone durumu güncellendi',
        });
    } catch (error) {
        console.error('Abone güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
