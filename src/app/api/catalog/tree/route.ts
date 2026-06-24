import { NextResponse } from "next/server";
import { getPublicCatalogTree } from "@/services/publicCatalogSnapshotService";

export async function GET() {
  const categories = getPublicCatalogTree();

  return NextResponse.json(
    {
      success: true,
      data: categories,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
