import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/firebaseServices';

// Bir müşteriyi getir
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const customer = await customerService.getById(params.id);

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
        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.email || !data.phone || !data.address) {
            return NextResponse.json(
                { success: false, error: 'Tüm alanlar zorunludur' },
                { status: 400 }
            );
        }

        // Email kontrolü (Firebase için basitleştirilmiş - tüm müşterileri kontrol ederiz)
        if (data.email) {
            const allCustomers = await customerService.getAll();
            const existingCustomer = allCustomers.find((c: any) => 
                c.email === data.email && (c.id || c._id) !== params.id
            );

            if (existingCustomer) {
                return NextResponse.json(
                    { success: false, error: 'Bu email adresi zaten kullanılıyor' },
                    { status: 400 }
                );
            }
        }

        // Müşteriyi güncelle
        const updatedCustomer = await customerService.update(params.id, data);

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
        await customerService.delete(params.id);

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