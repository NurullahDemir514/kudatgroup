import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import {
  findSingleProductLeaf,
} from "@/lib/catalog-tree";
import { getVisibleCatalogCategories } from "@/lib/catalog-visibility";
import {
  getPublicCatalogProducts,
  getPublicCatalogTree,
} from "@/services/publicCatalogSnapshotService";

export const revalidate = 300;

export default async function KatalogPage() {
  const categories = getPublicCatalogTree();
  const products = getPublicCatalogProducts();
  const catalogProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    categoryId: product.categoryId,
    variants: product.variants,
    imageSrc: product.imageSrc,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    hideStock: product.hideStock,
    isActive: product.isActive,
  }));
  const visibleCategories = getVisibleCatalogCategories(categories, catalogProducts);
  const singleProductLeaf = findSingleProductLeaf(visibleCategories);

  return (
    <CategoryBrowser
      categories={visibleCategories}
      currentNode={singleProductLeaf?.node}
      path={singleProductLeaf?.path}
      products={catalogProducts}
    />
  );
}
