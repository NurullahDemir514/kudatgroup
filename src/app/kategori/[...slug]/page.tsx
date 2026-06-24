import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { findNodeByPath } from "@/lib/catalog-tree";
import { getVisibleCatalogCategories } from "@/lib/catalog-visibility";
import {
  getPublicCatalogProducts,
  getPublicCatalogTree,
} from "@/services/publicCatalogSnapshotService";

export const revalidate = 300;

function collectCategoryPaths(nodes: ReturnType<typeof getPublicCatalogTree>) {
  const paths: { slug: string[] }[] = [];

  const visit = (node: (typeof nodes)[number], path: string[]) => {
    const nextPath = [...path, node.id];
    paths.push({ slug: nextPath });
    node.children?.forEach((child) => visit(child, nextPath));
  };

  nodes.forEach((node) => visit(node, []));
  return paths;
}

export function generateStaticParams() {
  return collectCategoryPaths(getPublicCatalogTree());
}

type CategoryPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
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
