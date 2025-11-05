import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFile } from 'fs/promises';
import { join } from 'path';

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

// Hero görselleri (1.jpg - 6.jpg)
const heroImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg'];

// Ürün görselleri (diğerleri)
const productImages = [
  'WhatsApp Image 2025-11-05 at 14.17.07.jpeg',
  'WhatsApp Image 2025-11-05 at 14.17.08 (1).jpeg',
  'WhatsApp Image 2025-11-05 at 14.17.08 (2).jpeg',
  'WhatsApp Image 2025-11-05 at 14.17.08 (3).jpeg',
];

export async function GET() {
    try {
        const results: {
            success: boolean;
            fileName: string;
            folder: string;
            url?: string;
            error?: string;
        }[] = [];

        // Hero görsellerini yükle
        for (const fileName of heroImages) {
            try {
                const filePath = join(process.cwd(), 'public', 'products', fileName);
                const fileBuffer = await readFile(filePath);
                
                // MIME type belirle
                const mimeType = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') 
                    ? 'image/jpeg' 
                    : 'image/png';

                const storageRef = ref(storage, `hero/${fileName}`);
                await uploadBytes(storageRef, fileBuffer, {
                    contentType: mimeType,
                });

                const downloadURL = await getDownloadURL(storageRef);

                results.push({
                    success: true,
                    fileName,
                    folder: 'hero',
                    url: downloadURL,
                });

                console.log(`✅ Hero görseli yüklendi: ${fileName}`);
            } catch (error: any) {
                console.error(`❌ Hero görseli yüklenemedi: ${fileName}`, error);
                results.push({
                    success: false,
                    fileName,
                    folder: 'hero',
                    error: error.message,
                });
            }
        }

        // Ürün görsellerini yükle
        for (const fileName of productImages) {
            try {
                const filePath = join(process.cwd(), 'public', 'products', fileName);
                const fileBuffer = await readFile(filePath);
                
                // MIME type belirle
                const mimeType = fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') 
                    ? 'image/jpeg' 
                    : 'image/png';

                const storageRef = ref(storage, `products/${fileName}`);
                await uploadBytes(storageRef, fileBuffer, {
                    contentType: mimeType,
                });

                const downloadURL = await getDownloadURL(storageRef);

                results.push({
                    success: true,
                    fileName,
                    folder: 'products',
                    url: downloadURL,
                });

                console.log(`✅ Ürün görseli yüklendi: ${fileName}`);
            } catch (error: any) {
                console.error(`❌ Ürün görseli yüklenemedi: ${fileName}`, error);
                results.push({
                    success: false,
                    fileName,
                    folder: 'products',
                    error: error.message,
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        const failCount = results.filter(r => !r.success).length;

        return NextResponse.json({
            success: true,
            message: `${successCount} görsel başarıyla yüklendi, ${failCount} görsel yüklenemedi`,
            total: results.length,
            successCount,
            failCount,
            results,
        });
    } catch (error: any) {
        console.error('Görsel yükleme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Görseller yüklenirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

