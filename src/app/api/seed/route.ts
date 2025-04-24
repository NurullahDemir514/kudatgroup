import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { User } from '@/models/User';
import { Customer } from '@/models/Customer';
import { Product } from '@/models/Product';
import { Newsletter } from '@/models/Newsletter';
import { Campaign } from '@/models/Campaign';
import { Event } from '@/models/Events';
import { Sale } from '@/models/Sale';
import { WhatsAppTemplate } from '@/models/WhatsAppTemplate';
import { WhatsAppMessage } from '@/models/WhatsAppMessage';

export async function GET() {
    try {
        await connectToDatabase();

        // Veritabanındaki tüm verileri temizle (Dikkat: Gerçek uygulamada kullanılmamalıdır!)
        await User.deleteMany({});
        await Customer.deleteMany({});
        await Product.deleteMany({});
        await Newsletter.deleteMany({});
        await Campaign.deleteMany({});
        await Event.deleteMany({});
        await Sale.deleteMany({});
        await WhatsAppTemplate.deleteMany({});
        await WhatsAppMessage.deleteMany({});

        // Admin kullanıcısı oluştur
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'admin',
            email: 'admin@example.com',
            password: hashedPassword,
            role: 'admin',
            status: 'active',
        });

        // Örnek müşteriler
        const customers = await Customer.create([
            {
                name: 'Ahmet Yılmaz',
                email: 'ahmet@example.com',
                phone: '+90 555 123 4567',
                address: 'İstanbul, Türkiye',
            },
            {
                name: 'Ayşe Kaya',
                email: 'ayse@example.com',
                phone: '+90 555 987 6543',
                address: 'Ankara, Türkiye',
            },
            {
                name: 'Mehmet Demir',
                email: 'mehmet@example.com',
                phone: '+90 555 456 7890',
                address: 'İzmir, Türkiye',
            },
        ]);

        // Örnek ürünler
        const products = await Product.create([
            {
                name: 'Gümüş Bileklik',
                description: 'El işçiliği gümüş bileklik',
                price: 1299.99,
                stock: 45,
                category: 'Bileklik',
            },
            {
                name: 'Özel Tasarım Yüzük',
                description: 'Swarovski taşlı gümüş yüzük',
                price: 999.99,
                stock: 120,
                category: 'Yüzük',
            },
            {
                name: 'Gümüş Kolye',
                description: 'Zarif gümüş kolye',
                price: 1499.99,
                stock: 78,
                category: 'Kolye',
            },
        ]);

        // Örnek bülten aboneleri
        await Newsletter.create([
            {
                email: 'kullanici1@example.com',
                name: 'Kullanıcı Bir',
                subscriptionDate: new Date('2023-01-20'),
                active: true,
            },
            {
                email: 'kullanici2@example.com',
                name: 'Kullanıcı İki',
                subscriptionDate: new Date('2023-02-15'),
                active: true,
            },
            {
                email: 'kullanici3@example.com',
                name: 'Kullanıcı Üç',
                subscriptionDate: new Date('2023-03-05'),
                active: false,
            },
        ]);

        // Örnek kampanyalar
        await Campaign.create([
            {
                name: 'Yaz İndirimi',
                description: 'Tüm takılarda %20 indirim',
                startDate: new Date('2023-06-01'),
                endDate: new Date('2023-08-31'),
                status: 'active',
                sentEmails: 1250,
                clickRate: 32.4,
            },
            {
                name: 'Kış Kampanyası',
                description: 'Kış koleksiyonunda büyük indirim',
                startDate: new Date('2023-12-01'),
                endDate: new Date('2024-02-28'),
                status: 'planned',
                sentEmails: 0,
                clickRate: 0,
            },
            {
                name: 'Bahar Fırsatları',
                description: 'Bahar koleksiyonunda özel fiyatlar',
                startDate: new Date('2023-03-15'),
                endDate: new Date('2023-05-15'),
                status: 'completed',
                sentEmails: 1875,
                clickRate: 45.2,
            },
        ]);

        // Örnek etkinlikler
        const futureDate = (days: number) => {
            const date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        };

        await Event.create([
            {
                title: 'Yeni Koleksiyon Lansman',
                date: futureDate(15),
                type: 'Etkinlik',
                color: 'from-rose-300 to-rose-400',
                description: 'Yaz koleksiyonu için lansman etkinliği',
                attendees: ['Ahmet Yılmaz', 'Ayşe Kaya']
            },
            {
                title: 'Tedarikçi Toplantısı',
                date: futureDate(22),
                type: 'Toplantı',
                color: 'from-blue-300 to-blue-400',
                description: 'Yeni tedarikçiler ile tanışma toplantısı'
            },
            {
                title: 'Sosyal Medya Kampanyası',
                date: futureDate(30),
                type: 'Pazarlama',
                color: 'from-gray-300 to-gray-400',
                description: 'Instagram ve Facebook kampanyası başlangıcı'
            },
            {
                title: 'Stok Sayımı',
                date: futureDate(45),
                type: 'Envanter',
                color: 'from-emerald-300 to-emerald-400',
                description: 'Yıllık stok sayımı'
            }
        ]);

        // Örnek satışlar - son 3 ay için
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);

        // Tarih aralığında rastgele tarih oluştur
        const randomDate = (start: Date, end: Date) => {
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        };

        const getRandomProduct = () => products[Math.floor(Math.random() * products.length)];
        const getRandomCustomer = () => customers[Math.floor(Math.random() * customers.length)];

        // Her müşteri için çeşitli tarihlerde birkaç satış oluştur
        const salesData = [];

        for (let i = 0; i < 20; i++) {
            const product = getRandomProduct();
            const customer = getRandomCustomer();
            const quantity = Math.floor(Math.random() * 3) + 1;

            salesData.push({
                customerId: customer._id,
                productId: product._id,
                amount: product.price * quantity,
                quantity: quantity,
                status: 'completed',
                paymentMethod: Math.random() > 0.5 ? 'Kredi Kartı' : 'Havale',
                createdAt: randomDate(threeMonthsAgo, now)
            });
        }

        await Sale.create(salesData);

        // Örnek WhatsApp şablonları
        await WhatsAppTemplate.create([
            {
                name: "Hoş Geldin Mesajı",
                content: "Merhaba {{ad}}, Kudat Steel Jewelry'ye hoş geldiniz! Özel koleksiyonlarımız ve %{{indirim}} indirim fırsatlarımız hakkında bilgi almak için web sitemizi ziyaret edebilirsiniz: {{link}}",
                parameters: ["ad", "indirim", "link"],
            },
            {
                name: "Sipariş Onayı",
                content: "Sayın {{ad}}, {{sipariş_numarası}} numaralı siparişiniz onaylanmıştır. Tahmini teslimat tarihi: {{tarih}}. Takip kodu: {{takip_kodu}}. Bizi tercih ettiğiniz için teşekkür ederiz!",
                parameters: ["ad", "sipariş_numarası", "tarih", "takip_kodu"],
            },
            {
                name: "İndirim Kampanyası",
                content: "Değerli müşterimiz {{ad}}, {{kampanya_adı}} kampanyamız başladı! {{son_tarih}} tarihine kadar tüm ürünlerimizde %{{indirim_oranı}} indirim fırsatını kaçırmayın!",
                parameters: ["ad", "kampanya_adı", "son_tarih", "indirim_oranı"],
            }
        ]);

        return NextResponse.json({
            success: true,
            message: 'Veritabanı başarıyla oluşturuldu',
            data: {
                users: await User.countDocuments(),
                customers: await Customer.countDocuments(),
                products: await Product.countDocuments(),
                newsletters: await Newsletter.countDocuments(),
                campaigns: await Campaign.countDocuments(),
                events: await Event.countDocuments(),
                sales: await Sale.countDocuments(),
                whatsAppTemplates: await WhatsAppTemplate.countDocuments(),
                whatsAppMessages: await WhatsAppMessage.countDocuments()
            }
        });
    } catch (error) {
        console.error('Seed hatası:', error);
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
    }
} 