import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, getDocs, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface CollectionImageMetadata {
    id?: string;
    imageUrl: string;
    title: string;
    code: string;
    description: string;
    order?: number;
}

// Tüm collection görsellerinin metadata'sını getir
export async function GET() {
    try {
        const collectionRef = collection(db, 'collectionImages');
        const q = query(collectionRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);
        
        const metadata = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as CollectionImageMetadata[];

        return NextResponse.json({
            success: true,
            metadata,
        });
    } catch (error: any) {
        console.error('Collection metadata çekilirken hata:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Metadata yüklenirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

// Collection görseli metadata'sını kaydet/güncelle
export async function POST(request: NextRequest) {
    try {
        const data: CollectionImageMetadata & { id?: string } = await request.json();

        if (!data.imageUrl) {
            return NextResponse.json(
                { success: false, error: 'Görsel URL\'si gerekli' },
                { status: 400 }
            );
        }

        // Firestore'da kaydet
        const collectionRef = collection(db, 'collectionImages');
        
        if (data.id) {
            // Güncelle
            const docRef = doc(collectionRef, data.id);
            await setDoc(docRef, {
                imageUrl: data.imageUrl,
                title: data.title || '',
                code: data.code || '',
                description: data.description || '',
                order: data.order || 0,
                updatedAt: new Date(),
            }, { merge: true });
        } else {
            // Yeni kayıt
            const docRef = doc(collectionRef);
            await setDoc(docRef, {
                imageUrl: data.imageUrl,
                title: data.title || '',
                code: data.code || '',
                description: data.description || '',
                order: data.order || 0,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Metadata başarıyla kaydedildi',
        });
    } catch (error: any) {
        console.error('Metadata kaydedilirken hata:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Metadata kaydedilirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

// Metadata'yı sil
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, error: 'ID gerekli' },
                { status: 400 }
            );
        }

        const collectionRef = collection(db, 'collectionImages');
        const docRef = doc(collectionRef, id);
        await deleteDoc(docRef);

        return NextResponse.json({
            success: true,
            message: 'Metadata başarıyla silindi',
        });
    } catch (error: any) {
        console.error('Metadata silinirken hata:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Metadata silinirken bir hata oluştu',
            },
            { status: 500 }
        );
    }
}

