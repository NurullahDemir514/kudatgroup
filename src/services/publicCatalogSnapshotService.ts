import snapshot from "@/data/public-catalog-snapshot.json";
import type { CatalogNode } from "@/lib/catalog-tree";
import type { AdminCatalogCategory } from "@/services/catalogCategoryService";
import type { AdminCatalogProduct } from "@/services/catalogProductService";

type PublicCatalogSnapshot = {
  generatedAt: string;
  categories: AdminCatalogCategory[];
  tree: CatalogNode[];
  products: AdminCatalogProduct[];
};

const publicCatalogSnapshot = snapshot as PublicCatalogSnapshot;

export function getPublicCatalogSnapshot() {
  return publicCatalogSnapshot;
}

export function getPublicCatalogTree() {
  return publicCatalogSnapshot.tree;
}

export function getPublicCatalogCategories() {
  return publicCatalogSnapshot.categories;
}

export function getPublicCatalogProducts() {
  return publicCatalogSnapshot.products;
}
