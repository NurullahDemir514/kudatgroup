import { MarketingHome } from "@/components/home/MarketingHome";
import { getAdminCatalogCategories } from "@/services/catalogCategoryService";
import { getAdminCatalogProducts } from "@/services/catalogProductService";
import {
  getMarketingHomeContent,
  type MarketingHomeProduct,
} from "@/services/marketingHomeService";

function categoryPath(
  categories: Awaited<ReturnType<typeof getAdminCatalogCategories>>,
  categoryId: string
) {
  const parts: string[] = [];
  let current = categories.find((category) => category.id === categoryId);

  while (current) {
    parts.unshift(current.title);
    current = current.parentId
      ? categories.find((category) => category.id === current?.parentId)
      : undefined;
  }

  return parts.join(" / ") || "Katalog";
}

export default async function TanitimPage() {
  const [content, products, categories] = await Promise.all([
    getMarketingHomeContent(),
    getAdminCatalogProducts(),
    getAdminCatalogCategories(),
  ]);
  const selectedProducts = content.featuredProductIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const featuredProducts: MarketingHomeProduct[] = selectedProducts.map((product) => ({
    name: product.name,
    category: categoryPath(categories, product.categoryId),
    image: product.imageSrc || "/kudattr.png",
    href: "/katalog",
  }));

  return <MarketingHome content={content} featuredProducts={featuredProducts} />;
}
