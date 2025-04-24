import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Newsletter } from "@/models/Newsletter";
import mongoose from "mongoose";

// Bülten abonelik detaylarını getir (admin için)
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const id = params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "Geçersiz ID formatı" },
                { status: 400 }
            );
        }

        const newsletter = await Newsletter.findById(id);

        if (!newsletter) {
            return NextResponse.json(
                { success: false, error: "Bülten aboneliği bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: newsletter });
    } catch (error: any) {
        console.error("Bülten aboneliği getirilirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Bülten aboneliğini güncelle (admin için)
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const id = params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "Geçersiz ID formatı" },
                { status: 400 }
            );
        }

        const data = await req.json();

        // Sadece active değeri gönderildiğinde, diğer alanları kontrol etme
        if (Object.keys(data).length === 1 && data.active !== undefined) {
            const existingNewsletter = await Newsletter.findById(id);
            if (!existingNewsletter) {
                return NextResponse.json(
                    { success: false, error: "Bülten aboneliği bulunamadı" },
                    { status: 404 }
                );
            }

            const updatedNewsletter = await Newsletter.findByIdAndUpdate(
                id,
                { active: data.active, updatedAt: new Date() },
                { new: true }
            );

            return NextResponse.json({
                success: true,
                data: updatedNewsletter,
                message: "Bülten aboneliği durumu başarıyla güncellendi",
            });
        }

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

        // Email kontrolü (opsiyonel)
        if (data.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(data.email)) {
                return NextResponse.json(
                    { success: false, error: "Geçerli bir email adresi giriniz" },
                    { status: 400 }
                );
            }
        }

        // Telefon numarası başka bir kayıtta var mı kontrol et (mevcut kayıt hariç)
        const existingNewsletter = await Newsletter.findOne({
            phone: data.phone,
            _id: { $ne: id },
        });

        if (existingNewsletter) {
            return NextResponse.json(
                { success: false, error: "Bu telefon numarası başka bir abonelikte kullanılıyor" },
                { status: 400 }
            );
        }

        // Güncelleme için verileri hazırla
        const updateData = {
            name: data.name.trim(),
            phone: data.phone.trim(),
            email: data.email ? data.email.trim() : undefined,
            companyName: data.companyName ? data.companyName.trim() : undefined,
            taxNumber: data.taxNumber ? data.taxNumber.trim() : undefined,
            active: data.active !== undefined ? data.active : true,
            updatedAt: new Date(),
        };

        const updatedNewsletter = await Newsletter.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedNewsletter) {
            return NextResponse.json(
                { success: false, error: "Bülten aboneliği bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: updatedNewsletter,
            message: "Bülten aboneliği başarıyla güncellendi",
        });
    } catch (error: any) {
        console.error("Bülten aboneliği güncellenirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// Bülten aboneliğini sil (admin için)
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectToDatabase();

        const id = params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json(
                { success: false, error: "Geçersiz ID formatı" },
                { status: 400 }
            );
        }

        const deletedNewsletter = await Newsletter.findByIdAndDelete(id);

        if (!deletedNewsletter) {
            return NextResponse.json(
                { success: false, error: "Bülten aboneliği bulunamadı" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Bülten aboneliği başarıyla silindi",
        });
    } catch (error: any) {
        console.error("Bülten aboneliği silinirken hata:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
} 