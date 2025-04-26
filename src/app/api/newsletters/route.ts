import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Newsletter, INewsletter } from "@/models/Newsletter";

// Bülten aboneliklerini getir (admin için)
export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const skip = (page - 1) * limit;

        const newsletters = await Newsletter.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        console.log("API'den getirilen ilk kayıt:", newsletters[0]); // İlk kaydı kontrol et

        const total = await Newsletter.countDocuments({});

        return NextResponse.json({
            success: true,
            data: newsletters,
            total,
            page,
            totalPages: Math.ceil(total / limit),
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
        await connectToDatabase();

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
        const existingNewsletter = await Newsletter.findOne({ phone: data.phone });
        if (existingNewsletter) {
            return NextResponse.json(
                { success: false, error: "Bu telefon numarası zaten kayıtlı" },
                { status: 400 }
            );
        }

        // Önemli adres bilgisi kontrol noktası
        console.log("Kaydı oluşturmadan önce il bilgisi:", data.addressCity);

        // Yeni bülten aboneliği oluştur - düzeltilmiş hali
        const newNewsletterData = {
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email ? data.email.trim() : undefined,
            companyName: data.companyName ? data.companyName.trim() : undefined,
            // Adres bilgilerini parçalı alıyoruz
            addressCity: data.addressCity.trim(),
            addressDistrict: data.addressDistrict ? data.addressDistrict.trim() : undefined,
            addressStreet: data.addressStreet ? data.addressStreet.trim() : undefined,
            addressPostalCode: data.addressPostalCode ? data.addressPostalCode.trim() : undefined,
            taxNumber: data.taxNumber ? data.taxNumber.trim() : undefined,
            whatsappEnabled: data.whatsappEnabled !== undefined ? data.whatsappEnabled : true,
            active: true,
            subscriptionDate: new Date(),
        };

        console.log("Hazırlanan veri:", newNewsletterData);

        // Mongoose modeli ile oluştur
        const newNewsletter = new Newsletter(newNewsletterData);
        console.log("Kaydedilecek Newsletter objesi:", JSON.stringify(newNewsletter.toObject()));

        const savedNewsletter = await newNewsletter.save();
        console.log("Kaydedilen Newsletter sonucu:", JSON.stringify(savedNewsletter.toObject()));

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