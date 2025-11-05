// Image cache utility
const imageCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

export async function getCachedImageUrl(
    imagePath: string,
    fetchUrl: string
): Promise<string> {
    // Cache'den kontrol et
    const cached = imageCache.get(imagePath);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.url;
    }

    // Cache'de yoksa veya expire olmuşsa fetch et
    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error('Image fetch failed');
        }
        
        // Firebase Storage URL'i direkt kullanılabilir
        const url = await response.text();
        
        // Cache'e kaydet
        imageCache.set(imagePath, {
            url,
            timestamp: Date.now(),
        });

        return url;
    } catch (error) {
        console.error('Image cache error:', error);
        // Hata durumunda eski cache'i döndür
        if (cached) {
            return cached.url;
        }
        throw error;
    }
}

export function clearImageCache() {
    imageCache.clear();
}

export function getImageCacheSize() {
    return imageCache.size;
}

