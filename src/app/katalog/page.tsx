import { CategoryBrowser } from "@/components/catalog/CategoryBrowser";
import { getCatalogTree } from "@/services/catalogCategoryService";
import { getAdminCatalogProducts } from "@/services/catalogProductService";

export default async function KatalogPage() {
  const [categories, products] = await Promise.all([
    getCatalogTree(),
    getAdminCatalogProducts(),
  ]);

  return (
    <CategoryBrowser
      categories={categories}
      products={products.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        categoryId: product.categoryId,
        imageSrc: product.imageSrc,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        isActive: product.isActive,
      }))}
    />
  );
}
