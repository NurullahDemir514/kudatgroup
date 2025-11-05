import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET() {
    try {
        await connectToDatabase();

        // Önce mevcut admin kullanıcısını sil
        await User.deleteMany({ username: 'admin' });

        // Yeni admin kullanıcısı oluştur
        const hashedPassword = await bcrypt.hash('password123', 10);
        const adminUser = await User.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
        });

        return NextResponse.json({
            success: true,
            message: 'Admin kullanıcısı başarıyla oluşturuldu',
            user: {
                username: adminUser.username,
                email: adminUser.email,
                role: adminUser.role,
                password: 'password123' // Sadece gösterim için
            }
        });
    } catch (error) {
        console.error('Admin kullanıcısı oluşturma hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
