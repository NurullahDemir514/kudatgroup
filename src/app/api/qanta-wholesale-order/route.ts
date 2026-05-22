import { NextRequest, NextResponse } from "next/server";

const defaultEndpoint =
  "https://us-central1-qanta-de0b9.cloudfunctions.net/createExternalCatalogWholesaleOrder";
const defaultBusinessId = "tvuoVQFqrE5kweIXP0jn";

function publicBaseUrl(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.KUDAT_PUBLIC_SITE_URL;
  if (configured) {
    return configured.startsWith("http") ? configured : `https://${configured}`;
  }
  if (request.nextUrl.hostname === "localhost") {
    return request.nextUrl.origin;
  }
  return "https://kudatgroup.com";
}

type KudatOrderItem = {
  id?: string;
  name?: string;
  code?: string;
  imageSrc?: string;
  price?: number;
  quantity?: number;
};

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(request: NextRequest) {
  const endpoint = process.env.QANTA_WHOLESALE_ORDER_ENDPOINT || defaultEndpoint;
  const businessId = process.env.QANTA_BUSINESS_ID || defaultBusinessId;
  const integrationSecret = process.env.QANTA_INTEGRATION_SECRET;

  if (!integrationSecret) {
    return NextResponse.json(
      { success: false, error: "Qanta bağlantı anahtarı eksik." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const items = Array.isArray(body.items) ? (body.items as KudatOrderItem[]) : [];
    const trackingToken = cleanText(body.trackingToken);
    const trackingUrl = trackingToken
      ? `${publicBaseUrl(request)}/siparis-takip/${encodeURIComponent(trackingToken)}`
      : "";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-qanta-integration-secret": integrationSecret,
      },
      body: JSON.stringify({
        businessId,
        source: "kudat",
        externalOrderId: cleanText(body.id),
        trackingToken,
        trackingUrl,
        orderDate: cleanText(body.createdAt) || new Date().toISOString(),
        customer: body.customer ?? {},
        items: items.map((item) => ({
          id: cleanText(item.id),
          name: cleanText(item.name),
          code: cleanText(item.code),
          image: cleanText(item.imageSrc),
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 0,
        })),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success !== true) {
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Qanta siparişi oluşturulamadı.",
        },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        trackingToken: data.trackingToken || trackingToken,
        trackingUrl: data.trackingUrl || trackingUrl,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sipariş gönderilemedi.",
      },
      { status: 500 }
    );
  }
}
