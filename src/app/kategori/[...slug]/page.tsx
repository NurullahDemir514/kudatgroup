import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { findNodeByPath } from "@/lib/catalog-tree";
import { getCatalogTree } from "@/services/catalogCategoryService";

type CategoryPageProps = {
  params: Promise<{
    slug: string[];
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categories = await getCatalogTree();
  const currentNode = findNodeByPath(categories, slug);

  return (
    <CategoryBrowser
      categories={categories}
      currentNode={currentNode ?? { id: slug[slug.length - 1], title: slug[slug.length - 1] }}
      path={slug}
    />
  );
}
