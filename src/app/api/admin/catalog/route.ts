import { NextRequest, NextResponse } from "next/server";
import { cookieName, verifyAdminSessionToken } from "@/lib/admin-session";
import {
  createAdminCatalogCategory,
  deleteAdminCatalogCategory,
  getAdminCatalogCategories,
  updateAdminCatalogCategory,
  type AdminCatalogCategory,
} from "@/services/catalogCategoryService";
import {
  createAdminCatalogProduct,
  deleteAdminCatalogProduct,
  getAdminCatalogProducts,
  updateAdminCatalogProduct,
  type AdminCatalogProduct,
} from "@/services/catalogProductService";

const slugify = (value: string) =>
  value
    .toLocaleLowerCase("tr-TR")
    .trim()
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function requireAdmin(request: NextRequest) {
  const token = request.cookies.get(cookieName)?.value;
  return verifyAdminSessionToken(token);
}

function numberOrZero(value: unknown) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : 0;
}

function cleanCategory(
  category: Partial<AdminCatalogCategory>,
  orderFallback = 0
): Omit<AdminCatalogCategory, "id"> {
  const title = String(category.title ?? "").trim();
  if (!title) throw new Error("Kategori adı zorunludur");

  return {
    title,
    slug: slugify(category.slug || title) || `kategori-${Date.now()}`,
    parentId: category.parentId || null,
    description: String(category.description ?? "").trim() || undefined,
    imageSrc: String(category.imageSrc ?? "").trim() || undefined,
    order:
      typeof category.order === "number" && Number.isFinite(category.order)
        ? category.order
        : orderFallback,
    isActive: category.isActive !== false,
  };
}

function cleanProduct(
  product: Partial<AdminCatalogProduct>,
  orderFallback = 0
): Omit<AdminCatalogProduct, "id"> {
  const name = String(product.name ?? "").trim();
  const code = String(product.code ?? "").trim();
  const categoryId = String(product.categoryId ?? "").trim();

  if (!name) throw new Error("Ürün adı zorunludur");
  if (!code) throw new Error("Ürün kodu zorunludur");
  if (!categoryId) throw new Error("Kategori seçimi zorunludur");

  const purchasePrice = numberOrZero(product.purchasePrice);
  const price = numberOrZero(product.price);
  const compareAtPrice = numberOrZero(product.compareAtPrice);
  const variantMode =
    product.variantMode === "none" || product.variantMode === "custom"
      ? product.variantMode
      : "auto";
  const variants = Array.isArray(product.variants)
    ? product.variants
        .map((variant) => ({
          id: String(variant.id ?? "").trim(),
          name: String(variant.name ?? "").trim(),
          code: String(variant.code ?? "").trim(),
          colorHex: String(variant.colorHex ?? "").trim(),
        }))
        .filter(
          (variant) =>
            variant.id && variant.name && variant.code && variant.colorHex
        )
    : undefined;

  return {
    name,
    code,
    categoryId,
    variantMode,
    variants: variantMode === "custom" && variants?.length ? variants : undefined,
    imageSrc: String(product.imageSrc ?? "").trim() || undefined,
    purchasePrice: purchasePrice || undefined,
    price,
    compareAtPrice: compareAtPrice > price ? compareAtPrice : undefined,
    stock: Math.floor(numberOrZero(product.stock)),
    supplier: String(product.supplier ?? "").trim() || undefined,
    order:
      typeof product.order === "number" && Number.isFinite(product.order)
        ? product.order
        : orderFallback,
    isActive: product.isActive !== false,
  };
}

export async function GET(request: NextRequest) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json(
      { success: false, error: "Oturum gerekli" },
      { status: 401 }
    );
  }

  const [categories, products] = await Promise.all([
    getAdminCatalogCategories(),
    getAdminCatalogProducts(),
  ]);

  return NextResponse.json({ success: true, data: { categories, products } });
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
    const action = String(body.action ?? "");

    if (action === "create-category") {
      const existing = await getAdminCatalogCategories();
      const category = await createAdminCatalogCategory(
        cleanCategory(body.category, existing.length)
      );
      return NextResponse.json({ success: true, data: category }, { status: 201 });
    }

    if (action === "update-category") {
      const id = String(body.id ?? "");
      if (!id) throw new Error("Kategori bulunamadı");
      const category = await updateAdminCatalogCategory(
        id,
        cleanCategory(body.category)
      );
      return NextResponse.json({ success: true, data: category });
    }

    if (action === "delete-category") {
      const id = String(body.id ?? "");
      if (!id) throw new Error("Kategori bulunamadı");

      const [categories, products] = await Promise.all([
        getAdminCatalogCategories(),
        getAdminCatalogProducts(),
      ]);
      const childIds = categories
        .filter((category) => category.parentId === id)
        .map((category) => category.id);
      const hasProducts = products.some((product) => product.categoryId === id);

      if (childIds.length || hasProducts) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Bu kategoriyi silmeden önce alt kategorilerini ve ürünlerini taşıyın ya da silin.",
          },
          { status: 409 }
        );
      }

      await deleteAdminCatalogCategory(id);
      return NextResponse.json({ success: true });
    }

    if (action === "create-product") {
      const existing = await getAdminCatalogProducts();
      const product = await createAdminCatalogProduct(
        cleanProduct(body.product, existing.length)
      );
      return NextResponse.json({ success: true, data: product }, { status: 201 });
    }

    if (action === "update-product") {
      const id = String(body.id ?? "");
      if (!id) throw new Error("Ürün bulunamadı");
      const product = await updateAdminCatalogProduct(id, cleanProduct(body.product));
      return NextResponse.json({ success: true, data: product });
    }

    if (action === "delete-product") {
      const id = String(body.id ?? "");
      if (!id) throw new Error("Ürün bulunamadı");
      await deleteAdminCatalogProduct(id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "İşlem bulunamadı" },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "İşlem tamamlanamadı",
      },
      { status: 400 }
    );
  }
}
