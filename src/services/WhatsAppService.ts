import axios from 'axios';

// WhatsApp mesajı için arayüz tanımı (Interface Segregation Principle)
export interface IWhatsAppMessage {
    to: string;
    templateName: string;
    templateParams: Record<string, string>;
    language: string; // Şablonun dil kodu
}

// WhatsApp servis arayüzü (Dependency Inversion Principle)
export interface IWhatsAppService {
    sendMessage(message: IWhatsAppMessage): Promise<boolean>;
    sendBulkMessages(messages: IWhatsAppMessage[]): Promise<{
        success: number;
        failed: number;
        failedNumbers: string[];
    }>;
}

// WhatsApp API yapılandırması
export interface WhatsAppConfig {
    apiKey: string;
    apiUrl: string;
    businessPhoneNumberId: string;
    businessAccountId: string;
}

// WhatsApp servisi (Single Responsibility Principle)
export class WhatsAppService implements IWhatsAppService {
    private config: WhatsAppConfig;

    constructor(config: WhatsAppConfig) {
        this.config = config;
    }

    // Tek bir mesaj gönder
    async sendMessage(message: IWhatsAppMessage): Promise<boolean> {
        try {
            // WhatsApp Cloud API URL formatı: https://graph.facebook.com/v{version}/{phone-number-id}/messages
            // URL'in sonunda / karakteri olmadığından emin oluyoruz
            const baseUrl = this.config.apiUrl.endsWith('/')
                ? this.config.apiUrl.slice(0, -1)
                : this.config.apiUrl;

            const url = `${baseUrl}/${this.config.businessPhoneNumberId}/messages`;

            // Detaylı log ekle
            console.log('WhatsApp API Konfigürasyonu:', {
                baseUrl,
                businessPhoneNumberId: this.config.businessPhoneNumberId,
                businessAccountId: this.config.businessAccountId,
                finalUrl: url
            });

            const headers = {
                'Authorization': `Bearer ${this.config.apiKey}`,
                'Content-Type': 'application/json'
            };

            const payload = this.formatMessagePayload(message);

            console.log('WhatsApp mesajı gönderiliyor:', { url, payload });

            try {
                const response = await axios.post(url, payload, { headers });
                console.log('WhatsApp API yanıtı:', response.status, response.data);
                return response.status === 200 || response.status === 201;
            } catch (axiosError: any) {
                // Axios hatasını daha detaylı logla
                console.error('WhatsApp API hata detayları:', {
                    status: axiosError.response?.status,
                    statusText: axiosError.response?.statusText,
                    data: axiosError.response?.data,
                    headers: axiosError.response?.headers,
                    config: {
                        url: axiosError.config?.url,
                        method: axiosError.config?.method,
                        headers: axiosError.config?.headers
                    }
                });
                return false;
            }
        } catch (error) {
            console.error('WhatsApp mesajı gönderilirken genel hata:', error);
            return false;
        }
    }

    // Toplu mesaj gönder
    async sendBulkMessages(messages: IWhatsAppMessage[]): Promise<{
        success: number;
        failed: number;
        failedNumbers: string[];
    }> {
        const result = {
            success: 0,
            failed: 0,
            failedNumbers: [] as string[]
        };

        // Her mesajı sırayla gönder (rate limiting'e dikkat)
        for (const message of messages) {
            const success = await this.sendMessage(message);

            if (success) {
                result.success++;
            } else {
                result.failed++;
                result.failedNumbers.push(message.to);
            }

            // API rate limit aşımını önlemek için kısa bir bekleme (1 saniye)
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        return result;
    }

    // Mesaj formatını hazırla (private helper method)
    private formatMessagePayload(message: IWhatsAppMessage): any {
        // WhatsApp Cloud API formatına dönüştür
        const payload: any = {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: message.to,
            type: "template",
            template: {
                name: message.templateName,
                language: {
                    code: message.language || "tr_TR" // Varsayılan olarak Türkçe (TR), aksi belirtilmediyse
                }
            }
        };

        // Parametreler varsa ekle
        if (Object.keys(message.templateParams).length > 0) {
            payload.template.components = this.buildTemplateComponents(message.templateParams);
        }

        return payload;
    }

    // Şablon parametrelerini hazırla
    private buildTemplateComponents(params: Record<string, string>): any[] {
        // Parametre değerlerini hazırla
        const parameters = Object.entries(params).map(([_, value]) => ({
            type: "text",
            text: value
        }));

        // WhatsApp template componenti oluştur
        return [{
            type: "body",
            parameters
        }];
    }
}

// WhatsApp mesaj şablonları (Open/Closed Principle)
export class WhatsAppTemplates {
    static welcome(name: string): IWhatsAppMessage {
        return {
            to: "", // Gönderilecek numara, kullanım yerinde doldurulacak
            templateName: "hosgeldiniz", // Meta Business hesabında bulunan gerçek şablon adı
            templateParams: {
                customer_name: name
            },
            language: "tr_TR" // Türkçe (TR) şablon
        };
    }

    static helloWorld(): IWhatsAppMessage {
        return {
            to: "",
            templateName: "hello_world",
            templateParams: {}, // Parametre yok - boş nesne
            language: "en_US" // İngilizce (US) şablon
        };
    }

    static promotion(name: string, offerType: string, validUntil: string): IWhatsAppMessage {
        return {
            to: "",
            templateName: "hosgeldiniz", // Diğer şablonlar için de varsayılan olarak hosgeldiniz kullanıyoruz
            templateParams: {
                customer_name: name
            },
            language: "tr_TR" // Türkçe (TR) şablon
        };
    }

    static paymentReminder(name: string, amount: string, dueDate: string): IWhatsAppMessage {
        return {
            to: "",
            templateName: "hosgeldiniz",
            templateParams: {
                customer_name: name
            },
            language: "tr_TR" // Türkçe (TR) şablon
        };
    }

    static eventInvitation(name: string, eventName: string, eventDate: string, eventLocation: string): IWhatsAppMessage {
        return {
            to: "",
            templateName: "hosgeldiniz",
            templateParams: {
                customer_name: name
            },
            language: "tr_TR" // Türkçe (TR) şablon
        };
    }
}

// WhatsApp servis konfigürasyonu için varsayılan değerler
export const defaultWhatsAppConfig: WhatsAppConfig = {
    apiKey: process.env.WHATSAPP_API_KEY || "",
    apiUrl: (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, ""), // Sondaki / karakterini kaldır
    businessPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || ""
}; 