import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';

export async function PATCH(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { campaignId, status } = data;

        // Zorunlu alanları kontrol et
        if (!campaignId) {
            return NextResponse.json(
                { success: false, error: 'Kampanya ID zorunludur' },
                { status: 400 }
            );
        }

        if (!status || !['active', 'completed', 'planned'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir durum belirtilmelidir (active, completed, planned)' },
                { status: 400 }
            );
        }

        // Kampanyayı getir
        const campaign = await Campaign.findById(campaignId);

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        // Durumu güncelle
        campaign.status = status;
        await campaign.save();

        return NextResponse.json({
            success: true,
            message: 'Kampanya durumu başarıyla güncellendi',
            data: {
                campaignId,
                status
            }
        });
    } catch (error) {
        console.error('Kampanya durumu güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 