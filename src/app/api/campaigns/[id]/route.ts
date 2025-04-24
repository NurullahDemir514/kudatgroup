import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';

// Belirli bir kampanyayı getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const campaign = await Campaign.findById(params.id);

        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: campaign });
    } catch (error) {
        console.error('Kampanya bulma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir kampanyayı güncelle (tüm alanlar)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Kampanyayı güncelle
        const updatedCampaign = await Campaign.findByIdAndUpdate(
            params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updatedCampaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedCampaign });
    } catch (error) {
        console.error('Kampanya güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir kampanyanın belirli alanlarını güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const data = await request.json();

        // Tarihler varsa kontrol et
        if (data.startDate && data.endDate) {
            const startDate = new Date(data.startDate);
            const endDate = new Date(data.endDate);

            if (endDate <= startDate) {
                return NextResponse.json(
                    { success: false, error: 'Bitiş tarihi başlangıç tarihinden sonra olmalıdır' },
                    { status: 400 }
                );
            }
        }

        // Kampanyayı güncelle
        const updatedCampaign = await Campaign.findByIdAndUpdate(
            params.id,
            { $set: data },
            { new: true }
        );

        if (!updatedCampaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedCampaign });
    } catch (error) {
        console.error('Kampanya güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir kampanyayı sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const deletedCampaign = await Campaign.findByIdAndDelete(params.id);

        if (!deletedCampaign) {
            return NextResponse.json(
                { success: false, error: 'Kampanya bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Kampanya başarıyla silindi'
        });
    } catch (error) {
        console.error('Kampanya silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 