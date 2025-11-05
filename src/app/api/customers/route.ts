import { NextRequest, NextResponse } from 'next/server';
import { customerService } from '@/services/firebaseServices';

// Tüm müşterileri getir
export async function GET(request: NextRequest) {
    try {
        const customers = await customerService.getAll();

        return NextResponse.json({ success: true, data: customers });
    } catch (error) {
        console.error('Müşteri listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni müşteri ekle
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.email || !data.phone || !data.address) {
            return NextResponse.json(
                { success: false, error: 'Tüm alanlar zorunludur' },
                { status: 400 }
            );
        }

        // Yeni müşteri oluştur (Firebase)
        const newCustomer = await customerService.create(data);

        return NextResponse.json(
            { success: true, data: newCustomer },
            { status: 201 }
        );
    } catch (error) {
        console.error('Müşteri ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 