import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import {
  getAdminCatalogCategories,
  type AdminCatalogCategory,
} from "@/services/catalogCategoryService";

const getCachedPublicCatalogCategories = unstable_cache(
  async () => getAdminCatalogCategories(),
  ["public-catalog-categories"],
  { revalidate: 300 }
);

export async function GET() {
  const categories = await getCachedPublicCatalogCategories();

  return NextResponse.json(
    { success: true, data: categories },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
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
