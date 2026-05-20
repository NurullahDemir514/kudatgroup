import { collection, getDocs } from "firebase/firestore";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/firebase";
import {
  buildCatalogTree,
  catalogTree,
  type CatalogCategoryRecord,
  type CatalogNode,
} from "@/lib/catalog-tree";

type FirestoreCatalogCategory = Omit<CatalogCategoryRecord, "id">;

const collectionName = "catalog_categories";
const catalogReadTimeoutMs = 1200;
const localCatalogFile = path.join(process.cwd(), ".data", "catalog-categories.json");

export type AdminCatalogCategory = {
  id: string;
  name: string;
  parentId: string | null;
  image?: string;
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
  const localTree = await getLocalCatalogTree();
  if (localTree.length) return localTree;

  try {
    const snapshot = await Promise.race([
      getDocs(collection(db, collectionName)),
      new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("Katalog kategori okuma zaman aşımına uğradı")),
          catalogReadTimeoutMs
        );
      }),
    ]);
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
  try {
    const content = await readFile(localCatalogFile, "utf-8");
    const parsed = JSON.parse(content) as AdminCatalogCategory[];

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveAdminCatalogCategories(categories: AdminCatalogCategory[]) {
  await mkdir(path.dirname(localCatalogFile), { recursive: true });
  await writeFile(localCatalogFile, JSON.stringify(categories, null, 2), "utf-8");
}

async function getLocalCatalogTree(): Promise<CatalogNode[]> {
  const categories = await getAdminCatalogCategories();
  if (!categories.length) return [];

  return buildCatalogTree(
    categories.map((category, index) => ({
      id: category.id,
      title: category.name,
      parentId: category.parentId,
      imageSrc: category.image,
      order: index,
      isActive: true,
    }))
  );
}
