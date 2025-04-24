import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { WhatsAppTemplate } from '@/models/WhatsAppTemplate';
import axios from 'axios';

// WhatsApp şablon tipi
type WhatsAppTemplate = {
    id: string;
    name: string;
    status: string;
    category: string;
    language: string;
    paramCount: number;
};

// Tüm şablonları getir
export async function GET(req: NextRequest) {
    try {
        // API token ve phone number ID'yi ortam değişkenlerinden al
        const apiToken = process.env.WHATSAPP_API_KEY;
        const businessPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
        const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "1423176962006163"; // Business account ID (WABA ID)
        const apiUrlRaw = process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0";

        // API URL'in sonunda slash varsa kaldır
        const apiUrl = apiUrlRaw.endsWith('/') ? apiUrlRaw.slice(0, -1) : apiUrlRaw;

        if (!apiToken || !businessAccountId) {
            return NextResponse.json(
                { success: false, error: "WhatsApp API yapılandırması eksik" },
                { status: 500 }
            );
        }

        console.log("API isteği gönderiliyor:", `${apiUrl}/${businessAccountId}/message_templates`);

        // WhatsApp API'den şablonları çek - Business Account ID kullanarak
        const url = `${apiUrl}/${businessAccountId}/message_templates`;
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        const response = await axios.get(url, { headers });

        console.log("API yanıtı alındı:", response.status);

        // Sadece APPROVED ve ENABLED durumunda olan şablonları filtrele
        const templates = response.data.data.filter(
            (template: any) => template.status === 'APPROVED' || template.status === 'ENABLED'
        );

        console.log(`${templates.length} onaylı şablon bulundu`);

        // Şablonları daha kullanışlı bir formata dönüştür
        const formattedTemplates = templates.map((template: any) => {
            const components = template.components || [];

            // Şablon değişkenlerini say
            let paramCount = 0;
            components.forEach((component: any) => {
                if (component.type === 'BODY' || component.type === 'HEADER') {
                    const bodyText = component.text || component.example?.body_text || '';
                    const matches = bodyText.match(/{{[0-9]+}}/g) || [];
                    paramCount += matches.length;
                }
            });

            return {
                id: template.name,
                name: template.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                status: template.status,
                category: template.category,
                language: template.language,
                paramCount: paramCount || 1, // En az 1 parametre
                createdTime: template.created_time
            };
        });

        return NextResponse.json({
            success: true,
            templates: formattedTemplates
        });
    } catch (error: any) {
        console.error('WhatsApp şablonları alınırken hata:', error.response?.data || error.message);

        // Hata durumunda sabit şablonları döndür
        const fallbackTemplates: WhatsAppTemplate[] = [
            { id: "hello_world", name: "Hello World", status: "APPROVED", category: "UTILITY", language: "en_US", paramCount: 1 }
        ];

        return NextResponse.json(
            {
                success: true,
                templates: fallbackTemplates,
                note: "API bağlantı hatası nedeniyle varsayılan şablonlar gösteriliyor"
            }
        );
    }
}

// ID ile şablon bilgilerini getir
export async function POST(req: NextRequest) {
    try {
        const { templateId } = await req.json();

        if (!templateId) {
            return NextResponse.json(
                { success: false, error: "Şablon ID'si gereklidir" },
                { status: 400 }
            );
        }

        // Sabit şablonlar
        const templates = [
            {
                id: "hello_world",
                name: "Hello World",
                description: "İngilizce karşılama mesajı",
                example: {
                    name: "John"
                }
            }
        ];

        const template = templates.find(t => t.id === templateId);

        if (!template) {
            return NextResponse.json(
                { success: false, error: "Şablon bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: template
        });
    } catch (error: any) {
        console.error("WhatsApp şablonu getirilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 