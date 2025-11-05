import { NextResponse } from 'next/server';
import { newsletterService, userService } from '@/services/firebaseServices';
import bcrypt from 'bcryptjs';

// Firebase'e test verisi ekleme ve bağlantıyı test etme
export async function GET() {
    try {
        console.log('Firebase bağlantısı test ediliyor...');

        // Test newsletter verisi ekle
        const testNewsletter = await newsletterService.create({
            name: 'Test Kullanıcı',
            phone: '5551234567',
            email: 'test@example.com',
            addressCity: 'İstanbul',
            whatsappEnabled: true,
            active: true,
            subscriptionDate: new Date()
        });

        console.log('Test newsletter oluşturuldu:', testNewsletter);

        // Test admin kullanıcısı ekle
        const hashedPassword = await bcrypt.hash('password123', 10);
        const testUser = await userService.create({
            username: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin'
        });

        console.log('Test admin kullanıcısı oluşturuldu:', testUser);

        // Newsletter'ları listele
        const newsletters = await newsletterService.getAll();
        console.log('Toplam newsletter sayısı:', newsletters.length);

        return NextResponse.json({
            success: true,
            message: 'Firebase bağlantısı başarılı!',
            data: {
                testNewsletter,
                testUser,
                totalNewsletters: newsletters.length
            }
        });

    } catch (error: any) {
        console.error('Firebase test hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                details: error 
            },
            { status: 500 }
        );
    }
}
