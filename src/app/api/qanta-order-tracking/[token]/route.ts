import { NextRequest, NextResponse } from "next/server";

const defaultEndpoint =
  "https://us-central1-qanta-de0b9.cloudfunctions.net/getKudatWholesaleOrderTracking";
const defaultBusinessId = "tvuoVQFqrE5kweIXP0jn";

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const endpoint = process.env.QANTA_ORDER_TRACKING_ENDPOINT || defaultEndpoint;
  const { token } = await context.params;
  const cleanToken = cleanText(token);

  if (!cleanToken) {
    return NextResponse.json(
      { success: false, error: "Takip bağlantısı geçersiz." },
      { status: 400 }
    );
  }

  try {
    const businessId = process.env.QANTA_BUSINESS_ID || defaultBusinessId;
    const searchParams = new URLSearchParams({
      token: cleanToken,
      businessId,
    });
    const response = await fetch(
      `${endpoint}?${searchParams.toString()}`,
      { headers: { Accept: "application/json" }, cache: "no-store" }
    );
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success !== true) {
      return NextResponse.json(
        { success: false, error: data.error || "Sipariş bulunamadı." },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Sipariş durumu alınamadı.",
      },
      { status: 500 }
    );
  }
}
