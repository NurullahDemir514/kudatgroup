import { NextResponse } from "next/server";
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

function dateValue(value: unknown) {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (typeof value === "string" && value.trim()) return value;
  return new Date().toISOString();
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function GET() {
  try {
    const snapshot = await getDocs(
      query(collection(db, "kudat_orders"), orderBy("syncedAt", "desc"))
    );

    const orders = snapshot.docs.map((document) => {
      const data = document.data();
      const items = Array.isArray(data.items) ? data.items : [];
      const customer =
        data.customer && typeof data.customer === "object" ? data.customer : {};

      return {
        id: cleanText(data.externalId) || document.id,
        createdAt: dateValue(data.createdAt),
        status: cleanText(data.status) || "new",
        trackingToken: cleanText(data.trackingToken) || undefined,
        trackingUrl: cleanText(data.trackingUrl) || undefined,
        categoryTitle: cleanText(data.categoryTitle),
        customer,
        items: items.map((item) => ({
          id: cleanText(item?.id),
          name: cleanText(item?.name),
          code: cleanText(item?.code),
          imageSrc: cleanText(item?.imageSrc),
          price: numberValue(item?.price),
          compareAtPrice: numberValue(item?.compareAtPrice) || undefined,
          quantity: numberValue(item?.quantity),
        })),
        totalQuantity: numberValue(data.totalQuantity),
        totalAmount: numberValue(data.totalAmount),
      };
    });

    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Siparişler alınamadı.",
      },
      { status: 500 }
    );
  }
}
