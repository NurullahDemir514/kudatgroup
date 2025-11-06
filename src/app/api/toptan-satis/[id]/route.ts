import { NextRequest, NextResponse } from 'next/server';
import { doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// PATCH - Toptan satış kaydının durumunu güncelle
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const data = await request.json();

        // Durum kontrolü
        if (data.status && !['pending', 'contacted', 'completed'].includes(data.status)) {
            return NextResponse.json(
                { success: false, error: 'Geçersiz durum değeri' },
                { status: 400 }
            );
        }

        // Firestore'da güncelle
        const docRef = doc(db, 'toptanSatis', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Kayıt bulunamadı' },
                { status: 404 }
            );
        }

        const updateData: any = {};
        if (data.status) {
            updateData.status = data.status;
        }
        if (data.notes) {
            updateData.notes = data.notes;
        }
        updateData.updatedAt = new Date();

        await updateDoc(docRef, updateData);

        return NextResponse.json({
            success: true,
            message: 'Kayıt başarıyla güncellendi',
        });
    } catch (error: any) {
        console.error('Toptan satış kaydı güncelleme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Kayıt güncellenirken bir hata oluştu' 
            },
            { status: 500 }
        );
    }
}

// DELETE - Toptan satış kaydını sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Firestore'da kaydı kontrol et
        const docRef = doc(db, 'toptanSatis', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json(
                { success: false, error: 'Kayıt bulunamadı' },
                { status: 404 }
            );
        }

        // Kaydı sil
        await deleteDoc(docRef);

        return NextResponse.json({
            success: true,
            message: 'Kayıt başarıyla silindi',
        });
    } catch (error: any) {
        console.error('Toptan satış kaydı silme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Kayıt silinirken bir hata oluştu' 
            },
            { status: 500 }
        );
    }
}

