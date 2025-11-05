import { NextResponse } from "next/server";
import { newsletterService } from "@/services/firebaseServices";

// Bülten abonelik detaylarını getir (admin için)
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const newsletter = await newsletterService.getById(params.id);

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
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const data = await req.json();

        // Sadece active değeri güncelleniyorsa
        if (Object.keys(data).length === 1 && data.active !== undefined) {
            const updatedNewsletter = await newsletterService.update(params.id, {
                active: data.active
            });

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

        // Telefon numarası başka bir kayıtta var mı kontrol et
        const existing = await newsletterService.findByPhone(data.phone);
        if (existing.length > 0 && existing[0].id !== params.id) {
            return NextResponse.json(
                { success: false, error: "Bu telefon numarası başka bir abonelikte kullanılıyor" },
                { status: 400 }
            );
        }

        // Firebase için undefined değerlerini kaldır
        const updateData: any = {
            name: data.name.trim(),
            phone: data.phone.trim(),
            active: data.active !== undefined ? data.active : true,
        };

        // Opsiyonel alanları sadece değer varsa ekle
        if (data.email && data.email.trim()) {
            updateData.email = data.email.trim();
        }
        if (data.companyName && data.companyName.trim()) {
            updateData.companyName = data.companyName.trim();
        }
        if (data.taxNumber && data.taxNumber.trim()) {
            updateData.taxNumber = data.taxNumber.trim();
        }

        const updatedNewsletter = await newsletterService.update(params.id, updateData);

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
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await newsletterService.delete(params.id);

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
