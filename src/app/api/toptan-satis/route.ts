import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import axios from 'axios';

// Telefon numarası formatı düzenleme (WhatsApp API için)
function formatPhoneNumber(phoneNumber: string): string {
    let formatted = phoneNumber.trim();
    
    // Boşluk, tire, parantez gibi karakterleri temizle
    formatted = formatted.replace(/[\s\-\(\)]/g, '');
    
    // Eğer başında 0 varsa kaldır
    if (formatted.startsWith('0')) {
        formatted = formatted.substring(1);
    }
    
    // Eğer başında + varsa kaldır
    if (formatted.startsWith('+')) {
        formatted = formatted.substring(1);
    }
    
    // Eğer başında 90 yoksa ekle
    if (!formatted.startsWith('90')) {
        formatted = '90' + formatted;
    }
    
    return formatted;
}

// GET - Toptan satış form kayıtlarını getir
export async function GET(request: NextRequest) {
    try {
        const toptanSatisRef = collection(db, 'toptanSatis');
        const q = query(toptanSatisRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const records = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name || '',
                contactPerson: data.contactPerson || '',
                email: data.email || '',
                phone: data.phone || '',
                message: data.message || '',
                status: data.status || 'pending',
                createdAt: data.createdAt ? (data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt) : new Date().toISOString(),
            };
        });

        return NextResponse.json({
            success: true,
            data: records,
        });
    } catch (error: any) {
        console.error('Toptan satış kayıtları getirme hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Kayıtlar getirilirken bir hata oluştu' 
            },
            { status: 500 }
        );
    }
}

// POST - Yeni toptan satış form kaydı oluştur
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Gelen veriyi doğrula
        if (!data.name || !data.contactPerson || !data.email || !data.phone) {
            return NextResponse.json(
                { success: false, error: 'Tüm zorunlu alanlar doldurulmalıdır' },
                { status: 400 }
            );
        }

        // Email formatını kontrol et
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(data.email)) {
            return NextResponse.json(
                { success: false, error: 'Geçerli bir e-posta adresi giriniz' },
                { status: 400 }
            );
        }

        // Firestore'a kaydet
        const toptanSatisRef = collection(db, 'toptanSatis');
        const docRef = await addDoc(toptanSatisRef, {
            name: data.name,
            contactPerson: data.contactPerson,
            email: data.email,
            phone: data.phone,
            message: data.message || '',
            createdAt: serverTimestamp(),
            status: 'pending', // pending, contacted, completed
        });

        // WhatsApp mesajı gönder (eğer numara varsa)
        const whatsappNumber = process.env.TOPTAN_SATIS_WHATSAPP_NUMBER;
        if (whatsappNumber && process.env.WHATSAPP_API_KEY && process.env.WHATSAPP_PHONE_NUMBER_ID) {
            try {
                const formattedPhone = formatPhoneNumber(whatsappNumber);
                
                // Mesaj içeriğini oluştur (template parametreleri için)
                const messageText = `🛍️ Yeni Toptan Satış Talebi\n\n` +
                    `İşletme Adı: ${data.name}\n` +
                    `İletişim Kişisi: ${data.contactPerson}\n` +
                    `E-posta: ${data.email}\n` +
                    `Telefon: ${data.phone}\n` +
                    (data.message ? `Mesaj: ${data.message}\n` : '') +
                    `\n📋 Detaylar için admin paneline bakabilirsiniz.`;

                // WhatsApp Cloud API ile direkt text mesajı gönder (24 saat penceresi varsa çalışır)
                const baseUrl = (process.env.WHATSAPP_API_URL || "https://graph.facebook.com/v18.0").replace(/\/$/, "");
                const url = `${baseUrl}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
                
                // Önce direkt text mesajı dene
                let payload: any = {
                    messaging_product: "whatsapp",
                    recipient_type: "individual",
                    to: formattedPhone,
                    type: "text",
                    text: {
                        body: messageText
                    }
                };

                const headers = {
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_KEY}`,
                    'Content-Type': 'application/json'
                };

                try {
                    await axios.post(url, payload, { headers });
                    console.log('WhatsApp mesajı başarıyla gönderildi (direkt text):', formattedPhone);
                } catch (textError: any) {
                    // Eğer direkt text mesajı başarısız olursa (24 saat kuralı), template mesajı dene
                    console.log('Direkt text mesajı başarısız, template mesajı deneniyor...');
                    
                    // Template mesajı için payload (hello_world template'i kullanıyoruz)
                    payload = {
                        messaging_product: "whatsapp",
                        recipient_type: "individual",
                        to: formattedPhone,
                        type: "template",
                        template: {
                            name: "hello_world",
                            language: {
                                code: "tr"
                            }
                        }
                    };
                    
                    await axios.post(url, payload, { headers });
                    console.log('WhatsApp template mesajı gönderildi:', formattedPhone);
                    
                    // Template mesajından sonra, eğer 24 saat penceresi açılırsa text mesajı göndermeyi dene
                    // (Bu durumda kullanıcı template mesajına cevap verirse 24 saat penceresi açılır)
                }
            } catch (whatsappError: any) {
                // WhatsApp gönderimi başarısız olsa bile form kaydı başarılı sayılır
                console.error('WhatsApp mesajı gönderilemedi:', whatsappError.response?.data || whatsappError.message);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Bilgileriniz başarıyla kaydedildi',
            id: docRef.id,
        });
    } catch (error: any) {
        console.error('Toptan satış form hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message || 'Bilgileriniz kaydedilirken bir hata oluştu' 
            },
            { status: 500 }
        );
    }
}
