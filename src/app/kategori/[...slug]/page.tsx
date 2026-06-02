import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { findNodeByPath } from "@/lib/catalog-tree";
import { getVisibleCatalogCategories } from "@/lib/catalog-visibility";
import { getCatalogTree } from "@/services/catalogCategoryService";
import { getAdminCatalogProducts } from "@/services/catalogProductService";

type CategoryPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
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
  const currentNode = findNodeByPath(visibleCategories, slug);

  return (
    <CategoryBrowser
      categories={visibleCategories}
      currentNode={currentNode ?? { id: slug[slug.length - 1], title: slug[slug.length - 1] }}
      path={slug}
      products={catalogProducts}
    />
  );
}
