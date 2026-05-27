import { NextRequest, NextResponse } from "next/server";

const defaultEndpoint =
  "https://us-central1-qanta-de0b9.cloudfunctions.net/getKudatWholesaleOrderTracking";
const defaultBusinessId = "tvuoVQFqrE5kweIXP0jn";

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function safeFileName(value: string) {
  const normalized = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-");
  return normalized || "siparis-belgesi";
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const { token } = await context.params;
  const cleanToken = cleanText(token);

  if (!cleanToken) {
    return NextResponse.json(
      { success: false, error: "Takip bağlantısı geçersiz." },
      { status: 400 }
    );
  }

  try {
    const endpoint = process.env.QANTA_ORDER_TRACKING_ENDPOINT || defaultEndpoint;
    const businessId = process.env.QANTA_BUSINESS_ID || defaultBusinessId;
    const searchParams = new URLSearchParams({ token: cleanToken, businessId });
    const trackingResponse = await fetch(
      `${endpoint}?${searchParams.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
    const trackingData = await trackingResponse.json().catch(() => ({}));

    if (!trackingResponse.ok || trackingData?.success !== true) {
      return NextResponse.json(
        { success: false, error: trackingData?.error || "Sipariş bulunamadı." },
        { status: trackingResponse.status || 500 }
      );
    }

    const order = trackingData.data || {};
    const receiptPdfUrl = cleanText(order.receiptPdfUrl);
    if (!receiptPdfUrl) {
      return NextResponse.json(
        { success: false, error: "Satış belgesi henüz hazır değil." },
        { status: 404 }
      );
    }

    const pdfResponse = await fetch(receiptPdfUrl, { cache: "no-store" });
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { success: false, error: "Satış belgesi alınamadı." },
        { status: pdfResponse.status || 500 }
      );
    }

    const fileName = `${safeFileName(cleanText(order.id))}.pdf`;
    const pdfBytes = await pdfResponse.arrayBuffer();
    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Satış belgesi alınamadı.",
      },
      { status: 500 }
    );
  }
}
