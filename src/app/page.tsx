import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { getCatalogTree } from "@/services/catalogCategoryService";

export default async function Home() {
  const categories = await getCatalogTree();

  return <CategoryBrowser categories={categories} />;
}
