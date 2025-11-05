import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'URL parametresi gerekli' },
                { status: 400 }
            );
        }

        // URL decode
        const decodedUrl = decodeURIComponent(imageUrl);

        // Firebase Storage URL'sini kontrol et
        if (!decodedUrl.includes('firebasestorage.googleapis.com')) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz görsel URL' },
                { status: 400 }
            );
        }

        // Görseli fetch et
        const response = await fetch(decodedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        if (!response.ok) {
            return NextResponse.json(
                { success: false, error: 'Görsel yüklenemedi' },
                { status: response.status }
            );
        }

        // Görsel verisini al
        const imageBuffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        // Response'u döndür
        return new NextResponse(imageBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET',
            },
        });
    } catch (error: any) {
        console.error('Image proxy hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Görsel proxy edilirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

