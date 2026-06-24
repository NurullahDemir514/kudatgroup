import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const collectionName = "catalog_products";
const catalogProductsCacheTtlMs = Number(
  process.env.CATALOG_PRODUCTS_CACHE_TTL_MS ?? 30_000
);

let catalogProductsCache:
  | {
      expiresAt: number;
      value: AdminCatalogProduct[];
    }
  | undefined;

const withoutUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;

export type AdminCatalogProduct = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  variantMode?: "auto" | "none" | "custom";
  variants?: AdminCatalogProductVariant[];
  imageSrc?: string;
  purchasePrice?: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  hideStock?: boolean;
  supplier?: string;
  order: number;
  isActive: boolean;
};

export type AdminCatalogProductVariant = {
  id: string;
  name: string;
  code: string;
  colorHex: string;
};

export type CatalogStockAdjustmentItem = {
  id: string;
  quantity: number;
};

export function invalidateAdminCatalogProductsCache() {
  catalogProductsCache = undefined;
}

export async function getAdminCatalogProducts(): Promise<AdminCatalogProduct[]> {
  const now = Date.now();
  if (catalogProductsCache && catalogProductsCache.expiresAt > now) {
    return catalogProductsCache.value;
  }

  const snapshot = await getDocs(query(collection(db, collectionName)));

  const products = snapshot.docs
    .map((document) => {
      const data = document.data() as Partial<AdminCatalogProduct>;

      return {
        id: document.id,
        name: data.name ?? "",
        code: data.code ?? "",
        categoryId: data.categoryId ?? "",
        variantMode:
          data.variantMode === "none" || data.variantMode === "custom"
            ? data.variantMode
            : "auto",
        variants: Array.isArray(data.variants)
          ? data.variants
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
          : undefined,
        imageSrc: data.imageSrc,
        purchasePrice:
          typeof data.purchasePrice === "number" ? data.purchasePrice : undefined,
        price: typeof data.price === "number" ? data.price : 0,
        compareAtPrice:
          typeof data.compareAtPrice === "number" ? data.compareAtPrice : undefined,
        stock: typeof data.stock === "number" ? data.stock : 0,
        hideStock: data.hideStock === true,
        supplier: data.supplier,
        order: typeof data.order === "number" ? data.order : 0,
        isActive: data.isActive !== false,
      };
    })
    .sort((first, second) => first.order - second.order);

  catalogProductsCache = {
    expiresAt: now + catalogProductsCacheTtlMs,
    value: products,
  };

  return products;
}

export async function adjustAdminCatalogProductStock({
  adjustmentId,
  items,
  source,
}: {
  adjustmentId: string;
  items: CatalogStockAdjustmentItem[];
  source: string;
}) {
  const cleanAdjustmentId = adjustmentId.trim();
  if (!cleanAdjustmentId) throw new Error("Stok hareketi kimliği zorunludur");

  const groupedItems = new Map<string, number>();
  for (const item of items) {
    const id = item.id.trim();
    const quantity = Math.floor(Number(item.quantity) || 0);
    if (!id || quantity <= 0) continue;
    groupedItems.set(id, (groupedItems.get(id) ?? 0) + quantity);
  }
  const cleanItems = Array.from(groupedItems.entries()).map(([id, quantity]) => ({
    id,
    quantity,
  }));

  if (!cleanItems.length) throw new Error("Stok düşülecek ürün bulunamadı");

  const adjustmentRef = doc(db, "catalog_stock_adjustments", cleanAdjustmentId);

  const result = await runTransaction(db, async (transaction) => {
    const previousAdjustment = await transaction.get(adjustmentRef);
    if (previousAdjustment.exists()) {
      return { alreadyApplied: true };
    }

    const productSnapshots = await Promise.all(
      cleanItems.map(async (item) => {
        const ref = doc(db, collectionName, item.id);
        return {
          item,
          ref,
          snapshot: await transaction.get(ref),
        };
      })
    );

    for (const entry of productSnapshots) {
      if (!entry.snapshot.exists()) {
        throw new Error(`Ürün bulunamadı: ${entry.item.id}`);
      }

      const data = entry.snapshot.data() as Partial<AdminCatalogProduct>;
      const currentStock = typeof data.stock === "number" ? data.stock : 0;
      if (currentStock < entry.item.quantity) {
        throw new Error(
          `Yetersiz stok: ${data.name || entry.item.id}. Mevcut: ${currentStock}, İstenen: ${entry.item.quantity}`
        );
      }
    }

    for (const entry of productSnapshots) {
      const data = entry.snapshot.data() as Partial<AdminCatalogProduct>;
      const currentStock = typeof data.stock === "number" ? data.stock : 0;
      transaction.update(entry.ref, {
        stock: currentStock - entry.item.quantity,
        updatedAt: serverTimestamp(),
      });
    }

    transaction.set(adjustmentRef, {
      source,
      items: cleanItems,
      createdAt: serverTimestamp(),
    });

    return { alreadyApplied: false };
  });

  if (!result.alreadyApplied) {
    invalidateAdminCatalogProductsCache();
  }

  return result;
}

export async function createAdminCatalogProduct(
  product: Omit<AdminCatalogProduct, "id">
) {
  const docRef = await addDoc(collection(db, collectionName), withoutUndefined({
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  invalidateAdminCatalogProductsCache();
  return { id: docRef.id, ...product };
}

export async function updateAdminCatalogProduct(
  id: string,
  product: Partial<Omit<AdminCatalogProduct, "id">>
) {
  await updateDoc(doc(db, collectionName, id), withoutUndefined({
    ...product,
    updatedAt: serverTimestamp(),
  }));

  invalidateAdminCatalogProductsCache();
  return { id, ...product };
}

export async function deleteAdminCatalogProduct(id: string) {
  await deleteDoc(doc(db, collectionName, id));
  invalidateAdminCatalogProductsCache();
  return true;
}
