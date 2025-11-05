import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

// Cache için
let cachedImages: { urls: string[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET(request: NextRequest) {
    try {
        // Cache kontrolü
        if (cachedImages && Date.now() - cachedImages.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                images: cachedImages.urls,
                cached: true,
            });
        }

        // Firebase Storage'dan hero görsellerini çek
        const heroImagesRef = ref(storage, 'hero');
        
        // List all files in hero folder
        const result = await listAll(heroImagesRef);
        
        // Get download URLs for all images
        const downloadURLPromises = result.items.map(async (itemRef) => {
            return await getDownloadURL(itemRef);
        });

        const urls = await Promise.all(downloadURLPromises);

        // Sort by filename (timestamp prefix)
        const sortedUrls = urls.sort();

        // Cache'e kaydet
        cachedImages = {
            urls: sortedUrls,
            timestamp: Date.now(),
        };

        return NextResponse.json({
            success: true,
            images: sortedUrls,
            cached: false,
        });
    } catch (error: any) {
        console.error('Hero görselleri çekilirken hata:', error);
        
        // Hata durumunda cache'den döndür
        if (cachedImages) {
            return NextResponse.json({
                success: true,
                images: cachedImages.urls,
                cached: true,
                error: 'Yeni görseller yüklenemedi, cache\'den döndürülüyor',
            });
        }

        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Görseller yüklenirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

// Cache'i temizle
export async function DELETE() {
    cachedImages = null;
    return NextResponse.json({ success: true, message: 'Cache temizlendi' });
}

