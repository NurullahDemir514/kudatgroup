import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { findNodeByPath } from "@/lib/catalog-tree";
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
  const currentNode = findNodeByPath(categories, slug);

  return (
    <CategoryBrowser
      categories={categories}
      currentNode={currentNode ?? { id: slug[slug.length - 1], title: slug[slug.length - 1] }}
      path={slug}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        categoryId: product.categoryId,
        imageSrc: product.imageSrc || "/katalog/gold-necklace.png",
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        isActive: product.isActive,
      }))}
    />
  );
}
