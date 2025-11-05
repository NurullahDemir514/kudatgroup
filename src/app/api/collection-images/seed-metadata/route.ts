import { NextResponse } from 'next/server';
import { collection, getDocs, setDoc, doc, query, where } from 'firebase/firestore';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// Varsayılan ürün adları ve açıklamaları
const defaultProductData = [
    { title: 'Zarif Çelik Kolye', code: 'KT-001', description: 'Özel tasarım çelik kolye koleksiyonu' },
    { title: 'Şık Çelik Bileklik', code: 'KT-002', description: 'Zarif çelik bileklik modelleri' },
    { title: 'Dayanıklı Çelik Yüzük', code: 'KT-003', description: 'Dayanıklı çelik yüzük koleksiyonu' },
    { title: 'Elegant Çelik Küpe', code: 'KT-004', description: 'Şık çelik küpe tasarımları' },
    { title: 'Premium Çelik Takı Seti', code: 'KT-005', description: 'Elegant çelik takı setleri' },
    { title: 'Modern Çelik Aksesuar', code: 'KT-006', description: 'Premium çelik aksesuar koleksiyonu' },
    { title: 'Klasik Çelik Bileklik', code: 'KT-007', description: 'Modern çelik bileklik serisi' },
    { title: 'Özel Tasarım Çelik Kolye', code: 'KT-008', description: 'Klasik çelik kolye modelleri' },
    { title: 'Zarif Çelik Yüzük', code: 'KT-009', description: 'Özel tasarım çelik yüzükler' },
    { title: 'Lüks Çelik Küpe', code: 'KT-010', description: 'Zarif çelik küpe koleksiyonu' },
];

export async function GET() {
    try {
        // Firebase Storage'dan collection görsellerini çek
        const collectionImagesRef = ref(storage, 'collection');
        const result = await listAll(collectionImagesRef);
        
        // Get download URLs for all images
        const downloadURLPromises = result.items.map(async (itemRef) => {
            return await getDownloadURL(itemRef);
        });

        const urls = await Promise.all(downloadURLPromises);
        const sortedUrls = urls.sort();

        // Firestore'dan mevcut metadata'ları kontrol et
        const metadataRef = collection(db, 'collectionImages');
        const metadataSnapshot = await getDocs(metadataRef);
        
        const existingUrls = new Set<string>();
        metadataSnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.imageUrl) {
                existingUrls.add(data.imageUrl);
            }
        });

        const results: Array<{
            success: boolean;
            imageUrl: string;
            title: string;
            code: string;
            error?: string;
        }> = [];

        // Her görsel için metadata oluştur
        for (let i = 0; i < sortedUrls.length; i++) {
            const imageUrl = sortedUrls[i];
            
            // Eğer zaten metadata varsa atla
            if (existingUrls.has(imageUrl)) {
                results.push({
                    success: true,
                    imageUrl,
                    title: 'Zaten mevcut',
                    code: 'SKIP',
                });
                continue;
            }

            try {
                // Varsayılan verileri kullan
                const productData = defaultProductData[i % defaultProductData.length];
                
                // Firestore'a metadata kaydet
                const newDocRef = doc(metadataRef);
                await setDoc(newDocRef, {
                    imageUrl: imageUrl,
                    title: productData.title,
                    code: productData.code,
                    description: productData.description,
                    order: i,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                results.push({
                    success: true,
                    imageUrl,
                    title: productData.title,
                    code: productData.code,
                });

                console.log(`✅ Metadata yüklendi: ${productData.title} (${productData.code})`);
            } catch (error: any) {
                console.error(`❌ Metadata yüklenemedi: ${imageUrl}`, error);
                results.push({
                    success: false,
                    imageUrl,
                    title: '',
                    code: '',
                    error: error.message,
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            message: `${successCount} metadata kaydı başarıyla oluşturuldu, ${failCount} kayıt oluşturulamadı`,
            total: results.length,
            successCount,
            failCount,
            results,
        });
    } catch (error: any) {
        console.error('Metadata seed hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Metadata yüklenirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

