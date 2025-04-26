import mongoose, { Schema, models } from 'mongoose';

export interface INewsletter {
    _id?: string;
    phone: string;
    name: string;
    email?: string;
    companyName?: string;
    addressCity: string;
    addressDistrict?: string;
    addressStreet?: string;
    addressPostalCode?: string;
    taxNumber?: string;
    active: boolean;
    subscriptionDate: Date;
    tags?: string[];
    notes?: string;
    whatsappEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
    {
        phone: {
            type: String,
            required: [true, 'Telefon numarası zorunlu'],
            unique: true,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return /^[0-9]{10,11}$/.test(v);
                },
                message: props => `${props.value} geçerli bir telefon numarası değil! 10-11 haneli olmalıdır.`
            }
        },
        name: {
            type: String,
            required: [true, 'İsim zorunlu'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
            validate: {
                validator: function (v: string) {
                    return v === undefined || v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
                },
                message: props => `${props.value} geçerli bir e-posta adresi değil!`
            }
        },
        companyName: {
            type: String,
            trim: true,
        },
        addressCity: {
            type: String,
            required: [true, 'İl bilgisi zorunludur'],
            trim: true,
        },
        addressDistrict: {
            type: String,
            trim: true,
        },
        addressStreet: {
            type: String,
            trim: true,
        },
        addressPostalCode: {
            type: String,
            trim: true,
        },
        taxNumber: {
            type: String,
            trim: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
        subscriptionDate: {
            type: Date,
            default: Date.now,
        },
        tags: {
            type: [String],
            default: [],
        },
        notes: {
            type: String,
            trim: true,
        },
        whatsappEnabled: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// Mevcut model varsa siliyoruz ve yeniden oluşturuyoruz
// Bu, eski model tanımının etkilerini temizleyecek
if (mongoose.models.Newsletter) {
    delete mongoose.models.Newsletter;
}

// Şimdi temiz bir şekilde modeli oluşturuyoruz
export const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema); 