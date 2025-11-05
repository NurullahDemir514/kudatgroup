import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function GET(request: NextRequest) {
    try {
        // URL'yi query string'den al
        const url = new URL(request.url);
        const imageUrl = url.searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'URL parametresi gerekli' },
                { status: 400 }
            );
        }

        // URL decode
        let decodedUrl: string;
        try {
            decodedUrl = decodeURIComponent(imageUrl);
        } catch {
            decodedUrl = imageUrl;
        }

        // Firebase Storage URL'sini kontrol et
        if (!decodedUrl.includes('firebasestorage.googleapis.com')) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz görsel URL' },
                { status: 400 }
            );
        }

        // Direkt olarak orijinal URL'i kullan (Firebase Storage URL'leri zaten geçerli)
        const downloadURL = decodedUrl;

        // Görseli fetch et - redirect'leri takip et
        let response;
        try {
            response = await fetch(downloadURL, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'image/*',
                    'Referer': 'https://kudatgroup.com',
                },
                redirect: 'follow',
            });
        } catch (fetchError: any) {
            console.error('Fetch hatası:', fetchError.message, downloadURL.substring(0, 100));
            return NextResponse.json(
                { success: false, error: `Fetch hatası: ${fetchError.message}` },
                { status: 500 }
            );
        }

        if (!response.ok) {
            console.error('Görsel yüklenemedi:', response.status, response.statusText, downloadURL.substring(0, 100));
            // Hata durumunda orijinal URL'i redirect header ile döndür
            return NextResponse.redirect(downloadURL, 302);
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

