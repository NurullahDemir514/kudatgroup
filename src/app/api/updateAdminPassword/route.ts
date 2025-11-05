import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';

export async function GET() {
    try {
        await connectToDatabase();

        // Yeni şifre
        const newPassword = 'kudat4747';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Admin kullanıcısını bul ve şifreyi güncelle
        const updatedUser = await User.findOneAndUpdate(
            { username: 'admin' },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            // Admin kullanıcısı bulunamadıysa, yeni bir admin kullanıcısı oluştur
            // Email alanını boş bir string olarak ayarla (veya tamamen çıkarmak için şemayı da güncellemek gerekir)
            await User.create({
                username: 'admin',
                email: 'admin@example.com',
                password: hashedPassword,
                role: 'admin',
            });

            return NextResponse.json({
                success: true,
                message: 'Admin kullanıcısı oluşturuldu',
                details: {
                    username: 'admin',
                    password: newPassword // Sadece onay için gösteriliyor
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Admin şifresi başarıyla güncellendi',
                details: {
                    username: updatedUser.username,
                    password: newPassword // Sadece onay için gösteriliyor
                }
        });
    } catch (error) {
        console.error('Şifre güncelleme hatası:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
} 