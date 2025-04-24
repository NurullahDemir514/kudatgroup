import mongoose, { Schema, models } from 'mongoose';

// WhatsApp şablonu için tip tanımlaması
export interface IWhatsAppTemplate {
    _id?: string;
    name: string;
    description: string;
    templateId: string;
    parameters: string[];
    content: string;
    category: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// WhatsApp şablon şeması
const whatsAppTemplateSchema = new Schema<IWhatsAppTemplate>(
    {
        name: {
            type: String,
            required: [true, 'Şablon adı zorunludur'],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        templateId: {
            type: String,
            required: [true, 'WhatsApp şablon ID zorunludur'],
            trim: true,
            unique: true,
        },
        parameters: {
            type: [String],
            default: [],
        },
        content: {
            type: String,
            required: [true, 'Şablon içeriği zorunludur'],
            trim: true,
        },
        category: {
            type: String,
            enum: ['marketing', 'transactional', 'service', 'authentication', 'other'],
            default: 'other',
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Şablondan parametre çıkarma yardımcı metodu
whatsAppTemplateSchema.pre('save', function (next) {
    // Eğer parameters dizisi boşsa ve content varsa
    if (this.parameters.length === 0 && this.content) {
        // İçerikten {{parametre}} formatındaki değişkenleri çıkar
        const regex = /{{([^}]+)}}/g;
        let match;
        const params: string[] = [];

        while ((match = regex.exec(this.content)) !== null) {
            const param = match[1].trim();
            if (!params.includes(param)) {
                params.push(param);
            }
        }

        this.parameters = params;
    }
    next();
});

// Model oluştur
export const WhatsAppTemplate = models.WhatsAppTemplate ||
    mongoose.model<IWhatsAppTemplate>('WhatsAppTemplate', whatsAppTemplateSchema); 