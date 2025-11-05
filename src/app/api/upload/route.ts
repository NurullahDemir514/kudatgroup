import { NextRequest, NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kudat-bulten-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kudat-bulten-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kudat-bulten-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "469680851853",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:469680851853:web:a721ff06e06434d02c8bc4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WFDP7PTFPV"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'products';

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'Dosya sağlanmadı' },
                { status: 400 }
            );
        }

        // Dosya tipi kontrolü
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz dosya tipi. Sadece görsel dosyaları yüklenebilir.' },
                { status: 400 }
            );
        }

        // Dosya boyutu kontrolü (10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { success: false, error: 'Dosya boyutu 10MB\'dan büyük olamaz' },
                { status: 400 }
            );
        }

        // Dosya adını oluştur (timestamp + original name)
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `${folder}/${fileName}`);

        // Firebase Storage'a yükle
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        await uploadBytes(storageRef, bytes, {
            contentType: file.type,
        });

        // Download URL'i al
        const downloadURL = await getDownloadURL(storageRef);

        return NextResponse.json({
            success: true,
            url: downloadURL,
            fileName: fileName,
            path: `${folder}/${fileName}`,
        });
    } catch (error: any) {
        console.error('Firebase Storage yükleme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Dosya yüklenirken bir hata oluştu',
                code: error.code,
            },
            { status: 500 }
        );
    }
}

// Base64 desteği (geriye dönük uyumluluk için)
export async function PUT(request: NextRequest) {
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

        // Base64'ü blob'a çevir
        const base64Data = image.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const blob = new Blob([buffer]);
        
        // Dosya tipini belirle
        const mimeMatch = image.match(/data:image\/(\w+);base64/);
        const fileType = mimeMatch ? mimeMatch[1] : 'jpeg';
        const fileName = `upload_${Date.now()}.${fileType}`;
        
        const storageRef = ref(storage, `products/${fileName}`);
        const bytes = new Uint8Array(await blob.arrayBuffer());
        
        await uploadBytes(storageRef, bytes, {
            contentType: `image/${fileType}`,
        });

        const downloadURL = await getDownloadURL(storageRef);

        return NextResponse.json({
            success: true,
            url: downloadURL,
            fileName: fileName,
        });
    } catch (error: any) {
        console.error('Firebase Storage yükleme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Dosya yüklenirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
} 