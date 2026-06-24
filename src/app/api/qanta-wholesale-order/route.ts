import { NextRequest, NextResponse } from "next/server";
import { doc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { assertFirestoreRateLimit } from "@/lib/server-rate-limit";

const defaultEndpoint =
  "https://us-central1-qanta-de0b9.cloudfunctions.net/createExternalCatalogWholesaleOrder";
const defaultBusinessId = "tvuoVQFqrE5kweIXP0jn";
const maxOrderItems = 80;
const maxOrderQuantity = 10_000;
const maxRequestBytes = 256 * 1024;
const orderRateLimitWindowMs = 60_000;
const orderRateLimitMaxRequests = 20;

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

function cleanPositiveNumber(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : 0;
}

function orderDocumentId(externalId: string, trackingToken: string) {
  const source = externalId || trackingToken;
  return source.replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 120);
}

function orderItems(items: KudatOrderItem[]) {
  return items
    .map((item) => ({
      id: cleanText(item.id),
      name: cleanText(item.name),
      code: cleanText(item.code),
      imageSrc: cleanText(item.imageSrc),
      price: cleanPositiveNumber(item.price),
      quantity: Math.floor(cleanPositiveNumber(item.quantity)),
    }))
    .filter((item) => item.id && item.name && item.quantity > 0);
}

function assertOrderRateLimit(request: NextRequest) {
  return assertFirestoreRateLimit(request, {
    namespace: "qanta_wholesale_order",
    windowMs: orderRateLimitWindowMs,
    maxRequests: orderRateLimitMaxRequests,
    error: "Çok fazla sipariş denemesi yapıldı.",
  });
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
    const rateLimitResponse = await assertOrderRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const contentLength = Number(request.headers.get("content-length") || 0);
    if (contentLength > maxRequestBytes) {
      return NextResponse.json(
        { success: false, error: "Sipariş verisi çok büyük." },
        { status: 413 }
      );
    }

    const body = await request.json();
    const items = Array.isArray(body.items) ? (body.items as KudatOrderItem[]) : [];
    const cleanItems = orderItems(items);
    const totalQuantity = cleanItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    if (
      !cleanItems.length ||
      cleanItems.length > maxOrderItems ||
      totalQuantity > maxOrderQuantity
    ) {
      return NextResponse.json(
        { success: false, error: "Sipariş kalemleri geçersiz." },
        { status: 400 }
      );
    }

    const externalId = cleanText(body.id);
    const trackingToken = cleanText(body.trackingToken);
    const documentId = orderDocumentId(externalId, trackingToken);
    if (!documentId) {
      return NextResponse.json(
        { success: false, error: "Sipariş kimliği eksik." },
        { status: 400 }
      );
    }

    const trackingUrl = trackingToken
      ? `${publicBaseUrl(request)}/siparis-takip/${encodeURIComponent(trackingToken)}`
      : "";
    const orderRef = doc(db, "kudat_orders", documentId);

    const reservation = await runTransaction(db, async (transaction) => {
      const existingSnapshot = await transaction.get(orderRef);
      if (existingSnapshot.exists()) {
        const existing = existingSnapshot.data();
        if (existing.qantaOrderId) {
          return {
            cached: true,
            processing: false,
            data: existing.qantaResponse ?? {
              id: existing.qantaOrderId,
              trackingToken: existing.trackingToken,
              trackingUrl: existing.trackingUrl,
              totalAmount: existing.totalAmount,
            },
          };
        }

        if (existing.status === "syncing") {
          return { cached: false, processing: true, data: null };
        }
      }

      transaction.set(
        orderRef,
        {
          externalId,
          status: "syncing",
          trackingToken,
          trackingUrl,
          categoryTitle: cleanText(body.categoryTitle),
          customer: body.customer ?? {},
          items: cleanItems,
          totalQuantity,
          createdAt: cleanText(body.createdAt) || new Date().toISOString(),
          syncStartedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return { cached: false, processing: false, data: null };
    });

    if (reservation.cached) {
      return NextResponse.json({ success: true, data: reservation.data });
    }

    if (reservation.processing) {
      return NextResponse.json(
        { success: false, error: "Sipariş zaten işleniyor." },
        { status: 202 }
      );
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-qanta-integration-secret": integrationSecret,
      },
      body: JSON.stringify({
        businessId,
        source: "kudat",
        externalOrderId: externalId,
        trackingToken,
        trackingUrl,
        orderDate: cleanText(body.createdAt) || new Date().toISOString(),
        customer: body.customer ?? {},
        items: cleanItems.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          image: item.imageSrc,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data.success !== true) {
      await setDoc(
        orderRef,
        {
          status: "sync_failed",
          syncError: data.error || "Qanta siparişi oluşturulamadı.",
          syncFailedAt: serverTimestamp(),
        },
        { merge: true }
      );

      return NextResponse.json(
        {
          success: false,
          error: data.error || "Qanta siparişi oluşturulamadı.",
        },
        { status: response.status || 500 }
      );
    }

    const trackingTokenResult = data.trackingToken || trackingToken;
    const trackingUrlResult = data.trackingUrl || trackingUrl;
    await setDoc(orderRef, {
      externalId,
      qantaOrderId: cleanText(data.id),
      status: "new",
      trackingToken: trackingTokenResult,
      trackingUrl: trackingUrlResult,
      categoryTitle: cleanText(body.categoryTitle),
      customer: body.customer ?? {},
      items: cleanItems,
      totalQuantity,
      totalAmount: Number(data.totalAmount) || 0,
      createdAt: cleanText(body.createdAt) || new Date().toISOString(),
      qantaResponse: {
        ...data,
        trackingToken: trackingTokenResult,
        trackingUrl: trackingUrlResult,
      },
      syncedAt: serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        trackingToken: trackingTokenResult,
        trackingUrl: trackingUrlResult,
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
