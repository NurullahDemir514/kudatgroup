import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { adjustAdminCatalogProductStock } from "@/services/catalogProductService";

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function adjustmentDocumentId(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export async function POST(request: NextRequest) {
  const integrationSecret = process.env.QANTA_INTEGRATION_SECRET;
  const providedSecret = cleanText(request.headers.get("x-qanta-integration-secret"));

  if (!integrationSecret) {
    return NextResponse.json(
      { success: false, error: "Qanta bağlantı anahtarı eksik." },
      { status: 500 }
    );
  }

  if (!providedSecret || providedSecret !== integrationSecret) {
    return NextResponse.json(
      { success: false, error: "Yetkisiz stok hareketi." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const idempotencyKey = cleanText(body.idempotencyKey);
    const items = Array.isArray(body.items) ? body.items : [];

    if (!idempotencyKey) {
      return NextResponse.json(
        { success: false, error: "Stok hareketi kimliği zorunludur." },
        { status: 400 }
      );
    }

    const result = await adjustAdminCatalogProductStock({
      adjustmentId: adjustmentDocumentId(idempotencyKey),
      source: cleanText(body.source) || "qanta_sale",
      items: items.map((item) => ({
        id: cleanText(item.productId ?? item.id),
        quantity: Number(item.quantity) || 0,
      })),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Stok güncellenemedi.",
      },
      { status: 400 }
    );
  }
}
