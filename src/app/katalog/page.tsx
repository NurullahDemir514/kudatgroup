import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import {
  findSingleProductLeaf,
} from "@/lib/catalog-tree";
import { getVisibleCatalogCategories } from "@/lib/catalog-visibility";
import { getCatalogTree } from "@/services/catalogCategoryService";
import { getAdminCatalogProducts } from "@/services/catalogProductService";

export default async function KatalogPage() {
  const [categories, products] = await Promise.all([
    getCatalogTree(),
    getAdminCatalogProducts(),
  ]);
  const catalogProducts = products.map((product) => ({
    id: product.id,
    name: product.name,
    code: product.code,
    categoryId: product.categoryId,
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
