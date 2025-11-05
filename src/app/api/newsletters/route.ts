import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/services/firebaseServices";

// Bülten aboneliklerini getir (admin için)
export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limitCount = parseInt(searchParams.get("limit") || "50");

        const newsletters = await newsletterService.getAll(limitCount);
        
        console.log("API'den getirilen ilk kayıt:", newsletters[0]);

        return NextResponse.json({
            success: true,
            data: newsletters,
            total: newsletters.length,
            page,
            totalPages: Math.ceil(newsletters.length / limitCount),
        });
    } catch (error: any) {
        console.error("Bülten abonelikleri getirilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Yeni bülten aboneliği oluştur (public)
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        console.log("API'ye gelen veriler:", data);

        // Zorunlu alanları kontrol et
        if (!data.name || !data.phone || !data.addressCity) {
            return NextResponse.json(
                { success: false, error: "İsim, telefon numarası ve il bilgisi zorunludur" },
                { status: 400 }
            );
        }

        // Telefon numarası kontrolü
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(data.phone)) {
            return NextResponse.json(
                { success: false, error: "Geçerli bir telefon numarası giriniz (10-11 haneli)" },
                { status: 400 }
            );
        }

        // Telefon numarası daha önce kayıtlı mı kontrol et
        const existingNewsletters = await newsletterService.findByPhone(data.phone);
        if (existingNewsletters.length > 0) {
            return NextResponse.json(
                { success: false, error: "Bu telefon numarası zaten kayıtlı" },
                { status: 400 }
            );
        }

        // Yeni bülten aboneliği oluştur
            // Firebase için undefined değerlerini kaldır
            const newNewsletterData: any = {
                name: data.name.trim(),
                phone: data.phone.trim(),
                addressCity: data.addressCity.trim(),
                whatsappEnabled: data.whatsappEnabled !== undefined ? data.whatsappEnabled : true,
                active: true,
                subscriptionDate: new Date(),
            };

            // Opsiyonel alanları sadece değer varsa ekle
            if (data.email && data.email.trim()) {
                newNewsletterData.email = data.email.trim();
            }
            if (data.companyName && data.companyName.trim()) {
                newNewsletterData.companyName = data.companyName.trim();
            }
            if (data.addressDistrict && data.addressDistrict.trim()) {
                newNewsletterData.addressDistrict = data.addressDistrict.trim();
            }
            if (data.addressStreet && data.addressStreet.trim()) {
                newNewsletterData.addressStreet = data.addressStreet.trim();
            }
            if (data.addressBuildingNo && data.addressBuildingNo.trim()) {
                newNewsletterData.addressBuildingNo = data.addressBuildingNo.trim();
            }
            if (data.taxNumber && data.taxNumber.trim()) {
                newNewsletterData.taxNumber = data.taxNumber.trim();
            }

        console.log("Hazırlanan veri:", newNewsletterData);

        const savedNewsletter = await newsletterService.create(newNewsletterData);
        console.log("Kaydedilen Newsletter sonucu:", savedNewsletter);

        return NextResponse.json({
            success: true,
            data: savedNewsletter,
            message: "Bülten aboneliğiniz başarıyla oluşturuldu"
        });
    } catch (error: any) {
        console.error("Bülten aboneliği oluşturulurken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 