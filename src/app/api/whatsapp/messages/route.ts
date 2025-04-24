import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';

// Gönderilen mesajları listele
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const templateId = searchParams.get('templateId');

        // Filtre oluştur
        const filter: any = {};

        if (status && ['pending', 'sent', 'failed'].includes(status)) {
            filter.status = status;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        if (templateId) {
            filter.templateId = templateId;
        }

        // Mesajları getir ve şablon bilgileriyle birleştir
        const messages = await WhatsAppMessage.find(filter)
            .sort({ createdAt: -1 })
            .populate('templateId', 'name');

        return NextResponse.json({
            success: true,
            data: messages,
            count: messages.length
        });
    } catch (error) {
        console.error('Mesaj listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Toplu mesaj durumunu güncelleme (İleride webhook entegrasyonu için kullanılabilir)
export async function PUT(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { messageIds, status, errorMessage } = data;

        if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Geçerli mesaj ID\'leri belirtilmelidir' },
                { status: 400 }
            );
        }

        if (!status || !['pending', 'sent', 'failed'].includes(status)) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir durum belirtilmelidir (pending, sent, failed)' },
                { status: 400 }
            );
        }

        const updateData: any = { status };

        if (status === 'sent') {
            updateData.sentAt = new Date();
        }

        if (status === 'failed' && errorMessage) {
            updateData.errorMessage = errorMessage;
        }

        // Mesajları güncelle
        const result = await WhatsAppMessage.updateMany(
            { _id: { $in: messageIds } },
            { $set: updateData }
        );

        return NextResponse.json({
            success: true,
            message: 'Mesaj durumları güncellendi',
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Mesaj güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}