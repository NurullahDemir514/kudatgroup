import mongoose, { Schema, models } from 'mongoose';

export interface ICustomer {
    _id?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    companyName?: string;
    taxNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
    {
        name: {
            type: String,
            required: [true, 'İsim zorunlu'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email zorunlu'],
            trim: true,
            unique: true,
        },
        phone: {
            type: String,
            required: [true, 'Telefon zorunlu'],
            trim: true,
        },
        address: {
            type: String,
            required: [true, 'Adres zorunlu'],
            trim: true,
        },
        companyName: {
            type: String,
            required: false,
            trim: true,
        },
        taxNumber: {
            type: String,
            required: false,
            trim: true,
        },
    },
    { timestamps: true }
);

export const Customer = models.Customer || mongoose.model<ICustomer>('Customer', customerSchema); 