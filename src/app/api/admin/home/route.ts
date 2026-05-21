import { NextRequest, NextResponse } from "next/server";
import { cookieName, verifyAdminSessionToken } from "@/lib/admin-session";
import {
  getMarketingHomeContent,
  normalizeMarketingHomeContent,
  updateMarketingHomeContent,
} from "@/services/marketingHomeService";

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  return verifyAdminSessionToken(token);
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Oturum gerekli" },
      { status: 401 }
    );
  }

  const content = await getMarketingHomeContent();
  return NextResponse.json({ success: true, data: content });
}

export async function POST(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Oturum gerekli" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const content = normalizeMarketingHomeContent(body.content);
    const data = await updateMarketingHomeContent(content);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Ana sayfa kaydedilemedi",
      },
      { status: 400 }
    );
  }
}
