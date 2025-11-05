import { NextRequest, NextResponse } from 'next/server';
import { whatsappTemplateService } from '@/services/firebaseServices';

// Tek bir şablonu getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const template = await whatsappTemplateService.getById(params.id);

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Şablon bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Şablon getirme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Şablonu güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const data = await request.json();

        if (!data.name || !data.content) {
            return NextResponse.json(
                { success: false, error: 'Şablon adı ve içeriği zorunludur' },
                { status: 400 }
            );
        }

        const updatedTemplate = await whatsappTemplateService.update(params.id, data);

        return NextResponse.json({ success: true, data: updatedTemplate });
    } catch (error) {
        console.error('Şablon güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Şablonu sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await whatsappTemplateService.delete(params.id);

        return NextResponse.json({
            success: true,
            message: 'Şablon başarıyla silindi',
        });
    } catch (error) {
        console.error('Şablon silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
