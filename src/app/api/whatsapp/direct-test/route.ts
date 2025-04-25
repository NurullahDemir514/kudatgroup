import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

/**
 * WhatsApp API'yi doğrudan test etmek için endpoint
 * Burada tüm parametreleri manuel olarak kontrol edip API'ye gönderiyoruz
 */
export async function GET(req: NextRequest) {
    try {
        // API yapılandırması
        const apiToken = process.env.WHATSAPP_API_KEY || "";
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || "";
        const testPhoneNumber = process.env.WHATSAPP_TEST_NUMBER || "";

        const baseUrl = (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, "");
        const url = `${baseUrl}/${phoneNumberId}/messages`;

        // Gerekli konfigürasyonları kontrol et
        if (!apiToken || !phoneNumberId || !testPhoneNumber) {
            return NextResponse.json({
                success: false,
                error: "API yapılandırması eksik",
                config: {
                    apiToken: apiToken ? "Var" : "Eksik",
                    phoneNumberId: phoneNumberId ? "Var" : "Eksik",
                    testPhoneNumber: testPhoneNumber ? "Var" : "Eksik"
                }
            });
        }

        console.log("API İsteği:", {
            url,
            token: "***" + apiToken.slice(-4),
            phoneNumberId,
            testPhoneNumber
        });

        // WhatsApp API payload
        const payload = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: testPhoneNumber,
            type: "template",
            template: {
                name: "hello_world",
                language: {
                    code: "en_US"
                }
            }
        };

        // API headers
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        try {
            console.log("API isteği gönderiliyor...");
            const response = await axios.post(url, payload, { headers });

            return NextResponse.json({
                success: true,
                message: "Mesaj başarıyla gönderildi",
                response: response.data
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