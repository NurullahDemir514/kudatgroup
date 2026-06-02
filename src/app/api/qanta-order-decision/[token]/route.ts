import { NextRequest, NextResponse } from "next/server";

const defaultEndpoint =
  "https://us-central1-qanta-de0b9.cloudfunctions.net/setKudatWholesaleOrderCustomerDecision";
const defaultBusinessId = "tvuoVQFqrE5kweIXP0jn";

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  const endpoint = process.env.QANTA_ORDER_DECISION_ENDPOINT || defaultEndpoint;
  const businessId = process.env.QANTA_BUSINESS_ID || defaultBusinessId;
  const { token } = await context.params;
  const cleanToken = cleanText(token);
  const body = await request.json().catch(() => ({}));
  const decision = cleanText(body.decision);

  if (!cleanToken) {
    return NextResponse.json(
      { success: false, error: "Takip bağlantısı geçersiz." },
      { status: 400 }
    );
  }
  if (!["continue_available", "cancel_order"].includes(decision)) {
    return NextResponse.json(
      { success: false, error: "Karar geçersiz." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: cleanToken,
        businessId,
        decision,
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.success !== true) {
      return NextResponse.json(
        { success: false, error: data.error || "Karar iletilemedi." },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Karar iletilemedi.",
      },
      { status: 500 }
    );
  }
}
