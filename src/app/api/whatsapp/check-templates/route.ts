import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * WhatsApp şablonlarını doğrudan kontrol eden endpoint
 * Bu şablonların hangi dil kodlarıyla kayıtlı olduğunu görmek için kullanılır
 */
export async function GET(req: NextRequest) {
    try {
        // API yapılandırması
        const apiToken = process.env.WHATSAPP_API_KEY || "";
        const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "";

        const baseUrl = (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, "");
        const url = `${baseUrl}/${businessAccountId}/message_templates`;

        // Gerekli konfigürasyonları kontrol et
        if (!apiToken || !businessAccountId) {
            return NextResponse.json({
                success: false,
                error: "API yapılandırması eksik",
                config: {
                    apiToken: apiToken ? "Var" : "Eksik",
                    businessAccountId: businessAccountId ? "Var" : "Eksik"
                }
            });
        }

        console.log("Şablonlar API İsteği:", {
            url,
            token: "***" + apiToken.slice(-4),
            businessAccountId
        });

        // API headers
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        try {
            console.log("API isteği gönderiliyor...");
            const response = await axios.get(url, { headers });

            // API yanıtını daha okunaklı hale getir
            const templates = response.data.data.map((template: any) => {
                return {
                    name: template.name,
                    status: template.status,
                    category: template.category,
                    language: template.language,
                    components: template.components?.map((component: any) => ({
                        type: component.type,
                        text: component.text,
                        example: component.example
                    }))
                };
            });

            return NextResponse.json({
                success: true,
                templates,
                total: templates.length
            });
        } catch (axiosError: any) {
            console.error("API Hatası:", axiosError.response?.data || axiosError.message);

            return NextResponse.json({
                success: false,
                error: "API hatası",
                details: {
                    status: axiosError.response?.status,
                    data: axiosError.response?.data,
                    message: axiosError.message
                }
            });
        }
    } catch (error: any) {
        console.error("Genel hata:", error);
        return NextResponse.json({
            success: false,
            error: error.message
        });
    }
} 