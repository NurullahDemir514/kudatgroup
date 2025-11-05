import { NextRequest, NextResponse } from 'next/server';
import { whatsappTemplateService } from '@/services/firebaseServices';

// Tüm şablonları getir
export async function GET(request: NextRequest) {
    try {
        const templates = await whatsappTemplateService.getAll();
        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        console.error('Şablon listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni şablon ekle
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.name || !data.content) {
            return NextResponse.json(
                { success: false, error: 'Şablon adı ve içeriği zorunludur' },
                { status: 400 }
            );
        }

        const template = await whatsappTemplateService.create(data);

        return NextResponse.json(
            { success: true, data: template },
            { status: 201 }
        );
    } catch (error) {
        console.error('Şablon ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
