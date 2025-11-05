import { NextRequest, NextResponse } from 'next/server';
import { whatsappMessageService } from '@/services/firebaseServices';

// Tüm mesajları getir
export async function GET(request: NextRequest) {
    try {
        const messages = await whatsappMessageService.getAll();

        // Tarih göre sırala (en yeni en üstte)
        messages.sort((a: any, b: any) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        return NextResponse.json({ success: true, data: messages });
    } catch (error) {
        console.error('Mesaj listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni mesaj kaydı ekle
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        const message = await whatsappMessageService.create(data);

        return NextResponse.json(
            { success: true, data: message },
            { status: 201 }
        );
    } catch (error) {
        console.error('Mesaj kaydetme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
