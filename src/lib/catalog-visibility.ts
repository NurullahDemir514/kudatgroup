import {
  pruneCatalogTreeByProductCounts,
  type CatalogNode,
} from "@/lib/catalog-tree";

type ProductVisibilitySource = {
  categoryId?: string;
  stock: number;
  isActive?: boolean;
};

export const getVisibleCatalogCategories = <TProduct extends ProductVisibilitySource>(
  categories: CatalogNode[],
  products: TProduct[]
) => {
  const productCounts = products.reduce((counts, product) => {
    if (product.isActive === false || product.stock <= 0 || !product.categoryId) {
      return counts;
    }

    counts.set(product.categoryId, (counts.get(product.categoryId) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  return pruneCatalogTreeByProductCounts(categories, productCounts);
};
