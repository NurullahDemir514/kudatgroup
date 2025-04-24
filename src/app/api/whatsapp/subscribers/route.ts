import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Newsletter } from '@/models/Newsletter';

// WhatsApp mesajları için abone listesini getir
export async function GET(request: NextRequest) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(request.url);
        const active = searchParams.get('active');
        const search = searchParams.get('search');
        const tag = searchParams.get('tag');
        const sortBy = searchParams.get('sortBy') || 'subscriptionDate';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // Filtre oluştur
        const filter: any = {};

        // Aktif/pasif filtresi
        if (active === 'true') {
            filter.active = true;
        } else if (active === 'false') {
            filter.active = false;
        }

        // Etiket filtresi
        if (tag) {
            filter.tags = tag;
        }

        // Arama filtresi
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Sıralama ayarları
        const sortOptions: any = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Aboneleri getir
        const subscribers = await Newsletter.find(filter).sort(sortOptions);

        return NextResponse.json({
            success: true,
            data: subscribers
        });
    } catch (error) {
        console.error('Abone listeleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Yeni abone ekle
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();

        // Email alanının zorunlu olduğunu kontrol et
        if (!data.email) {
            return NextResponse.json(
                { success: false, error: 'Email alanı zorunludur' },
                { status: 400 }
            );
        }

        // Email'in benzersiz olup olmadığını kontrol et
        const existingSubscriber = await Newsletter.findOne({ email: data.email });
        if (existingSubscriber) {
            return NextResponse.json(
                { success: false, error: 'Bu email adresi zaten kayıtlı' },
                { status: 400 }
            );
        }

        // Yeni abone oluştur
        const newSubscriber = await Newsletter.create({
            ...data,
            subscriptionDate: data.subscriptionDate || new Date()
        });

        return NextResponse.json(
            { success: true, data: newSubscriber },
            { status: 201 }
        );
    } catch (error) {
        console.error('Abone ekleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}

// Aboneleri toplu güncelle (örn. etiket ekleme)
export async function PATCH(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { ids, update } = data;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Güncellenecek abone ID\'leri belirtilmelidir' },
                { status: 400 }
            );
        }

        if (!update || Object.keys(update).length === 0) {
            return NextResponse.json(
                { success: false, error: 'Güncellenecek alanlar belirtilmelidir' },
                { status: 400 }
            );
        }

        // Güncelleme işlemi
        const result = await Newsletter.updateMany(
            { _id: { $in: ids } },
            { $set: update }
        );

        return NextResponse.json({
            success: true,
            message: `${result.modifiedCount} abone güncellendi`,
            data: {
                modifiedCount: result.modifiedCount
            }
        });
    } catch (error) {
        console.error('Abone toplu güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 