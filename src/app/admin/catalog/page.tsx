"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { FiMoreHorizontal } from "react-icons/fi";

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
  variantMode?: "auto" | "none" | "custom";
  variants?: ProductVariant[];
  imageSrc?: string;
  purchasePrice?: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  supplier?: string;
  order: number;
  isActive: boolean;
};

type ProductVariant = {
  id: string;
  name: string;
  code: string;
  colorHex: string;
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
  variantMode: "auto" | "none" | "custom";
  variants: ProductVariant[];
  imageSrc: string;
  purchasePrice: string;
  price: string;
  stock: string;
  supplier: string;
  isActive: boolean;
};

type EditorMode = "category" | "product" | null;
type DeleteTarget =
  | { type: "category"; item: Category }
  | { type: "product"; item: Product }
  | null;

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
  variantMode: "auto",
  variants: [],
  imageSrc: "",
  purchasePrice: "",
  price: "",
  stock: "",
  supplier: "",
  isActive: true,
};

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(value || 0);

const metalVariantTemplate: ProductVariant[] = [
  { id: "gold", name: "Gold", code: "GLD", colorHex: "#D5A642" },
  { id: "silver", name: "Silver", code: "SLV", colorHex: "#C7CBD1" },
];

const emptyProductVariant = (): ProductVariant => ({
  id: `variant-${Date.now()}`,
  name: "",
  code: "",
  colorHex: "#D5A642",
});

function childrenOf(categories: Category[], parentId: string | null) {
  return categories
    .filter((category) => category.parentId === parentId)
    .sort((first, second) => first.order - second.order);
}

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

export default function CatalogAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [editingProductId, setEditingProductId] = useState("");
  const [editorMode, setEditorMode] = useState<EditorMode>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm>(emptyCategoryForm);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openActionMenu, setOpenActionMenu] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [imagePreview, setImagePreview] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const categoryImageRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);

  const selectedCategory =
    categories.find((category) => category.id === selectedCategoryId) ?? null;
  const visibleCategories = useMemo(
    () => childrenOf(categories, selectedCategory?.id ?? null),
    [categories, selectedCategory]
  );
  const categoryProducts = useMemo(
    () =>
      products
        .filter((product) => product.categoryId === selectedCategoryId)
        .sort((first, second) => first.order - second.order),
    [products, selectedCategoryId]
  );
  const isProductLevel = Boolean(selectedCategory && visibleCategories.length === 0);
  const supplierOptions = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => product.supplier?.trim())
            .filter((supplier): supplier is string => Boolean(supplier))
        )
      ).sort((first, second) => first.localeCompare(second, "tr-TR")),
    [products]
  );
  const pageTitle = selectedCategory?.title ?? "Koleksiyonlar";
  const selectedCategoryPath = selectedCategory
    ? categoryPath(categories, selectedCategory.id)
    : "";
  const productCategoryLabel = categoryPath(
    categories,
    productForm.categoryId || selectedCategoryId || null
  );
  const visibleProductCount = isProductLevel
    ? categoryProducts.length
    : selectedCategory
      ? products.filter((product) =>
          visibleCategories.some((category) => category.id === product.categoryId)
        ).length
      : products.length;

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
      setSelectedCategoryId((current) =>
        current && nextCategories.some((category) => category.id === current)
          ? current
          : ""
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Katalog yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    if (!error && !message) return;

    const timeout = window.setTimeout(() => {
      setError("");
      setMessage("");
    }, 3600);

    return () => window.clearTimeout(timeout);
  }, [error, message]);

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
      setError(saveError instanceof Error ? saveError.message : "İşlem tamamlanamadı");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const closeEditor = () => {
    setOpenActionMenu("");
    setEditorMode(null);
    setEditingCategoryId("");
    setEditingProductId("");
    if (categoryImageRef.current) categoryImageRef.current.value = "";
    if (productImageRef.current) productImageRef.current.value = "";
  };

  const openNewCategory = (parentId = selectedCategoryId || "root") => {
    setEditingProductId("");
    setEditingCategoryId("");
    setCategoryForm({ ...emptyCategoryForm, parentId });
    setEditorMode("category");
    if (categoryImageRef.current) categoryImageRef.current.value = "";
  };

  const categoryTargetLabel =
    categoryForm.parentId === "root"
      ? "Ana koleksiyonlar"
      : categoryPath(categories, categoryForm.parentId);

  const openEditCategory = (category: Category) => {
    setEditingProductId("");
    setEditingCategoryId(category.id);
    setCategoryForm({
      title: category.title,
      parentId: category.parentId ?? "root",
      description: category.description ?? "",
      imageSrc: category.imageSrc ?? "",
      isActive: category.isActive,
    });
    setEditorMode("category");
  };

  const openNewProduct = (categoryId = selectedCategoryId) => {
    setEditingCategoryId("");
    setEditingProductId("");
    setProductForm({ ...emptyProductForm, categoryId });
    setEditorMode("product");
    if (productImageRef.current) productImageRef.current.value = "";
  };

  const openEditProduct = (product: Product) => {
    setSelectedCategoryId(product.categoryId);
    setEditingCategoryId("");
    setEditingProductId(product.id);
    setProductForm({
      name: product.name,
      code: product.code,
      categoryId: product.categoryId,
      variantMode: product.variantMode ?? "auto",
      variants: product.variants ?? [],
      imageSrc: product.imageSrc ?? "",
      purchasePrice: String(product.purchasePrice || ""),
      price: String(product.price || ""),
      stock: String(product.stock || ""),
      supplier: product.supplier ?? "",
      isActive: product.isActive,
    });
    setEditorMode("product");
  };

  const saveCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const title = categoryForm.title.trim();
    if (!title) {
      setError("Kategori adı boş olamaz.");
      return;
    }

    const payload = {
      title,
      parentId: categoryForm.parentId === "root" ? null : categoryForm.parentId || null,
      description: categoryForm.description.trim(),
      imageSrc: categoryForm.imageSrc.trim(),
      isActive: categoryForm.isActive,
      order: categories.length,
    };

    const body = editingCategoryId
      ? { action: "update-category", id: editingCategoryId, category: payload }
      : { action: "create-category", category: payload };

    const saved = await requestCatalog(body);
    if (!saved) return;

    if (!editingCategoryId && saved.id) {
      setSelectedCategoryId(saved.id);
    }
    setMessage("Kategori kaydedildi.");
    closeEditor();
  };

  const deleteCategory = async (category: Category) => {
    setOpenActionMenu("");
    setDeleteTarget({ type: "category", item: category });
  };

  const deleteProduct = async (product: Product) => {
    setOpenActionMenu("");
    setDeleteTarget({ type: "product", item: product });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "category") {
      const category = deleteTarget.item;
      const deleted = await requestCatalog({ action: "delete-category", id: category.id });
      if (!deleted) return;

      setSelectedCategoryId(category.parentId ?? "");
      setMessage("Kategori silindi.");
      setDeleteTarget(null);
      closeEditor();
      return;
    }

    const product = deleteTarget.item;
    const deleted = await requestCatalog({ action: "delete-product", id: product.id });
    if (!deleted) return;

    setSelectedCategoryId(product.categoryId);
    setMessage("Ürün silindi.");
    setDeleteTarget(null);
    closeEditor();
  };

  const deleteWarning =
    deleteTarget?.type === "category"
      ? (() => {
          const category = deleteTarget.item;
          const childCount = childrenOf(categories, category.id).length;
          const productCount = products.filter(
            (product) => product.categoryId === category.id
          ).length;

          if (!childCount && !productCount) return "";
          return "Bu kategoriye bağlı alt kayıtlar varsa silme işlemi engellenebilir.";
        })()
      : "";

  const saveProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = productForm.name.trim();
    const categoryId = productForm.categoryId || selectedCategoryId;
    if (!name) {
      setError("Ürün adı boş olamaz.");
      return;
    }
    if (!categoryId) {
      setError("Ürün için kategori seçin.");
      return;
    }

    const payload = {
      ...productForm,
      name,
      code: productForm.code.trim(),
      categoryId,
      imageSrc: productForm.imageSrc.trim(),
      variantMode: productForm.variantMode,
      variants:
        productForm.variantMode === "custom"
          ? productForm.variants
              .map((variant) => ({
                id: variant.id.trim(),
                name: variant.name.trim(),
                code: variant.code.trim(),
                colorHex: variant.colorHex.trim(),
              }))
              .filter(
                (variant) =>
                  variant.id && variant.name && variant.code && variant.colorHex
              )
          : [],
      purchasePrice: Number(productForm.purchasePrice) || 0,
      price: Number(productForm.price) || 0,
      stock: Number(productForm.stock) || 0,
      supplier: productForm.supplier.trim(),
      order: products.length,
    };

    const body = editingProductId
      ? { action: "update-product", id: editingProductId, product: payload }
      : { action: "create-product", product: payload };

    const saved = await requestCatalog(body);
    if (!saved) return;

    setSelectedCategoryId(categoryId);
    setMessage("Ürün kaydedildi.");
    closeEditor();
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
      setError(uploadError instanceof Error ? uploadError.message : "Görsel yüklenemedi");
      return "";
    }
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

  const updateProductVariant = (
    index: number,
    field: keyof ProductVariant,
    value: string
  ) => {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [field]: value } : variant
      ),
    }));
  };

  const removeProductVariant = (index: number) => {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }));
  };

  return (
    <div className="h-full overflow-y-auto bg-[#f8f6f2] text-black">
      <style jsx global>{`
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <section className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
        <div className={isProductLevel ? "mt-2 sm:mt-3" : "mt-1 sm:mt-2"}>
          <div
            className={
              selectedCategory
                ? "mb-4 flex min-h-6 items-center justify-between gap-3"
                : "mb-4 flex min-h-6 items-center justify-center"
            }
          >
            {selectedCategory ? (
              <>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(selectedCategory.parentId ?? "")}
                  className="text-[12px] font-semibold uppercase tracking-[0.14em] text-black/36 transition active:text-black/70"
                >
                  Ana sayfa / {selectedCategoryPath || pageTitle}
                </button>
                <span className="shrink-0 text-xs font-medium text-black/38">
                  {visibleProductCount} ürün
                </span>
              </>
            ) : (
              <p className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-black/38">
                Koleksiyonlar
              </p>
            )}
          </div>

        <main>
          {isLoading ? (
            <div className="rounded-[28px] bg-white/70 px-5 py-10 text-center text-[15px] font-medium text-black/42">
              Katalog yükleniyor...
            </div>
          ) : visibleCategories.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              <article className="group min-w-0">
                <button
                  type="button"
                  onClick={() => openNewCategory(selectedCategoryId || "root")}
                  className="block w-full text-left transition duration-200 active:opacity-70"
                >
                  <span className="flex aspect-[4/5] items-center justify-center rounded-[20px] border border-dashed border-black/16 bg-white/44 transition group-active:scale-[0.99]">
                    <span className="flex flex-col items-center gap-2.5 text-black/42">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-[23px] font-light leading-none text-white">
                        +
                      </span>
                      <span className="text-[12px] font-semibold tracking-[-0.02em]">
                        Kategori ekle
                      </span>
                    </span>
                  </span>
                  <span className="mt-2.5 block min-w-0 text-center opacity-0">
                    <span className="block truncate text-[13px] font-medium leading-[17px] tracking-[-0.03em]">
                      Kategori ekle
                    </span>
                  </span>
                </button>
              </article>
              {visibleCategories.map((category) => {
                const childCount = childrenOf(categories, category.id).length;
                const productCount = products.filter(
                  (product) => product.categoryId === category.id
                ).length;

                return (
                  <article key={category.id} className="group relative min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenActionMenu("");
                        setSelectedCategoryId(category.id);
                      }}
                      className="block w-full text-left transition duration-200 active:opacity-70"
                    >
                      <span className="relative block aspect-[4/5] overflow-hidden rounded-[20px] bg-black/[0.035]">
                        {category.imageSrc ? (
                          <img
                            src={category.imageSrc}
                            alt=""
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                          />
                        ) : null}
                        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/92 px-2 py-0.5 text-[9px] font-semibold text-black shadow-sm backdrop-blur">
                          {childCount ? `${childCount} alt` : `${productCount} ürün`}
                        </span>
                        {!category.isActive ? (
                          <span className="absolute bottom-2.5 right-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur">
                            Pasif
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-2.5 block min-w-0 text-center">
                        <span className="block truncate text-[13px] font-medium leading-[17px] tracking-[-0.03em] text-black">
                          {category.title}
                        </span>
                      </span>
                    </button>
                    <div className="absolute right-2.5 top-2.5 z-10">
                      <button
                        type="button"
                        aria-label={`${category.title} işlemleri`}
                        onClick={(event) => {
                          event.stopPropagation();
                          setOpenActionMenu((current) =>
                            current === `category-${category.id}`
                              ? ""
                              : `category-${category.id}`
                          );
                        }}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-white/94 text-black shadow-sm backdrop-blur transition active:scale-[0.96]"
                      >
                        <FiMoreHorizontal size={18} />
                      </button>
                      {openActionMenu === `category-${category.id}` ? (
                        <div className="absolute right-0 top-11 z-20 w-32 overflow-hidden rounded-2xl bg-white text-left shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06]">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionMenu("");
                              openEditCategory(category);
                            }}
                            className="block h-10 w-full px-4 text-left text-[12px] font-semibold text-black/72 transition hover:bg-black/[0.035]"
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenActionMenu("");
                              deleteCategory(category);
                            }}
                            className="block h-10 w-full px-4 text-left text-[12px] font-semibold text-red-500 transition hover:bg-red-50"
                          >
                            Sil
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : isProductLevel ? (
            <div>
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => openNewProduct(selectedCategoryId)}
                  className="h-9 rounded-full bg-black px-4 text-[12px] font-semibold text-white"
                >
                  Ürün ekle
                </button>
              </div>
              {categoryProducts.length ? (
                <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
                  {categoryProducts.map((product) => {
                    const hasDiscount =
                      typeof product.compareAtPrice === "number" &&
                      product.compareAtPrice > product.price;

                    return (
                      <article key={product.id} className="group min-w-0">
                        <div className="relative aspect-[4/5] overflow-hidden rounded-[20px] bg-black/[0.04]">
                          {product.imageSrc ? (
                            <button
                              type="button"
                              aria-label={`${product.name} görselini büyüt`}
                              onClick={() => {
                                setOpenActionMenu("");
                                setImagePreview({
                                  src: product.imageSrc!,
                                  title: product.name,
                                });
                              }}
                              className="block h-full w-full"
                            >
                              <img
                                src={product.imageSrc}
                                alt={product.name}
                                className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                              />
                            </button>
                          ) : null}
                          <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                            {!product.isActive ? (
                              <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-sm backdrop-blur">
                                Pasif
                              </span>
                            ) : hasDiscount ? (
                              <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-sm backdrop-blur">
                                İndirim
                              </span>
                            ) : (
                              <span />
                            )}
                            <div className="relative">
                              <button
                                type="button"
                                aria-label={`${product.name} işlemleri`}
                                onClick={() =>
                                  setOpenActionMenu((current) =>
                                    current === `product-${product.id}`
                                      ? ""
                                      : `product-${product.id}`
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/94 text-black shadow-sm backdrop-blur transition active:scale-[0.96]"
                              >
                                <FiMoreHorizontal size={18} />
                              </button>
                              {openActionMenu === `product-${product.id}` ? (
                                <div className="absolute right-0 top-11 z-20 w-32 overflow-hidden rounded-2xl bg-white shadow-[0_18px_45px_rgba(0,0,0,0.18)] ring-1 ring-black/[0.06]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenu("");
                                      openEditProduct(product);
                                    }}
                                    className="block h-10 w-full px-4 text-left text-[12px] font-semibold text-black/72 transition hover:bg-black/[0.035]"
                                  >
                                    Düzenle
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenActionMenu("");
                                      deleteProduct(product);
                                    }}
                                    className="block h-10 w-full px-4 text-left text-[12px] font-semibold text-red-500 transition hover:bg-red-50"
                                  >
                                    Sil
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="absolute inset-x-3 bottom-3 flex justify-end">
                            <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                              {product.stock} stok
                            </span>
                          </div>
                        </div>
                        <div className="pt-2">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                            <p className="line-clamp-2 text-[13px] font-medium leading-[17px] tracking-[-0.02em] text-black">
                              {product.name}
                            </p>
                            {hasDiscount ? (
                              <span className="pt-0.5 text-[10px] font-medium leading-none text-black/28 line-through">
                                {formatPrice(product.compareAtPrice!)}
                              </span>
                            ) : null}
                          </div>
                          <div className="mt-0 flex items-end justify-between gap-2">
                            <span className="truncate text-[10px] font-medium uppercase tracking-[0.1em] text-black/34">
                              {product.code}
                            </span>
                            <span className="shrink-0 text-[14px] font-semibold leading-none tracking-[-0.03em] text-black">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[28px] bg-white/70 px-5 py-10 text-center">
                  <p className="text-[15px] font-medium text-black/48">
                    Bu kategoride henüz ürün yok.
                  </p>
                  <button
                    type="button"
                    onClick={() => openNewProduct(selectedCategoryId)}
                    className="mt-4 h-11 rounded-full bg-black px-5 text-[13px] font-semibold text-white"
                  >
                    İlk ürünü ekle
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-[28px] bg-white/70 px-5 py-10 text-center">
              <p className="text-[15px] font-medium text-black/48">
                İlk kategoriyi ekleyin.
              </p>
              <button
                type="button"
                onClick={() => openNewCategory("root")}
                className="mt-4 h-11 rounded-full bg-black px-5 text-[13px] font-semibold text-white"
              >
                Kategori ekle
              </button>
            </div>
          )}
        </main>
        </div>
      </section>

      {editorMode ? (
        <div className="fixed inset-0 z-40">
          <button
            type="button"
            aria-label="Formu kapat"
            className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
            onClick={closeEditor}
          />
          <div className="scrollbar-hidden absolute inset-x-0 bottom-0 mx-auto max-h-[86vh] max-w-2xl overflow-y-auto rounded-t-[30px] bg-[#fbfaf7] px-5 pb-6 pt-3 shadow-2xl ring-1 ring-black/[0.08]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-black/12" />
            {editorMode === "category" ? (
              <form onSubmit={saveCategory}>
                <EditorHeader
                  title={editingCategoryId ? "Kategoriyi düzenle" : "Kategori ekle"}
                  subtitle="Müşteri katalog ağacındaki kategori bilgisini yönetin."
                  onClose={closeEditor}
                />
                <div className="mt-5 grid gap-3">
                  <input
                    value={categoryForm.title}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder="Kategori adı"
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <div className="flex h-12 items-center rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm font-medium text-black/58">
                    <span className="min-w-0 truncate">
                      {editingCategoryId
                        ? categoryPath(
                            categories,
                            categoryForm.parentId === "root"
                              ? null
                              : categoryForm.parentId
                          )
                        : categoryTargetLabel}
                    </span>
                  </div>
                  <input
                    value={categoryForm.imageSrc}
                    onChange={(event) =>
                      setCategoryForm((current) => ({
                        ...current,
                        imageSrc: event.target.value,
                      }))
                    }
                    placeholder="Görsel bağlantısı"
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <input
                    ref={categoryImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleCategoryImage(event.target.files?.[0])}
                    className="text-sm text-black/45 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <label className="flex h-11 items-center justify-between rounded-2xl bg-black/[0.035] px-4 text-sm font-semibold text-black/55">
                    Katalogda aktif
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
                  </label>
                  {categoryForm.imageSrc ? (
                    <img
                      src={categoryForm.imageSrc}
                      alt=""
                      className="h-36 rounded-[24px] object-cover"
                    />
                  ) : null}
                </div>
                <EditorActions
                  isSaving={isSaving}
                  primaryLabel="Kaydet"
                  dangerLabel={editingCategoryId ? "Sil" : undefined}
                  onDanger={
                    editingCategoryId
                      ? () => {
                          const category = categories.find(
                            (candidate) => candidate.id === editingCategoryId
                          );
                          if (category) deleteCategory(category);
                        }
                      : undefined
                  }
                />
              </form>
            ) : (
              <form onSubmit={saveProduct}>
                <EditorHeader
                  title={editingProductId ? "Ürünü düzenle" : "Ürün ekle"}
                  subtitle="Ürün kartındaki fiyat, stok ve görsel bilgilerini yönetin."
                  onClose={closeEditor}
                />
                <div className="mt-5 grid gap-3">
                  <input
                    value={productForm.name}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Ürün adı"
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <input
                    value={productForm.code}
                    onChange={(event) =>
                      setProductForm((current) => ({ ...current, code: event.target.value }))
                    }
                    placeholder="Model kodu"
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <div className="flex h-12 items-center rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm font-medium text-black/58">
                    <span className="min-w-0 truncate">{productCategoryLabel}</span>
                  </div>
                  <input
                    list="catalog-suppliers"
                    value={productForm.supplier}
                    onChange={(event) =>
                      setProductForm((current) => ({
                        ...current,
                        supplier: event.target.value,
                      }))
                    }
                    placeholder="Tedarikçi"
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <datalist id="catalog-suppliers">
                    {supplierOptions.map((supplier) => (
                      <option key={supplier} value={supplier} />
                    ))}
                  </datalist>
                  <div className="rounded-[22px] border border-black/[0.08] bg-white/70 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[13px] font-semibold text-black">
                          Varyant ayarı
                        </p>
                        <p className="mt-0.5 text-[12px] leading-5 text-black/44">
                          Renk/flavor toplarını ürün bazında yönetin.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setProductForm((current) => ({
                            ...current,
                            variantMode: "custom",
                            variants: metalVariantTemplate,
                          }))
                        }
                        className="h-8 shrink-0 rounded-full bg-black px-3 text-[11px] font-semibold text-white"
                      >
                        Gold/Silver
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {[
                        { value: "auto", label: "Otomatik" },
                        { value: "none", label: "Varyantsız" },
                        { value: "custom", label: "Özel" },
                      ].map((option) => {
                        const isSelected = productForm.variantMode === option.value;
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              setProductForm((current) => ({
                                ...current,
                                variantMode: option.value as ProductForm["variantMode"],
                              }))
                            }
                            className={
                              isSelected
                                ? "h-10 rounded-full bg-black text-[12px] font-semibold text-white"
                                : "h-10 rounded-full bg-black/[0.045] text-[12px] font-semibold text-black/52"
                            }
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                    {productForm.variantMode === "custom" ? (
                      <div className="mt-3 grid gap-2">
                        {productForm.variants.map((variant, index) => (
                          <div
                            key={`${variant.id}-${index}`}
                            className="grid grid-cols-[44px_minmax(0,1fr)_72px_36px] gap-2"
                          >
                            <input
                              value={variant.colorHex}
                              onChange={(event) =>
                                updateProductVariant(index, "colorHex", event.target.value)
                              }
                              aria-label="Varyant rengi"
                              className="h-11 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-2 text-[11px] outline-none focus:border-black/25"
                            />
                            <input
                              value={variant.name}
                              onChange={(event) =>
                                updateProductVariant(index, "name", event.target.value)
                              }
                              placeholder="Ad"
                              className="h-11 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-3 text-sm outline-none focus:border-black/25"
                            />
                            <input
                              value={variant.code}
                              onChange={(event) =>
                                updateProductVariant(index, "code", event.target.value)
                              }
                              placeholder="Kod"
                              className="h-11 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-3 text-sm outline-none focus:border-black/25"
                            />
                            <button
                              type="button"
                              onClick={() => removeProductVariant(index)}
                              aria-label={`${variant.name || "Varyant"} sil`}
                              className="h-11 rounded-2xl bg-red-50 text-[18px] font-semibold text-red-500"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm((current) => ({
                              ...current,
                              variants: [...current.variants, emptyProductVariant()],
                            }))
                          }
                          className="h-10 rounded-full bg-black/[0.045] text-[12px] font-semibold text-black/56"
                        >
                          Varyant ekle
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      value={productForm.purchasePrice}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          purchasePrice: event.target.value,
                        }))
                      }
                      inputMode="decimal"
                      placeholder="Alış fiyatı"
                      className="h-12 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-3 text-sm outline-none focus:border-black/25"
                    />
                    <input
                      value={productForm.price}
                      onChange={(event) =>
                        setProductForm((current) => ({
                          ...current,
                          price: event.target.value,
                        }))
                      }
                      inputMode="decimal"
                      placeholder="Satış fiyatı"
                      className="h-12 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-3 text-sm outline-none focus:border-black/25"
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
                      className="h-12 min-w-0 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-3 text-sm outline-none focus:border-black/25"
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
                    className="h-12 rounded-2xl border border-black/[0.08] bg-[#f7f4ef] px-4 text-sm outline-none focus:border-black/25"
                  />
                  <input
                    ref={productImageRef}
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleProductImage(event.target.files?.[0])}
                    className="text-sm text-black/45 file:mr-3 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <label className="flex h-11 items-center justify-between rounded-2xl bg-black/[0.035] px-4 text-sm font-semibold text-black/55">
                    Katalogda aktif
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
                  </label>
                  {productForm.imageSrc ? (
                    <img
                      src={productForm.imageSrc}
                      alt=""
                      className="h-40 rounded-[24px] object-cover"
                    />
                  ) : null}
                </div>
                <EditorActions
                  isSaving={isSaving}
                  primaryLabel={editingProductId ? "Ürünü güncelle" : "Ürünü kaydet"}
                  dangerLabel={editingProductId ? "Sil" : undefined}
                  onDanger={
                    editingProductId
                      ? () => {
                          const product = products.find(
                            (candidate) => candidate.id === editingProductId
                          );
                          if (product) deleteProduct(product);
                        }
                      : undefined
                  }
                />
              </form>
            )}
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Silme onayını kapat"
            className="absolute inset-0 bg-black/24 backdrop-blur-[2px]"
            onClick={() => setDeleteTarget(null)}
          />
          <div className="absolute inset-x-4 bottom-4 mx-auto max-w-md rounded-[28px] bg-[#fbfaf7] p-5 shadow-2xl ring-1 ring-black/[0.08]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-red-500">
              Silme onayı
            </p>
            <h3 className="mt-2 text-[22px] font-semibold leading-7 tracking-[-0.04em] text-black">
              {deleteTarget.type === "category"
                ? deleteTarget.item.title
                : deleteTarget.item.name}
            </h3>
            <p className="mt-2 text-sm leading-6 text-black/52">
              Bu kayıt silinecek. Bu işlem geri alınamaz.
            </p>
            {deleteWarning ? (
              <p className="mt-3 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium leading-5 text-red-600">
                {deleteWarning}
              </p>
            ) : null}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="h-12 rounded-full bg-black/[0.04] text-sm font-semibold text-black/58"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isSaving}
                className="h-12 rounded-full bg-red-500 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSaving ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {imagePreview ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Görsel önizlemeyi kapat"
            className="absolute inset-0 bg-black/72 backdrop-blur-md"
            onClick={() => setImagePreview(null)}
          />
          <div className="absolute inset-x-4 top-1/2 mx-auto max-w-4xl -translate-y-1/2">
            <div className="relative overflow-hidden rounded-[28px] bg-black shadow-2xl">
              <img
                src={imagePreview.src}
                alt={imagePreview.title}
                className="max-h-[82vh] w-full object-contain"
              />
              <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 bg-gradient-to-b from-black/56 to-transparent p-4">
                <p className="min-w-0 truncate text-sm font-semibold text-white">
                  {imagePreview.title}
                </p>
                <button
                  type="button"
                  aria-label="Kapat"
                  onClick={() => setImagePreview(null)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/92 text-[20px] font-medium text-black shadow-sm backdrop-blur"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {error || message ? (
        <div className="fixed bottom-5 right-5 z-50 w-[min(360px,calc(100vw-40px))]">
          <div
            className={
              error
                ? "rounded-2xl border border-red-200/70 bg-white px-4 py-3 text-sm font-semibold text-red-600 shadow-[0_18px_45px_rgba(0,0,0,0.14)]"
                : "rounded-2xl border border-black/[0.06] bg-black px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_45px_rgba(0,0,0,0.18)]"
            }
          >
            {error || message}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EditorHeader({
  title,
  subtitle,
  onClose,
}: {
  title: string;
  subtitle: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-[22px] font-semibold tracking-[-0.04em]">{title}</h2>
        <p className="mt-1 text-sm leading-5 text-black/42">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Kapat"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/[0.04] text-[20px] font-medium text-black/48"
      >
        ×
      </button>
    </div>
  );
}

function EditorActions({
  isSaving,
  primaryLabel,
  dangerLabel,
  onDanger,
}: {
  isSaving: boolean;
  primaryLabel: string;
  dangerLabel?: string;
  onDanger?: () => void;
}) {
  return (
    <div className="mt-5 flex gap-2">
      <button
        type="submit"
        disabled={isSaving}
        className="h-12 flex-1 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:bg-black/35"
      >
        {primaryLabel}
      </button>
      {dangerLabel && onDanger ? (
        <button
          type="button"
          disabled={isSaving}
          onClick={onDanger}
          className="h-12 rounded-full px-4 text-sm font-semibold text-red-600 disabled:text-red-300"
        >
          {dangerLabel}
        </button>
      ) : null}
    </div>
  );
}
