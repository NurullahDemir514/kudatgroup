import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService, WhatsAppTemplates, defaultWhatsAppConfig } from '@/services/WhatsAppService';
import axios from 'axios';

// WhatsApp API test endpoint'i
export async function POST(req: NextRequest) {
    try {
        const { phoneNumber, templateId } = await req.json();

        if (!phoneNumber || !templateId) {
            return NextResponse.json(
                { success: false, error: "Telefon numarası ve şablon ID'si zorunludur" },
                { status: 400 }
            );
        }

        // Telefon numarası formatı kontrolü
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return NextResponse.json(
                { success: false, error: "Geçerli bir telefon numarası giriniz (10-11 haneli)" },
                { status: 400 }
            );
        }

        // WhatsApp API'ye bağlantı için yapılandırma
        const whatsappService = new WhatsAppService(defaultWhatsAppConfig);

        // API yapılandırmasını kontrol et
        if (!defaultWhatsAppConfig.apiKey || !defaultWhatsAppConfig.businessPhoneNumberId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "WhatsApp API yapılandırması eksik. Lütfen .env dosyasını kontrol edin.",
                    missingConfigs: {
                        apiKey: !defaultWhatsAppConfig.apiKey,
                        businessPhoneNumberId: !defaultWhatsAppConfig.businessPhoneNumberId
                    }
                },
                { status: 500 }
            );
        }

        // Formatlanmış telefon numarası
        const formattedPhone = formatPhoneNumber(phoneNumber);

        // Seçilen şablona göre test mesajı oluştur
        let message;
        switch (templateId) {
            case 'welcome_message':
                message = WhatsAppTemplates.welcome('Test Kullanıcı');
                break;
            case 'promotion_offer':
                message = WhatsAppTemplates.promotion(
                    'Test Kullanıcı',
                    'Test Kampanya',
                    '31.12.2023'
                );
                break;
            case 'payment_reminder':
                message = WhatsAppTemplates.paymentReminder(
                    'Test Kullanıcı',
                    '100 TL',
                    '31.12.2023'
                );
                break;
            case 'event_invitation':
                message = WhatsAppTemplates.eventInvitation(
                    'Test Kullanıcı',
                    'Test Etkinlik',
                    '31.12.2023',
                    'İstanbul'
                );
                break;
            default:
                message = WhatsAppTemplates.welcome('Test Kullanıcı');
        }

        // Telefon numarasını ayarla
        message.to = formattedPhone;

        // Mesajı gönder
        const result = await whatsappService.sendMessage(message);

        if (result) {
            return NextResponse.json({
                success: true,
                message: "Test mesajı başarıyla gönderildi",
                details: {
                    template: templateId,
                    phone: formattedPhone
                }
            });
        } else {
            return NextResponse.json(
                { success: false, error: "Mesaj gönderimi başarısız oldu" },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("WhatsApp test mesajı gönderilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
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

/**
 * WhatsApp API bağlantısını test etmek için özel endpoint
 * Bu endpoint sayesinde API anahtarının, URL'nin ve diğer yapılandırmaların doğruluğunu kontrol edebiliriz
 */
export async function GET(req: NextRequest) {
    try {
        // WhatsApp yapılandırması
        const apiToken = process.env.WHATSAPP_API_KEY || "";
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
        const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";
        const apiUrl = (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, "");

        // Konfigürasyon kontrolü
        if (!apiToken || !phoneNumberId || !businessAccountId) {
            return NextResponse.json(
                {
                    success: false,
                    error: "WhatsApp API yapılandırması eksik",
                    config: {
                        apiToken: apiToken ? "Mevcut" : "Eksik",
                        phoneNumberId: phoneNumberId ? "Mevcut" : "Eksik",
                        businessAccountId: businessAccountId ? "Mevcut" : "Eksik",
                        apiUrl: apiUrl
                    }
                },
                { status: 500 }
            );
        }

        // Bağlantı testleri
        const tests = [];

        // 1. Telefon numarası bilgilerini kontrol et
        try {
            const phoneUrl = `${apiUrl}/${phoneNumberId}`;
            const headers = {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            };

            console.log("Test 1: Telefon numarası bilgisi isteği:", phoneUrl);
            const phoneResponse = await axios.get(phoneUrl, { headers });

            tests.push({
                test: "Telefon Numarası Kontrolü",
                success: true,
                data: phoneResponse.data,
                status: phoneResponse.status
            });
        } catch (error: any) {
            console.error("Telefon numarası testi hatası:", error.response?.data || error.message);
            tests.push({
                test: "Telefon Numarası Kontrolü",
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            });
        }

        // 2. Business account bilgilerini kontrol et
        try {
            const businessUrl = `${apiUrl}/${businessAccountId}`;
            const headers = {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            };

            console.log("Test 2: Business account bilgisi isteği:", businessUrl);
            const businessResponse = await axios.get(businessUrl, { headers });

            tests.push({
                test: "Business Account Kontrolü",
                success: true,
                data: businessResponse.data,
                status: businessResponse.status
            });
        } catch (error: any) {
            console.error("Business account testi hatası:", error.response?.data || error.message);
            tests.push({
                test: "Business Account Kontrolü",
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            });
        }

        // 3. Templates endpoint'ini kontrol et
        try {
            const templatesUrl = `${apiUrl}/${businessAccountId}/message_templates`;
            const headers = {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            };

            console.log("Test 3: Şablonlar isteği:", templatesUrl);
            const templatesResponse = await axios.get(templatesUrl, { headers });

            tests.push({
                test: "Şablonlar Kontrolü",
                success: true,
                count: templatesResponse.data?.data?.length || 0,
                status: templatesResponse.status
            });
        } catch (error: any) {
            console.error("Şablonlar testi hatası:", error.response?.data || error.message);
            tests.push({
                test: "Şablonlar Kontrolü",
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status || 500
            });
        }

        return NextResponse.json({
            success: true,
            config: {
                apiToken: "********" + apiToken.slice(-4),
                phoneNumberId,
                businessAccountId,
                apiUrl
            },
            tests
        });
    } catch (error: any) {
        console.error("WhatsApp API testi hatası:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 