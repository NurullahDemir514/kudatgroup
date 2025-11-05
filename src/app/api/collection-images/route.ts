import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

// Cache için
let cachedImages: { images: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 dakika

export async function GET(request: NextRequest) {
    try {
        // Cache kontrolü
        if (cachedImages && Date.now() - cachedImages.timestamp < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                images: cachedImages.images,
                cached: true,
            });
        }

        // Önce Firestore'dan metadata'ları çek
        const metadataRef = collection(db, 'collectionImages');
        const metadataQuery = query(metadataRef, orderBy('order', 'asc'));
        const metadataSnapshot = await getDocs(metadataQuery);
        
        const metadataMap = new Map<string, any>();
        metadataSnapshot.docs.forEach(doc => {
            const data = doc.data();
            metadataMap.set(data.imageUrl, {
                id: doc.id,
                title: data.title || '',
                code: data.code || '',
                description: data.description || '',
                order: data.order || 0,
            });
        });

        // Firebase Storage'dan collection görsellerini çek
        const collectionImagesRef = ref(storage, 'collection');
        
        // List all files in collection folder
        const result = await listAll(collectionImagesRef);
        
        // Get download URLs for all images
        const downloadURLPromises = result.items.map(async (itemRef) => {
            return await getDownloadURL(itemRef);
        });

        const urls = await Promise.all(downloadURLPromises);

        // Metadata ile birleştir
        const imagesWithMetadata = urls.map((url) => {
            const metadata = metadataMap.get(url) || {
                title: '',
                code: '',
                description: '',
                order: 0,
            };
            return {
                url,
                ...metadata,
            };
        });

        // Order'a göre sırala
        imagesWithMetadata.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Cache'e kaydet
        cachedImages = {
            images: imagesWithMetadata,
            timestamp: Date.now(),
        };

        return NextResponse.json({
            success: true,
            images: imagesWithMetadata,
            cached: false,
        });
    } catch (error: any) {
        console.error('Collection görselleri çekilirken hata:', error);
        
        // Hata durumunda cache'den döndür
        if (cachedImages) {
            return NextResponse.json({
                success: true,
                images: cachedImages.images,
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

