import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCode } from "@/lib/admin-access";
import { cookieName, createAdminSessionToken, maxAgeSeconds } from "@/lib/admin-session";
import { assertFirestoreRateLimit } from "@/lib/server-rate-limit";

const adminLoginRateLimitWindowMs = 60_000;
const adminLoginRateLimitMaxRequests = 8;

export async function POST(request: NextRequest) {
  const rateLimitResponse = await assertFirestoreRateLimit(request, {
    namespace: "admin_login",
    windowMs: adminLoginRateLimitWindowMs,
    maxRequests: adminLoginRateLimitMaxRequests,
    error: "Çok fazla giriş denemesi yapıldı.",
  });
  if (rateLimitResponse) return rateLimitResponse;

  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? body.code.trim() : "";

  if (!code) {
    return NextResponse.json(
      { success: false, error: "Giriş kodu gerekli" },
      { status: 400 }
    );
  }

  const isValid = await verifyAdminCode(code);

  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Giriş kodu hatalı" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(cookieName, await createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  });

  return response;
}
