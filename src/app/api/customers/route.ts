import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Customer } from '@/models/Customer';

// Tüm müşterileri getir
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const customers = await Customer.find({}).sort({ createdAt: -1 });

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
        await connectToDatabase();

        const data = await request.json();

        // Zorunlu alanları kontrol et
        if (!data.name || !data.email || !data.phone || !data.address) {
            return NextResponse.json(
                { success: false, error: 'Tüm alanlar zorunludur' },
                { status: 400 }
            );
        }

        // Email adresinin benzersiz olup olmadığını kontrol et
        const existingCustomer = await Customer.findOne({ email: data.email });
        if (existingCustomer) {
            return NextResponse.json(
                { success: false, error: 'Bu email adresi zaten kullanılıyor' },
                { status: 400 }
            );
        }

        // Yeni müşteri oluştur
        const newCustomer = await Customer.create(data);

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