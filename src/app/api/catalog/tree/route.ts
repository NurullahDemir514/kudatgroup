import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { getCatalogTree } from "@/services/catalogCategoryService";

const getCachedCatalogTree = unstable_cache(
  async () => getCatalogTree(),
  ["public-catalog-tree"],
  { revalidate: 300 }
);

export async function GET() {
  const categories = await getCachedCatalogTree();

  return NextResponse.json(
    {
      success: true,
      data: categories,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
