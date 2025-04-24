import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WhatsAppTemplate } from '@/models/WhatsAppTemplate';

// Bir şablonu getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const template = await WhatsAppTemplate.findById(params.id);

        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Şablon bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: template });
    } catch (error) {
        console.error('Şablon bulma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir şablonu güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.content) {
            return NextResponse.json(
                { success: false, error: 'Şablon adı ve içeriği zorunludur' },
                { status: 400 }
            );
        }

        // Parametreleri ayrıştır
        let parameters: string[] = [];

        // 1. Frontend'den gelen parametre dizisini kullan (öncelikli)
        if (data.parameters && Array.isArray(data.parameters) && data.parameters.length > 0) {
            parameters = data.parameters.filter((p: string) => typeof p === 'string' && p.trim().length > 0);
        }
        // 2. Eğer string olarak geldiyse (eski format), virgülle ayırarak diziye dönüştür
        else if (data.parameters && typeof data.parameters === 'string') {
            parameters = data.parameters
                .split(',')
                .map((p: string) => p.trim())
                .filter((p: string) => p.length > 0);
        }

        // 3. İçerikten otomatik olarak parametreleri çıkar ve eksik olanları ekle
        const regex = /{{([^}]+)}}/g;
        let match;

        while ((match = regex.exec(data.content)) !== null) {
            const param = match[1].trim();
            if (!parameters.includes(param)) {
                parameters.push(param);
            }
        }

        console.log('Güncellenen şablon parametreleri:', parameters);

        // Şablonu güncelle
        const updatedTemplate = await WhatsAppTemplate.findByIdAndUpdate(
            params.id,
            {
                $set: {
                    ...data,
                    parameters
                }
            },
            { new: true, runValidators: true }
        );

        if (!updatedTemplate) {
            return NextResponse.json(
                { success: false, error: 'Şablon bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedTemplate });
    } catch (error) {
        console.error('Şablon güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir şablonu sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const deletedTemplate = await WhatsAppTemplate.findByIdAndDelete(params.id);

        if (!deletedTemplate) {
            return NextResponse.json(
                { success: false, error: 'Şablon bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Şablon başarıyla silindi'
        });
    } catch (error) {
        console.error('Şablon silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 