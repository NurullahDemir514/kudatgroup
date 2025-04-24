import mongoose, { Schema, models } from 'mongoose';

export interface ICampaign {
    _id?: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    status: 'planned' | 'active' | 'completed';
    sentEmails: number;
    clickRate: number;
    messageTemplateId?: mongoose.Types.ObjectId | string; // WhatsApp mesaj şablonu ID'si
    targetGroups?: string[]; // Hedef etiketler/gruplar
    whatsappSent?: number; // WhatsApp üzerinden gönderim sayısı
    createdAt: Date;
    updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
    {
        name: {
            type: String,
            required: [true, 'Kampanya adı zorunlu'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Açıklama zorunlu'],
            trim: true,
        },
        startDate: {
            type: Date,
            required: [true, 'Başlangıç tarihi zorunlu'],
        },
        endDate: {
            type: Date,
            required: [true, 'Bitiş tarihi zorunlu'],
        },
        status: {
            type: String,
            enum: ['planned', 'active', 'completed'],
            default: 'planned',
        },
        sentEmails: {
            type: Number,
            default: 0,
        },
        clickRate: {
            type: Number,
            default: 0,
        },
        messageTemplateId: {
            type: Schema.Types.ObjectId,
            ref: 'WhatsAppTemplate',
        },
        targetGroups: {
            type: [String],
            default: [],
        },
        whatsappSent: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

export const Campaign = models.Campaign || mongoose.model<ICampaign>('Campaign', campaignSchema); 