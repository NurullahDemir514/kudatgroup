import mongoose, { Schema, models } from 'mongoose';

export interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: string;
    status?: 'active' | 'inactive';
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'İsim zorunlu'],
            unique: true,
        },
        email: {
            type: String,
            required: [true, 'Email zorunlu'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Şifre zorunlu'],
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
        },
    },
    { timestamps: true }
);

// Eğer model zaten varsa tekrar oluşturmaya çalışmayacak
export const User = models.User || mongoose.model<IUser>('User', userSchema); 