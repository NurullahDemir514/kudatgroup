import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { image } = await request.json();

        if (!image) {
            return NextResponse.json(
                { success: false, error: 'Görüntü verisi sağlanmadı' },
                { status: 400 }
            );
        }

        // Base64 doğrulama 
        if (!image.startsWith('data:image/')) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz görüntü formatı' },
                { status: 400 }
            );
        }

        // Doğrudan Base64 döndür
        return NextResponse.json({
            success: true,
            url: image, // Base64 görseli olduğu gibi döndür
        });
    } catch (error) {
        console.error('Resim işleme hatası:', error);

        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 