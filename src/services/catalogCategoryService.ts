import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  buildCatalogTree,
  catalogTree,
  type CatalogCategoryRecord,
  type CatalogNode,
} from "@/lib/catalog-tree";

type FirestoreCatalogCategory = Omit<CatalogCategoryRecord, "id">;

const collectionName = "catalog_categories";

const withoutUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  ) as T;

export type AdminCatalogCategory = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  description?: string;
  imageSrc?: string;
  order: number;
  isActive: boolean;
};

const toCatalogCategoryRecord = (
  id: string,
  data: Partial<FirestoreCatalogCategory>
): CatalogCategoryRecord | null => {
  if (!data.title || typeof data.title !== "string") return null;

  return {
    id,
    title: data.title,
    parentId: data.parentId ?? null,
    description: data.description,
    imageSrc: data.imageSrc,
    productCount:
      typeof data.productCount === "number" ? data.productCount : undefined,
    href: data.href,
    order: typeof data.order === "number" ? data.order : 0,
    isActive: data.isActive,
  };
};

export async function getCatalogTree(): Promise<CatalogNode[]> {
  try {
    const snapshot = await getDocs(query(collection(db, collectionName)));
    const records = snapshot.docs
      .map((document) =>
        toCatalogCategoryRecord(
          document.id,
          document.data() as Partial<FirestoreCatalogCategory>
        )
      )
      .filter((record): record is CatalogCategoryRecord => Boolean(record));

    if (!records.length) return catalogTree;

    const tree = buildCatalogTree(records);
    return tree.length ? tree : catalogTree;
  } catch (error) {
    console.error("Katalog kategori ağacı okunamadı:", error);
    return catalogTree;
  }
}

export async function getAdminCatalogCategories(): Promise<AdminCatalogCategory[]> {
  const snapshot = await getDocs(query(collection(db, collectionName)));

  const categories: AdminCatalogCategory[] = [];

  snapshot.docs.forEach((document) => {
      const data = document.data() as Partial<FirestoreCatalogCategory> & {
        slug?: string;
      };
      if (!data.title || typeof data.title !== "string") return;

      categories.push({
        id: document.id,
        title: data.title,
        slug: data.slug ?? document.id,
        parentId: data.parentId ?? null,
        description: data.description,
        imageSrc: data.imageSrc,
        order: typeof data.order === "number" ? data.order : 0,
        isActive: data.isActive !== false,
      });
    });

  return categories.sort((first, second) => first.order - second.order);
}

export async function createAdminCatalogCategory(
  category: Omit<AdminCatalogCategory, "id">
) {
  let id = category.slug;
  let suffix = 2;

  while ((await getDoc(doc(db, collectionName, id))).exists()) {
    id = `${category.slug}-${suffix}`;
    suffix += 1;
  }

  await setDoc(doc(db, collectionName, id), withoutUndefined({
    ...category,
    slug: id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  return { id, ...category, slug: id };
}

export async function updateAdminCatalogCategory(
  id: string,
  category: Partial<Omit<AdminCatalogCategory, "id">>
) {
  await updateDoc(doc(db, collectionName, id), withoutUndefined({
    ...category,
    updatedAt: serverTimestamp(),
  }));

  return { id, ...category };
}

export async function deleteAdminCatalogCategory(id: string) {
  await deleteDoc(doc(db, collectionName, id));
  return true;
}
