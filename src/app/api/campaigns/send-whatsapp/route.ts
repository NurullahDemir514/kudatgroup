import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Campaign } from '@/models/Campaign';
import { Newsletter } from '@/models/Newsletter';
import { WhatsAppTemplate } from '@/models/WhatsAppTemplate';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';

// Kampanya WhatsApp mesajlarını gönder
export async function POST(request: NextRequest) {
    try {
        await connectToDatabase();

        const data = await request.json();
        const { campaignId, templateId, parameters, tags = [] } = data;

        // Zorunlu alanları kontrol et
        if (!campaignId) {
            return NextResponse.json(
                { success: false, error: 'Kampanya ID zorunludur' },
                { status: 400 }
            );
        }

        if (!templateId) {
            return NextResponse.json(
                { success: false, error: 'Şablon ID zorunludur' },
                { status: 400 }
            );
        }

        // Kampanyayı getir
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return NextResponse.json(
                { success: false, error: 'Belirtilen kampanya bulunamadı' },
                { status: 404 }
            );
        }

        // Şablonu getir
        const template = await WhatsAppTemplate.findById(templateId);
        if (!template) {
            return NextResponse.json(
                { success: false, error: 'Belirtilen şablon bulunamadı' },
                { status: 404 }
            );
        }

        // Şablonun parametrelerini kontrol et
        if (template.parameters && template.parameters.length > 0) {
            for (const param of template.parameters) {
                if (!parameters || !parameters[param] || parameters[param].trim() === '') {
                    return NextResponse.json(
                        { success: false, error: `'${param}' parametresi zorunludur` },
                        { status: 400 }
                    );
                }
            }
        }

        // Hedef kitle filtresini oluştur
        const subscriberQuery: any = { active: true };

        // Etiketler belirtildiyse, onları filtre olarak ekle
        if (tags && tags.length > 0) {
            subscriberQuery.tags = { $in: tags };
        }

        // Hedef kitleyi getir
        const subscribers = await Newsletter.find(subscriberQuery);

        // Eğer gönderilecek abone yoksa hata döndür
        if (!subscribers || subscribers.length === 0) {
            return NextResponse.json(
                { success: false, error: 'Gönderilecek aktif abone bulunamadı' },
                { status: 404 }
            );
        }

        // Mesaj içeriğini oluştur
        let messageContent = template.content;

        // Parametreleri içeriğe yerleştir
        if (parameters && typeof parameters === 'object') {
            Object.entries(parameters).forEach(([key, value]) => {
                messageContent = messageContent.replace(
                    new RegExp(`{{${key}}}`, 'g'),
                    String(value)
                );
            });
        }

        // Değiştirilmemiş parametreleri kontrol et
        const remainingParams = messageContent.match(/{{([^}]+)}}/g);
        if (remainingParams) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Tüm parametreler doldurulmamış',
                    missingParams: remainingParams.map((p: string) => p.replace(/{{|}}/g, ''))
                },
                { status: 400 }
            );
        }

        // Burada gerçek WhatsApp API entegrasyonu yapılabilir
        // Örneğin: Twilio, MessageBird, veya WhatsApp Business API kullanımı

        // Abonelerin ID'lerini al
        const subscriberIds = subscribers.map(sub => sub._id.toString());

        // Mesajı kaydet
        const newMessage = await WhatsAppMessage.create({
            templateId,
            recipients: subscriberIds,
            parameters: parameters || {},
            messageContent,
            status: 'sent', // Gerçek entegrasyonda 'pending' olarak başlar
            sentAt: new Date()
        });

        // Kampanyayı güncelle
        await Campaign.findByIdAndUpdate(campaignId, {
            $set: {
                messageTemplateId: templateId,
                targetGroups: tags || [],
                whatsappSent: (campaign.whatsappSent || 0) + subscribers.length
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Kampanya mesajları başarıyla gönderildi',
            data: {
                messageId: newMessage._id,
                campaignId,
                recipientCount: subscribers.length,
                sentAt: newMessage.sentAt
            }
        });
    } catch (error) {
        console.error('Kampanya mesajı gönderme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 