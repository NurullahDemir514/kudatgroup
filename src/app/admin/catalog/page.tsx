"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Category = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  description?: string;
  imageSrc?: string;
  order: number;
  isActive: boolean;
};

type Product = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  imageSrc?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  description?: string;
  order: number;
  isActive: boolean;
};

type CategoryForm = {
  title: string;
  parentId: string;
  description: string;
  imageSrc: string;
  isActive: boolean;
};

type ProductForm = {
  name: string;
  code: string;
  categoryId: string;
  imageSrc: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  description: string;
  isActive: boolean;
};

const emptyCategoryForm: CategoryForm = {
  title: "",
  parentId: "root",
  description: "",
  imageSrc: "",
  isActive: true,
};

const emptyProductForm: ProductForm = {
  name: "",
  code: "",
  categoryId: "",
  imageSrc: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  description: "",
  isActive: true,
};

const fallbackImages = [
  "/catalog/categories/category-01-steel-family.png",
  "/catalog/categories/category-05-ysx.png",
  "/katalog/gold-necklace.png",
  "/katalog/rose-gold-bracelet.png",
  "/katalog/pearl-earrings.png",
  "/catalog/categories/category-06-vip-series.png",
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value || 0);

function categoryPath(categories: Category[], categoryId: string | null) {
  if (!categoryId) return "Ana kategori";

  const parts: string[] = [];
  let current = categories.find((category) => category.id === categoryId);

  while (current) {
    parts.unshift(current.title);
    current = current.parentId
      ? categories.find((category) => category.id === current?.parentId)
      : undefined;
  }

  return parts.join(" / ") || "Ana kategori";
}

function childrenOf(categories: Category[], parentId: string | null) {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((first, second) => first.order - second.order);
}

export default function CatalogAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [editingCategoryId, setEditingCategoryId] = useState<string>("");
  const [activePanel, setActivePanel] = useState<"category" | "product">(
    "product"
  );
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const categoryImageRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? null;
  const rootCategories = useMemo(() => childrenOf(categories, null), [categories]);
  const categoryProducts = useMemo(
    () =>
      products
        .filter((product) =>
          selectedCategoryId ? product.categoryId === selectedCategoryId : true
        )
        .sort((first, second) => first.order - second.order),
    [products, selectedCategoryId]
  );
  const activeProducts = products.filter((product) => product.isActive).length;

  const loadCatalog = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/catalog", { cache: "no-store" });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Katalog yüklenemedi");
      }

      const nextCategories = result.data.categories as Category[];
      const nextProducts = result.data.products as Product[];

      setCategories(nextCategories);
      setProducts(nextProducts);
      setSelectedCategoryId((current) => current || nextCategories[0]?.id || "");
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Katalog yüklenemedi"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const requestCatalog = async (body: unknown) => {
    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "İşlem tamamlanamadı");
      }

      await loadCatalog();
      return result.data ?? true;
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "İşlem tamamlanamadı"
      );
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const editCategory = (category: Category) => {
    setSelectedCategoryId(category.id);
    setSelectedProductId("");
    setEditingCategoryId(category.id);
    setActivePanel("category");
    setCategoryForm({
      title: category.title,
      parentId: category.parentId ?? "root",
      description: category.description ?? "",
      imageSrc: category.imageSrc ?? "",
      isActive: category.isActive,
    });
  };

  const resetCategoryForm = (parentId = selectedCategoryId || "root") => {
    setSelectedProductId("");
    setEditingCategoryId("");
    setActivePanel("category");
    setCategoryForm({ ...emptyCategoryForm, parentId });
    if (categoryImageRef.current) categoryImageRef.current.value = "";
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      title: categoryForm.title,
      parentId:
        categoryForm.parentId === "root" ? null : categoryForm.parentId || null,
      description: categoryForm.description,
      imageSrc: categoryForm.imageSrc,
      isActive: categoryForm.isActive,
      order: categories.length,
    };

    const body =
      editingCategoryId
        ? { action: "update-category", id: editingCategoryId, category: payload }
        : { action: "create-category", category: payload };

    const saved = await requestCatalog(body);
    if (!saved) return;

    setSelectedCategoryId(saved.id || editingCategoryId || selectedCategoryId);
    resetCategoryForm(saved.id || selectedCategoryId || "root");
    setMessage("Kategori kaydedildi.");
  };

  const deleteCategory = async (category: Category) => {
    const deleted = await requestCatalog({
      action: "delete-category",
      id: category.id,
    });
    if (!deleted) return;

    setSelectedCategoryId("");
    setEditingCategoryId("");
    resetCategoryForm("root");
    setMessage("Kategori silindi.");
  };

  const editProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setSelectedCategoryId(product.categoryId);
    setEditingCategoryId("");
    setActivePanel("product");
    setProductForm({
      name: product.name,
      code: product.code,
      categoryId: product.categoryId,
      imageSrc: product.imageSrc ?? "",
      price: String(product.price || ""),
      compareAtPrice: String(product.compareAtPrice || ""),
      stock: String(product.stock || ""),
      description: product.description ?? "",
      isActive: product.isActive,
    });
  };

  const resetProductForm = (categoryId = selectedCategoryId) => {
    setSelectedProductId("");
    setEditingCategoryId("");
    setActivePanel("product");
    setProductForm({ ...emptyProductForm, categoryId });
    if (productImageRef.current) productImageRef.current.value = "";
  };

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      ...productForm,
      categoryId: productForm.categoryId || selectedCategoryId,
      price: Number(productForm.price),
      compareAtPrice: Number(productForm.compareAtPrice),
      stock: Number(productForm.stock),
      order: products.length,
    };

    const body = selectedProductId
      ? { action: "update-product", id: selectedProductId, product: payload }
      : { action: "create-product", product: payload };

    const saved = await requestCatalog(body);
    if (!saved) return;

    resetProductForm(payload.categoryId);
    setMessage("Ürün kaydedildi.");
  };

  const deleteProduct = async (product: Product) => {
    const deleted = await requestCatalog({
      action: "delete-product",
      id: product.id,
    });
    if (!deleted) return;

    resetProductForm(product.categoryId);
    setMessage("Ürün silindi.");
  };

  const handleCategoryImage = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const imageSrc = await uploadImage(file, "catalog/categories");
    if (imageSrc) setCategoryForm((current) => ({ ...current, imageSrc }));
  };

  const handleProductImage = async (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    const imageSrc = await uploadImage(file, "catalog/products");
    if (imageSrc) setProductForm((current) => ({ ...current, imageSrc }));
  };

  const uploadImage = async (file: File, folder: string) => {
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Görsel yüklenemedi");
      }

      return String(result.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Görsel yüklenemedi"
      );
      return "";
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <section className="flex shrink-0 flex-col gap-3 rounded-[28px] bg-white/62 px-4 py-3 shadow-sm ring-1 ring-black/6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/35">
            Katalog Yönetimi
          </p>
          <h1 className="mt-1 truncate text-2xl font-semibold tracking-[-0.05em] text-black">
            Kategori ve ürünler
          </h1>
        </div>

        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#f7f4ef] px-3 py-1.5 text-xs font-semibold text-black/54">
            {rootCategories.length} ana
          </span>
          <span className="rounded-full bg-[#f7f4ef] px-3 py-1.5 text-xs font-semibold text-black/54">
            {categories.length} kategori
          </span>
          <span className="rounded-full bg-[#f7f4ef] px-3 py-1.5 text-xs font-semibold text-black/54">
            {activeProducts} aktif ürün
          </span>
          <button
            type="button"
            onClick={() => resetCategoryForm("root")}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-black"
          >
            Kategori ekle
          </button>
          <button
            type="button"
            onClick={() => resetProductForm(selectedCategoryId)}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            Ürün ekle
          </button>
        </div>
      </section>

      {error || message ? (
        <div className="shrink-0">
          {error ? (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
              {message}
            </p>
          ) : null}
        </div>
      ) : null}

      <section className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[340px_minmax(0,1fr)_380px]">
        <aside className="min-h-0 overflow-hidden rounded-[28px] bg-white/76 p-3 shadow-sm ring-1 ring-black/6">
          <div className="flex items-center justify-between gap-3 px-1 pb-4">
            <div>
              <h2 className="text-base font-semibold tracking-[-0.04em]">
                Kategoriler
              </h2>
            </div>
            <button
              type="button"
              onClick={() => resetCategoryForm("root")}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
            >
              Yeni
            </button>
          </div>

          <div className="h-[calc(100%-52px)] space-y-2 overflow-auto pr-1">
            {isLoading ? (
              <div className="rounded-3xl bg-[#f7f4ef] p-8 text-center text-sm text-black/42">
                Katalog yükleniyor...
              </div>
            ) : rootCategories.length ? (
              rootCategories.map((root, rootIndex) => {
                const children = childrenOf(categories, root.id);
                const image = root.imageSrc || fallbackImages[rootIndex % fallbackImages.length];
                const isSelected = selectedCategoryId === root.id;

                return (
                  <div key={root.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(root.id);
                        setSelectedProductId("");
                      }}
                      className={`grid w-full grid-cols-[58px_1fr_auto] items-center gap-3 rounded-[24px] p-2 text-left transition ${
                        isSelected
                          ? "bg-black text-white"
                          : "bg-[#f7f4ef] text-black hover:bg-[#f0ebe4]"
                      }`}
                    >
                      <span className="h-[58px] overflow-hidden rounded-[18px] bg-black/5">
                        <img src={image} alt="" className="h-full w-full object-cover" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">
                          {root.title}
                        </span>
                        <span
                          className={`mt-1 block text-xs ${
                            isSelected ? "text-white/48" : "text-black/38"
                          }`}
                        >
                          {children.length} alt kategori
                        </span>
                      </span>
                      <span className="text-lg opacity-40">›</span>
                    </button>

                    {children.length && isSelected ? (
                      <div className="ml-6 mt-2 space-y-1 border-l border-black/10 pl-3">
                        {children.map((child) => {
                          const childProducts = products.filter(
                            (product) => product.categoryId === child.id
                          ).length;

                          return (
                            <button
                              key={child.id}
                              type="button"
                              onClick={() => {
                                setSelectedCategoryId(child.id);
                                setSelectedProductId("");
                              }}
                              className={`flex w-full items-center justify-between rounded-2xl px-3 py-2.5 text-left text-sm transition ${
                                selectedCategoryId === child.id
                                  ? "bg-black text-white"
                                  : "text-black/62 hover:bg-[#f7f4ef] hover:text-black"
                              }`}
                            >
                              <span className="truncate">{child.title}</span>
                              <span className="text-xs opacity-45">
                                {childProducts}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    ) : null}
                  </div>
                );
              })
            ) : (
              <div className="rounded-3xl bg-[#f7f4ef] p-8 text-center text-sm text-black/42">
                İlk ana kategoriyi ekleyin.
              </div>
            )}
          </div>
        </aside>

        <main className="min-h-0 space-y-3 overflow-hidden">
          <div className="rounded-[28px] bg-white/76 p-4 shadow-sm ring-1 ring-black/6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/35">
                  Seçili kategori
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-[-0.05em]">
                  {selectedCategory?.title ?? "Kategori seçin"}
                </h2>
                <p className="mt-1 text-sm text-black/45">
                  {categoryPath(categories, selectedCategoryId)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedCategory ? (
                  <>
                    <button
                      type="button"
                      onClick={() => editCategory(selectedCategory)}
                      className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => resetCategoryForm(selectedCategory.id)}
                      className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
                    >
                      Alt kategori ekle
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="min-h-0 overflow-hidden rounded-[28px] bg-white/76 shadow-sm ring-1 ring-black/6">
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.04em]">
                  Ürünler
                </h3>
                <p className="mt-1 text-sm text-black/42">
                  {selectedCategory
                    ? `${selectedCategory.title} ürünleri`
                    : "Tüm ürünler"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => resetProductForm(selectedCategoryId)}
                className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
              >
                Ürün ekle
              </button>
            </div>

            <div className="max-h-[calc(100vh-295px)] divide-y divide-black/7 overflow-auto">
              {categoryProducts.length ? (
                categoryProducts.map((product) => {
                  const hasDiscount =
                    typeof product.compareAtPrice === "number" &&
                    product.compareAtPrice > product.price;

                  return (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => editProduct(product)}
                      className={`grid w-full grid-cols-[72px_1fr_auto] items-center gap-4 p-4 text-left transition hover:bg-[#f7f4ef] ${
                        selectedProductId === product.id ? "bg-[#f7f4ef]" : ""
                      }`}
                    >
                      <span className="h-[72px] overflow-hidden rounded-[20px] bg-black/[0.04]">
                        {product.imageSrc ? (
                          <img
                            src={product.imageSrc}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-sm font-semibold">
                            {product.name}
                          </span>
                          {!product.isActive ? (
                            <span className="rounded-full bg-black/6 px-2 py-0.5 text-[10px] font-semibold text-black/42">
                              Pasif
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1 block text-xs text-black/42">
                          {product.code} · {product.stock} stok
                        </span>
                        <span className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-semibold">
                            {formatPrice(product.price)}
                          </span>
                          {hasDiscount ? (
                            <span className="text-xs text-black/32 line-through">
                              {formatPrice(product.compareAtPrice!)}
                            </span>
                          ) : null}
                        </span>
                      </span>
                      <span className="text-lg text-black/28">›</span>
                    </button>
                  );
                })
              ) : (
                <div className="p-10 text-center text-sm text-black/42">
                  Bu kategoride henüz ürün yok.
                </div>
              )}
            </div>
          </div>
        </main>

        <aside className="min-h-0 overflow-auto rounded-[28px] bg-white/76 p-4 shadow-sm ring-1 ring-black/6">
          {activePanel === "category" ? (
          <form
            onSubmit={saveCategory}
            className="min-h-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.04em]">
                  Kategori formu
                </h3>
                <p className="mt-1 text-sm text-black/42">
                  Ana kategori veya alt kategori ekleyin.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-black/45">
                <input
                  type="checkbox"
                  checked={categoryForm.isActive}
                  onChange={(event) =>
                    setCategoryForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Aktif
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={categoryForm.title}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="Kategori adı"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <select
                value={categoryForm.parentId}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    parentId: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              >
                <option value="root">Ana kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryPath(categories, category.id)}
                  </option>
                ))}
              </select>
              <input
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Kısa açıklama"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <input
                value={categoryForm.imageSrc}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    imageSrc: event.target.value,
                  }))
                }
                placeholder="Görsel bağlantısı"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <input
                ref={categoryImageRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleCategoryImage(event.target.files?.[0])}
                className="text-sm text-black/45 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              {categoryForm.imageSrc ? (
                <img
                  src={categoryForm.imageSrc}
                  alt=""
                  className="h-32 rounded-[24px] object-cover"
                />
              ) : null}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="h-12 flex-1 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:bg-black/35"
              >
                Kaydet
              </button>
              {editingCategoryId && selectedCategory?.id === editingCategoryId ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => deleteCategory(selectedCategory)}
                  className="h-12 rounded-full px-4 text-sm font-semibold text-red-600"
                >
                  Sil
                </button>
              ) : null}
            </div>
          </form>
          ) : (

          <form
            onSubmit={saveProduct}
            className="min-h-0"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.04em]">
                  Ürün formu
                </h3>
                <p className="mt-1 text-sm text-black/42">
                  Fiyat, stok ve indirim bilgilerini girin.
                </p>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-black/45">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      isActive: event.target.checked,
                    }))
                  }
                />
                Aktif
              </label>
            </div>

            <div className="mt-5 grid gap-3">
              <input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="Ürün adı"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <input
                value={productForm.code}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    code: event.target.value,
                  }))
                }
                placeholder="Model kodu"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <select
                value={productForm.categoryId || selectedCategoryId}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {categoryPath(categories, category.id)}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-3 gap-2">
                <input
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      price: event.target.value,
                    }))
                  }
                  inputMode="decimal"
                  placeholder="Fiyat"
                  className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                />
                <input
                  value={productForm.compareAtPrice}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      compareAtPrice: event.target.value,
                    }))
                  }
                  inputMode="decimal"
                  placeholder="Eski fiyat"
                  className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                />
                <input
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm((current) => ({
                      ...current,
                      stock: event.target.value,
                    }))
                  }
                  inputMode="numeric"
                  placeholder="Stok"
                  className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                />
              </div>
              <input
                value={productForm.imageSrc}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    imageSrc: event.target.value,
                  }))
                }
                placeholder="Görsel bağlantısı"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              <input
                ref={productImageRef}
                type="file"
                accept="image/*"
                onChange={(event) => handleProductImage(event.target.files?.[0])}
                className="text-sm text-black/45 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <input
                value={productForm.description}
                onChange={(event) =>
                  setProductForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Ürün notu"
                className="h-12 rounded-2xl border border-black/8 bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
              />
              {productForm.imageSrc ? (
                <img
                  src={productForm.imageSrc}
                  alt=""
                  className="h-36 rounded-[24px] object-cover"
                />
              ) : null}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="h-12 flex-1 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:bg-black/35"
              >
                {selectedProduct ? "Ürünü güncelle" : "Ürünü kaydet"}
              </button>
              {selectedProduct ? (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => deleteProduct(selectedProduct)}
                  className="h-12 rounded-full px-4 text-sm font-semibold text-red-600"
                >
                  Sil
                </button>
              ) : null}
            </div>
          </form>
          )}
        </aside>
      </section>
    </div>
  );
}
