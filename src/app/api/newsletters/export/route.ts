import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

// E-bülten müşterilerini JSON olarak export et
export async function GET() {
    try {
        await connectToDatabase();

        // Tüm newsletter abonelerini çek
        const newsletters = await Newsletter.find({})
            .sort({ createdAt: -1 })
            .lean(); // lean() ile plain JavaScript objesi olarak al

        // JSON formatında döndür
        return NextResponse.json({
            success: true,
            count: newsletters.length,
            data: newsletters,
            exportDate: new Date().toISOString()
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Content-Disposition': 'attachment; filename="newsletter-subscribers.json"'
            }
        });
    } catch (error: any) {
        console.error("Newsletter export hatası:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
