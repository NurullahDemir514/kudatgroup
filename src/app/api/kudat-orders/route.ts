import { NextResponse } from "next/server";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
  writeBatch,
} from "firebase/firestore";
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

function orderDocumentId(value: unknown) {
  return cleanText(value)
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, 120);
}

export async function GET() {
  try {
    const snapshot = await getDocs(
      query(collection(db, "kudat_orders"), orderBy("syncedAt", "desc")),
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
        error: error instanceof Error ? error.message : "Siparişler alınamadı.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const id = orderDocumentId(body?.id);
    const trackingToken = cleanText(body?.trackingToken);

    if (!id && !trackingToken) {
      return NextResponse.json(
        { success: false, error: "Sipariş kimliği eksik." },
        { status: 400 },
      );
    }

    const refs = new Map<string, ReturnType<typeof doc>>();

    if (id) {
      const directRef = doc(db, "kudat_orders", id);
      refs.set(directRef.path, directRef);

      const externalSnapshot = await getDocs(
        query(
          collection(db, "kudat_orders"),
          where("externalId", "==", cleanText(body?.id)),
        ),
      );
      externalSnapshot.docs.forEach((document) =>
        refs.set(document.ref.path, document.ref),
      );
    }

    if (trackingToken) {
      const trackingSnapshot = await getDocs(
        query(
          collection(db, "kudat_orders"),
          where("trackingToken", "==", trackingToken),
        ),
      );
      trackingSnapshot.docs.forEach((document) =>
        refs.set(document.ref.path, document.ref),
      );
    }

    if (refs.size === 1) {
      await deleteDoc(Array.from(refs.values())[0]);
    } else if (refs.size > 1) {
      const batch = writeBatch(db);
      refs.forEach((ref) => batch.delete(ref));
      await batch.commit();
    }

    return NextResponse.json({ success: true, deletedCount: refs.size });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Sipariş silinemedi.",
      },
      { status: 500 },
    );
  }
}
