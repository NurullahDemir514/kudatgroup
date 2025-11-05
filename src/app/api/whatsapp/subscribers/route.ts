import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/services/firebaseServices';

// WhatsApp mesajları için abone listesini getir
export async function GET(req: NextRequest) {
    try {
        // URL parametrelerini al
        const { searchParams } = new URL(req.url);
        const showAll = searchParams.get('showAll') === 'true';

        // Önbelleği devre dışı bırak
        const headers = new Headers();
        headers.append('Cache-Control', 'no-cache, no-store, must-revalidate');
        headers.append('Pragma', 'no-cache');
        headers.append('Expires', '0');

        // Filtre oluştur
        const filter: any = {};

        // Hepsini göster seçeneği aktif değilse, aktif ve WhatsApp'a açık olanları getir
        if (!showAll) {
            filter.active = true;
            filter.whatsappEnabled = true;
        }

        // Firebase'den tüm aboneleri getir
        const allSubscribers = await newsletterService.getAll();
        
        // Filtreleme yap (client-side)
        const subscribers = showAll 
            ? allSubscribers
            : allSubscribers.filter((s: any) => s.active && s.whatsappEnabled);

        // İstatistik için sayım yap
        const totalCount = allSubscribers.length;
        const activeCount = allSubscribers.filter((s: any) => s.active).length;
        const whatsappEnabledCount = allSubscribers.filter((s: any) => s.whatsappEnabled).length;
        const activePlusWhatsappCount = allSubscribers.filter((s: any) => s.active && s.whatsappEnabled).length;

        console.log(`${subscribers.length} abone bulundu ve gönderiliyor (Toplam: ${totalCount}, Aktif: ${activeCount}, WhatsApp'a açık: ${whatsappEnabledCount}, Her ikisine uyan: ${activePlusWhatsappCount})`);

        return NextResponse.json({
            success: true,
            subscribers,
            stats: {
                total: totalCount,
                active: activeCount,
                whatsappEnabled: whatsappEnabledCount,
                activePlusWhatsapp: activePlusWhatsappCount
            },
            timestamp: new Date().toISOString()
        }, { headers });
    } catch (error: any) {
        console.error("Aboneler yüklenirken hata:", error);
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString()
            },
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