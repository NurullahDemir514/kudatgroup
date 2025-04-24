import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WhatsAppTemplate } from '@/models/WhatsAppTemplate';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';
import { Newsletter } from '@/models/Newsletter';
import { WhatsAppService, WhatsAppTemplates, defaultWhatsAppConfig } from "@/services/WhatsAppService";

// WhatsApp gönderim servisi örneği
const whatsappService = new WhatsAppService({
    apiKey: process.env.WHATSAPP_API_KEY || "",
    apiUrl: (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, ""),
    businessPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""
});

// Başlangıçta ortam değişkenlerini kontrol et
console.log("WhatsApp API Ortam Değişkenleri:", {
    API_URL: process.env.WHATSAPP_API_URL,
    PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
    BUSINESS_ACCOUNT_ID: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
});

// WhatsApp mesajı gönderme
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        const data = await req.json();

        // Gerekli alanları kontrol et
        if (!data.templateId || !data.filters) {
            return NextResponse.json(
                { success: false, error: "Şablon ID ve filtreler zorunludur" },
                { status: 400 }
            );
        }

        // Gönderilecek aboneleri bul
        const filter: any = { active: true };

        // Ek filtreler (opsiyonel)
        if (data.filters.tags && Array.isArray(data.filters.tags) && data.filters.tags.length > 0) {
            filter.tags = { $in: data.filters.tags };
        }

        if (data.filters.companyName) {
            filter.companyName = { $regex: new RegExp(data.filters.companyName, 'i') };
        }

        // Aboneleri getir
        const subscribers = await Newsletter.find(filter);

        if (subscribers.length === 0) {
            return NextResponse.json(
                { success: false, error: "Seçilen kriterlere uyan abone bulunamadı" },
                { status: 404 }
            );
        }

        // Test modu kontrolü: Sadece test numaralarına gönder
        if (data.testMode && data.testPhones && Array.isArray(data.testPhones)) {
            const testPhonesSet = new Set(data.testPhones);

            // Sadece test numaralarını içeren aboneleri filtrele
            const filteredSubscribers = subscribers.filter(sub => testPhonesSet.has(sub.phone));

            if (filteredSubscribers.length === 0) {
                return NextResponse.json(
                    { success: false, error: "Test numaralarına sahip abone bulunamadı" },
                    { status: 404 }
                );
            }

            const result = await sendMessages(filteredSubscribers, data.templateId, data.params || {});

            return NextResponse.json({
                success: true,
                data: {
                    ...result,
                    testMode: true,
                    totalSelected: filteredSubscribers.length
                }
            });
        }

        // Normal mod (tüm filtrelenen abonelere gönder)
        const result = await sendMessages(subscribers, data.templateId, data.params || {});

        return NextResponse.json({
            success: true,
            data: {
                ...result,
                totalSelected: subscribers.length
            }
        });
    } catch (error: any) {
        console.error("WhatsApp mesajı gönderilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Mesaj gönderme yardımcı fonksiyonu
async function sendMessages(subscribers: any[], templateId: string, customParams: Record<string, string>) {
    // Mesajları hazırla
    const messages = subscribers.map(subscriber => {
        // Şablona göre mesaj oluştur
        let message;
        const name = subscriber.name || "Değerli Müşterimiz";

        switch (templateId) {
            case "hosgeldiniz":
                // Bu şablon aktif değil, hello_world kullanalım
                message = WhatsAppTemplates.helloWorld(name);
                break;

            case "hello_world":
                message = WhatsAppTemplates.helloWorld(name);
                break;

            // Diğer durumlar için varsayılan olarak hello_world şablonunu kullan
            default:
                message = WhatsAppTemplates.helloWorld(name);
        }

        // Telefon numarasını ayarla (WhatsApp formatına: 905xxxxxxxxx)
        message.to = formatPhoneNumber(subscriber.phone);

        return message;
    });

    // Mesajları gönder
    return await whatsappService.sendBulkMessages(messages);
}

// Telefon numarası formatı düzenleme (WhatsApp API için)
function formatPhoneNumber(phoneNumber: string): string {
    // Baştaki 0'ı kaldır ve 90 ekle (Türkiye)
    let formatted = phoneNumber.trim();

    // Eğer başında 0 varsa kaldır
    if (formatted.startsWith('0')) {
        formatted = formatted.substring(1);
    }

    // Eğer başında + varsa kaldır
    if (formatted.startsWith('+')) {
        formatted = formatted.substring(1);
    }

    // Eğer başında 90 yoksa ekle
    if (!formatted.startsWith('90')) {
        formatted = '90' + formatted;
    }

    return formatted;
} 