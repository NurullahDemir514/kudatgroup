import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

// Bir müşteriyi getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const customer = await Customer.findById(params.id);

        if (!customer) {
            return NextResponse.json(
                { success: false, error: 'Müşteri bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: customer });
    } catch (error) {
        console.error('Müşteri bulma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir müşteriyi güncelle
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.email || !data.phone || !data.address) {
            return NextResponse.json(
                { success: false, error: 'Tüm alanlar zorunludur' },
                { status: 400 }
            );
        }

        // Email adresi değiştiyse benzersiz olup olmadığını kontrol et
        if (data.email) {
            const existingCustomer = await Customer.findOne({
                email: data.email,
                _id: { $ne: params.id },
            });

            if (existingCustomer) {
                return NextResponse.json(
                    { success: false, error: 'Bu email adresi zaten kullanılıyor' },
                    { status: 400 }
                );
            }
        }

        // Müşteriyi güncelle
        const updatedCustomer = await Customer.findByIdAndUpdate(
            params.id,
            { $set: data },
            { new: true, runValidators: true }
        );

        if (!updatedCustomer) {
            return NextResponse.json(
                { success: false, error: 'Müşteri bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedCustomer });
    } catch (error) {
        console.error('Müşteri güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Bir müşteriyi sil
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const deletedCustomer = await Customer.findByIdAndDelete(params.id);

        if (!deletedCustomer) {
            return NextResponse.json(
                { success: false, error: 'Müşteri bulunamadı' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Müşteri başarıyla silindi',
        });
    } catch (error) {
        console.error('Müşteri silme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 