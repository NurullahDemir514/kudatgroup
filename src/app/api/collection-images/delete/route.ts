import { NextRequest, NextResponse } from 'next/server';
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const imageUrl = searchParams.get('url');

        if (!imageUrl) {
            return NextResponse.json(
                { success: false, error: 'Görsel URL\'si sağlanmadı' },
                { status: 400 }
            );
        }

        // URL'den dosya yolunu çıkar
        // Firebase Storage URL formatı: https://firebasestorage.googleapis.com/v0/b/{bucket}/o/{path}?alt=media&token={token}
        const urlObj = new URL(imageUrl);
        const pathMatch = urlObj.pathname.match(/\/o\/(.+)/);
        
        if (!pathMatch) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz görsel URL\'si' },
                { status: 400 }
            );
        }

        // URL decode edilmiş path'i al
        const encodedPath = pathMatch[1];
        const decodedPath = decodeURIComponent(encodedPath);

        // Firebase Storage referansını oluştur
        const imageRef = ref(storage, decodedPath);

        // Görseli sil
        await deleteObject(imageRef);

        return NextResponse.json({
            success: true,
            message: 'Görsel başarıyla silindi',
        });
    } catch (error: any) {
        console.error('Görsel silme hatası:', error);
        
        // Eğer dosya zaten yoksa başarılı say
        if (error.code === 'storage/object-not-found') {
            return NextResponse.json({
                success: true,
                message: 'Görsel zaten mevcut değil',
            });
        }

        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Görsel silinirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

