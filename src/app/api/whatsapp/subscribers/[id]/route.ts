import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

// Belirli bir aboneyi getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const subscriber = await Newsletter.findById(params.id);

        if (!subscriber) {
            return NextResponse.json(
                { success: false, error: 'Abone bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: subscriber });
    } catch (error) {
        console.error('Abone getirme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir aboneyi güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const data = await request.json();

        // Email alanını kontrol et
        if (data.email) {
            // Email benzersiz mi?
            const existingSubscriber = await Newsletter.findOne({
                email: data.email,
                _id: { $ne: params.id }
            });

            if (existingSubscriber) {
                return NextResponse.json(
                    { success: false, error: 'Bu email adresi başka bir abone tarafından kullanılıyor' },
                    { status: 400 }
                );
            }
        }

        // Aboneyi güncelle
        const updatedSubscriber = await Newsletter.findByIdAndUpdate(
            params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updatedSubscriber) {
            return NextResponse.json(
                { success: false, error: 'Abone bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedSubscriber });
    } catch (error) {
        console.error('Abone güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir aboneyi sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const deletedSubscriber = await Newsletter.findByIdAndDelete(params.id);

        if (!deletedSubscriber) {
            return NextResponse.json(
                { success: false, error: 'Abone bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Abone başarıyla silindi'
        });
    } catch (error) {
        console.error('Abone silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 