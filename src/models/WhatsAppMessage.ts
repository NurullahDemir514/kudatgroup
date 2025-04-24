import mongoose, { Schema, models } from 'mongoose';

// WhatsApp mesaj durumları
export enum MessageStatus {
    PENDING = 'pending',
    SENT = 'sent',
    DELIVERED = 'delivered',
    READ = 'read',
    FAILED = 'failed'
}

// WhatsApp mesajı için tip tanımlaması
export interface IWhatsAppMessage {
    _id?: string;
    templateId: string;
    to: string;
    parameters: Record<string, string>;
    content: string;
    status: MessageStatus;
    errorMessage?: string;
    messageId?: string; // WhatsApp tarafından dönen mesaj ID'si
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

// WhatsApp mesaj şeması
const whatsAppMessageSchema = new Schema<IWhatsAppMessage>(
    {
        templateId: {
            type: String,
            required: [true, 'Şablon ID zorunludur'],
            ref: 'WhatsAppTemplate'
        },
        to: {
            type: String,
            required: [true, 'Alıcı telefon numarası zorunludur'],
            trim: true,
        },
        parameters: {
            type: Map,
            of: String,
            default: {},
        },
        content: {
            type: String,
            required: [true, 'Mesaj içeriği zorunludur'],
        },
        status: {
            type: String,
            enum: Object.values(MessageStatus),
            default: MessageStatus.PENDING,
        },
        errorMessage: {
            type: String,
        },
        messageId: {
            type: String, // WhatsApp API'den gelen mesaj ID'si
        },
        sentAt: {
            type: Date,
        },
        deliveredAt: {
            type: Date,
        },
        readAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

// İndeksler
whatsAppMessageSchema.index({ templateId: 1 });
whatsAppMessageSchema.index({ to: 1 });
whatsAppMessageSchema.index({ status: 1 });
whatsAppMessageSchema.index({ createdAt: 1 });

// Model oluştur
export const WhatsAppMessage = models.WhatsAppMessage ||
    mongoose.model<IWhatsAppMessage>('WhatsAppMessage', whatsAppMessageSchema); 