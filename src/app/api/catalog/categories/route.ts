import { NextRequest, NextResponse } from "next/server";
import {
  getAdminCatalogCategories,
  saveAdminCatalogCategories,
  type AdminCatalogCategory,
} from "@/services/catalogCategoryService";

export async function GET() {
  const categories = await getAdminCatalogCategories();

  return NextResponse.json({ success: true, data: categories });
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

  await saveAdminCatalogCategories(categories);

  return NextResponse.json({ success: true, data: categories });
}
