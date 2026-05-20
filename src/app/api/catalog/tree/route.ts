import { NextResponse } from "next/server";
import { getCatalogTree } from "@/services/catalogCategoryService";

export async function GET() {
  const categories = await getCatalogTree();

  return NextResponse.json({
    success: true,
    data: categories,
  });
}
