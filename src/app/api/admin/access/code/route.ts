import { NextRequest, NextResponse } from "next/server";
import { updateAdminCode, verifyAdminCode } from "@/lib/admin-access";
import { cookieName, verifyAdminSessionToken } from "@/lib/admin-session";

export async function POST(request: NextRequest) {
  const isAuthenticated = await verifyAdminSessionToken(
    request.cookies.get(cookieName)?.value
  );

  if (!isAuthenticated) {
    return NextResponse.json(
      { success: false, error: "Oturum gerekli" },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const currentCode =
    typeof body?.currentCode === "string" ? body.currentCode.trim() : "";
  const nextCode = typeof body?.nextCode === "string" ? body.nextCode.trim() : "";

  if (nextCode.length < 6) {
    return NextResponse.json(
      { success: false, error: "Yeni kod en az 6 karakter olmalı" },
      { status: 400 }
    );
  }

  const isCurrentCodeValid = await verifyAdminCode(currentCode);

  if (!isCurrentCodeValid) {
    return NextResponse.json(
      { success: false, error: "Mevcut kod hatalı" },
      { status: 401 }
    );
  }

  await updateAdminCode(nextCode);

  return NextResponse.json({ success: true });
}
