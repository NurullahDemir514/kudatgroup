import { NextRequest, NextResponse } from "next/server";
import {
  getAdminCatalogCategories,
  type AdminCatalogCategory,
} from "@/services/catalogCategoryService";

export async function GET() {
  const categories = await getAdminCatalogCategories();

  return NextResponse.json(
    { success: true, data: categories },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const categories = body.categories as AdminCatalogCategory[];

  if (!Array.isArray(categories)) {
    return NextResponse.json(
      { success: false, error: "Kategori verisi geçersiz" },
      { status: 400 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "Toplu kategori kaydı kaldırıldı. Katalog yönetimi için /api/admin/catalog kullanın.",
    },
    { status: 410 }
  );
}
