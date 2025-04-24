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

        // Zorunlu alanları kontrol et
        if (!data.name || !data.phone) {
            return NextResponse.json(
                { success: false, error: "İsim ve telefon numarası zorunludur" },
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

        // Yeni bülten aboneliği oluştur
        const newNewsletter = new Newsletter({
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email ? data.email.trim() : undefined,
            companyName: data.companyName ? data.companyName.trim() : undefined,
            taxNumber: data.taxNumber ? data.taxNumber.trim() : undefined,
            whatsappEnabled: data.whatsappEnabled !== undefined ? data.whatsappEnabled : true,
            active: true,
            subscriptionDate: new Date(),
        });

        await newNewsletter.save();

        return NextResponse.json({
            success: true,
            data: newNewsletter,
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