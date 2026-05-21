"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  categoryHref,
  countProducts,
  type CatalogNode,
} from "@/lib/catalog-tree";
import {
  cartStorageKey,
  formatPrice,
  orderPreviewStorageKey,
  type OrderPreviewDraft,
} from "@/lib/order-preview";

type CategoryBrowserProps = {
  categories: CatalogNode[];
  currentNode?: CatalogNode | null;
  path?: string[];
  products?: CatalogProduct[];
};

export type CatalogProduct = {
  id: string;
  name: string;
  code: string;
  imageSrc: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isNew?: boolean;
  categoryId?: string;
  isActive?: boolean;
};

type ProductQuantities = Record<string, number>;

const quickQuantityOptions = [12, 24, 36, 48];

const productImagePool = [
  "/catalog/categories/category-04-steel-necklaces.png",
  "/catalog/categories/category-03-steel-bracelets.png",
  "/catalog/categories/category-02-steel-earrings.png",
  "/catalog/categories/category-06-vip-series.png",
  "/katalog/gold-necklace.png",
  "/katalog/rose-gold-bracelet.png",
  "/katalog/pearl-earrings.png",
];

function categoryFallbackImage(node: CatalogNode) {
  const title = node.title.toLocaleLowerCase("tr-TR");

  if (title.includes("xuping")) return "/katalog/gold-necklace.png";
  if (title.includes("cm")) return "/katalog/rose-gold-bracelet.png";
  if (title.includes("bijuteri")) return "/katalog/pearl-earrings.png";
  if (title.includes("yüzük")) return "/products/4.jpg";
  if (title.includes("kelepçe")) return "/products/5.jpg";

  return productImagePool[Math.abs(node.id.length) % productImagePool.length];
}

function productImageForCategory(title: string, index: number) {
  const normalizedTitle = title.toLocaleLowerCase("tr-TR");

  if (normalizedTitle.includes("kolye")) {
    return "/catalog/categories/category-04-steel-necklaces.png";
  }

  if (normalizedTitle.includes("bileklik") || normalizedTitle.includes("kelepçe")) {
    return "/catalog/categories/category-03-steel-bracelets.png";
  }

  if (normalizedTitle.includes("küpe")) {
    return "/catalog/categories/category-02-steel-earrings.png";
  }

  if (normalizedTitle.includes("vip")) {
    return "/catalog/categories/category-06-vip-series.png";
  }

  return productImagePool[index % productImagePool.length];
}

function createProductsForCategory(category: CatalogNode): CatalogProduct[] {
  return Array.from({ length: 8 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");

    return {
      id: `${category.id}-${number}`,
      name: `${category.title} Model ${number}`,
      code: `KDT-${category.id.slice(0, 3).toUpperCase()}-${number}`,
      imageSrc: productImageForCategory(category.title, index),
      price: 420 + index * 35,
      compareAtPrice: index % 3 === 0 ? 520 + index * 45 : undefined,
      stock: index % 4 === 0 ? 6 : 18 + index * 3,
      isNew: index < 2,
    };
  });
}

function CategoryLink({
  node,
  path,
}: {
  node: CatalogNode;
  path: string[];
}) {
  return (
    <Link
      href={categoryHref(path)}
      className="group block transition duration-200 active:opacity-60"
    >
      <span className="relative block aspect-[4/5] overflow-hidden rounded-[24px] bg-black/[0.035]">
        <img
          src={node.imageSrc ?? categoryFallbackImage(node)}
          alt=""
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </span>
      <span className="mt-3 block min-w-0 text-center">
        <span className="block text-[15px] font-medium leading-[19px] tracking-[-0.03em] text-black">
          {node.title}
        </span>
      </span>
    </Link>
  );
}

function ProductCard({
  product,
  quantity,
  onChangeQuantity,
}: {
  product: CatalogProduct;
  quantity: number;
  onChangeQuantity: (productId: string, quantity: number) => void;
}) {
  const hasQuantity = quantity > 0;
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const hasDiscount =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const setQuantity = (nextQuantity: number) => {
    onChangeQuantity(product.id, Math.min(Math.max(nextQuantity, 0), product.stock));
  };
  const handleQuantityInput = (value: string) => {
    const numericValue = Number(value.replace(/\D/g, ""));
    setQuantity(Number.isFinite(numericValue) ? numericValue : 0);
  };

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-black/[0.04]">
        <button
          type="button"
          aria-label={`${product.name} görselini büyüt`}
          aria-pressed={isImageExpanded}
          onClick={() => setIsImageExpanded(true)}
          className="block h-full w-full overflow-hidden"
        >
          <img
            src={product.imageSrc}
            alt={product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
          />
        </button>
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          {hasDiscount ? (
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-black shadow-sm backdrop-blur">
              %{discountRate}
            </span>
          ) : product.isNew ? (
            <span className="rounded-full bg-white/92 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black shadow-sm backdrop-blur">
              Yeni
            </span>
          ) : (
            <span />
          )}
          <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
            {product.stock} stok
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3">
          {hasQuantity ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-1.5">
                {quickQuantityOptions.map((option) => {
                  const disabled = option > product.stock;
                  const selected = quantity === option;

                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={disabled}
                      className={`h-7 rounded-full text-[11px] font-semibold transition ${
                        selected
                          ? "bg-black text-white"
                          : "bg-white/88 text-black/58 active:bg-white"
                      } disabled:bg-white/42 disabled:text-black/20`}
                      onClick={() => setQuantity(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
              <div className="grid h-11 grid-cols-[42px_1fr_42px] overflow-hidden rounded-full bg-white/94 text-[15px] font-semibold text-black shadow-sm backdrop-blur">
                <button
                  type="button"
                  aria-label={`${product.name} adedini azalt`}
                  className="transition active:bg-black/5"
                  onClick={() => setQuantity(quantity - 1)}
                >
                  −
                </button>
                <input
                  aria-label={`${product.name} adedi`}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={quantity}
                  onChange={(event) => handleQuantityInput(event.target.value)}
                  onBlur={() => setQuantity(quantity)}
                  className="min-w-0 border-x border-black/8 bg-transparent text-center text-[15px] font-semibold text-black outline-none"
                />
                <button
                  type="button"
                  aria-label={`${product.name} adedini artır`}
                  className="transition active:bg-black/5 disabled:text-black/22"
                  disabled={quantity >= product.stock}
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              className="h-11 w-full rounded-full bg-white/94 text-[14px] font-semibold text-black shadow-sm backdrop-blur transition active:scale-[0.98]"
              onClick={() => setQuantity(1)}
            >
              Sepete ekle
            </button>
          )}
        </div>
      </div>

      <div className="pt-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
          <p className="line-clamp-2 text-[14px] font-medium leading-[18px] tracking-[-0.02em] text-black">
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
          <span className="shrink-0 text-[15px] font-semibold leading-none tracking-[-0.03em] text-black">
            {formatPrice(product.price)}
          </span>
        </div>
      </div>
      {isImageExpanded ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Görseli kapat"
            className="absolute inset-0 cursor-default bg-transparent"
            onClick={() => setIsImageExpanded(false)}
          />
          <div className="relative z-10">
            <button
              type="button"
              aria-label="Görseli kapat"
              onClick={() => setIsImageExpanded(false)}
              className="absolute right-2 top-2 z-10 flex h-10 w-10 items-center justify-center text-[22px] font-medium text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.55)]"
            >
              ×
            </button>
            <button
              type="button"
              aria-label={`${product.name} görselini kapat`}
              onClick={() => setIsImageExpanded(false)}
              className="block"
            >
              <img
                src={product.imageSrc}
                alt={product.name}
                className="max-h-[86vh] max-w-[min(92vw,760px)] rounded-[24px] object-contain shadow-[0_24px_80px_rgba(0,0,0,0.22)]"
              />
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function ProductCatalogView({
  category,
  products: sourceProducts,
}: {
  category: CatalogNode;
  products?: CatalogProduct[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const products = useMemo(() => {
    const categoryProducts = (sourceProducts ?? []).filter(
      (product) => product.categoryId === category.id && product.isActive !== false
    );

    return categoryProducts.length ? categoryProducts : createProductsForCategory(category);
  }, [category, sourceProducts]);
  const [quantities, setQuantities] = useState<ProductQuantities>({});
  const [query, setQuery] = useState("");

  useEffect(() => {
    try {
      const cachedCart = window.localStorage.getItem(cartStorageKey);
      if (!cachedCart) return;
      const parsed = JSON.parse(cachedCart) as OrderPreviewDraft;
      const nextQuantities = Object.fromEntries(
        parsed.items
          .filter((item) => products.some((product) => product.id === item.id))
          .map((item) => {
            const product = products.find((candidate) => candidate.id === item.id);
            return [item.id, Math.min(item.quantity, product?.stock ?? item.quantity)];
          })
      );

      setQuantities(nextQuantities);
    } catch {
      window.localStorage.removeItem(cartStorageKey);
    }
  }, [products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      const searchable = `${product.name} ${product.code}`.toLocaleLowerCase("tr-TR");
      return searchable.includes(normalizedQuery);
    });
  }, [products, query]);

  const selectedProducts = products.filter((product) => quantities[product.id] > 0);
  const selectedCount = selectedProducts.reduce(
    (total, product) => total + quantities[product.id],
    0
  );
  const selectedTotal = selectedProducts.reduce(
    (total, product) => total + product.price * quantities[product.id],
    0
  );

  const updateQuantity = (productId: string, quantity: number) => {
    setQuantities((current) => {
      const product = products.find((candidate) => candidate.id === productId);
      const clampedQuantity = Math.min(
        Math.max(quantity, 0),
        product?.stock ?? Number.MAX_SAFE_INTEGER
      );
      const next = { ...current };
      if (clampedQuantity <= 0) delete next[productId];
      else next[productId] = clampedQuantity;
      return next;
    });
  };

  useEffect(() => {
    const draft: OrderPreviewDraft = {
      categoryTitle: category.title,
      sourcePath: pathname,
      items: selectedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        imageSrc: product.imageSrc,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: quantities[product.id],
      })),
    };

    if (draft.items.length) {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(draft));
      window.sessionStorage.setItem(orderPreviewStorageKey, JSON.stringify(draft));
    } else {
      window.localStorage.removeItem(cartStorageKey);
      window.sessionStorage.removeItem(orderPreviewStorageKey);
    }
  }, [category.title, pathname, quantities, selectedProducts]);

  const previewOrder = () => {
    const draft: OrderPreviewDraft = {
      categoryTitle: category.title,
      sourcePath: pathname,
      items: selectedProducts.map((product) => ({
        id: product.id,
        name: product.name,
        code: product.code,
        imageSrc: product.imageSrc,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        quantity: quantities[product.id],
      })),
    };

    window.localStorage.setItem(cartStorageKey, JSON.stringify(draft));
    window.sessionStorage.setItem(orderPreviewStorageKey, JSON.stringify(draft));
    router.push("/siparis-onizleme");
  };

  return (
    <div className="pt-1">
      <div>
        <label className="group relative block">
          <span className="sr-only">Ürün ara</span>
          <span className="pointer-events-none absolute left-1 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center text-black/34 transition group-focus-within:text-black/58">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-[16px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Model veya kod ara"
            className="h-11 w-full border-b border-black/10 bg-transparent pr-9 pl-8 text-[15px] font-medium text-black outline-none transition placeholder:text-black/30 focus:border-black/28"
          />
          {query ? (
            <button
              type="button"
              aria-label="Aramayı temizle"
              className="absolute right-0 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-[18px] font-medium text-black/32 transition active:scale-95"
              onClick={() => setQuery("")}
            >
              ×
            </button>
          ) : null}
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 sm:gap-x-5">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            onChangeQuantity={updateQuantity}
          />
        ))}
      </div>

      {!filteredProducts.length ? (
        <div className="mt-10 rounded-[28px] bg-white/60 px-5 py-8 text-center">
          <p className="text-[15px] font-medium text-black">Ürün bulunamadı</p>
          <p className="mt-2 text-[13px] leading-5 text-black/45">
            Arama metnini değiştirerek tekrar deneyebilirsin.
          </p>
        </div>
      ) : null}

      {selectedCount ? (
        <div className="sticky bottom-4 z-30 mt-8 rounded-[28px] border border-black/10 bg-[#111] p-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 px-2">
              <p className="text-[18px] font-semibold tracking-[-0.03em]">
                {formatPrice(selectedTotal)}
              </p>
            </div>
            <button
              type="button"
              onClick={previewOrder}
              className="shrink-0 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-black transition active:scale-[0.98]"
            >
              Siparişi önizle
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function findNodeById(nodes: CatalogNode[], id: string): CatalogNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNodeById(node.children ?? [], id);
    if (child) return child;
  }

  return null;
}

function Breadcrumbs({
  categories,
  path,
}: {
  categories: CatalogNode[];
  path: string[];
}) {
  if (!path.length) return null;

  const crumbs = path
    .map((id, index) => {
      const node = findNodeById(categories, id);
      if (!node) return null;

      return {
        id,
        title: node.title,
        href: index === 0 ? categoryHref([id]) : categoryHref(path.slice(0, index + 1)),
      };
    })
    .filter((crumb): crumb is { id: string; title: string; href: string } => Boolean(crumb));

  return (
    <nav
      aria-label="Sayfa yolu"
      className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-2 text-[12px] font-semibold uppercase tracking-[0.14em] text-black/36"
    >
      <Link href="/" className="transition hover:text-black/70">
        Ana sayfa
      </Link>
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;

        return (
          <span key={crumb.id} className="flex min-w-0 items-center gap-2">
            <span className="text-black/22">/</span>
            {isLast ? (
              <span className="max-w-[220px] truncate text-black/56 sm:max-w-none">
                {crumb.title}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="max-w-[180px] truncate transition hover:text-black/70 sm:max-w-none"
              >
                {crumb.title}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

function CatalogTrail({
  categories,
  path,
  isRoot,
}: {
  categories: CatalogNode[];
  path: string[];
  isRoot: boolean;
}) {
  return (
    <div
      className={
        isRoot
          ? "mb-4 flex min-h-6 items-center justify-center"
          : "mb-4 flex min-h-6 items-center justify-start"
      }
    >
      {isRoot ? (
        <p className="text-center text-[12px] font-semibold uppercase tracking-[0.24em] text-black/38">
          Koleksiyonlar
        </p>
      ) : (
        <Breadcrumbs categories={categories} path={path} />
      )}
    </div>
  );
}

export function CategoryBrowser({
  categories,
  currentNode,
  path = [],
  products = [],
}: CategoryBrowserProps) {
  const clientCategories = categories;
  const activeCurrentNode = useMemo(() => {
    if (!currentNode) return null;
    const find = (nodes: CatalogNode[]): CatalogNode | null => {
      for (const node of nodes) {
        if (node.id === currentNode.id) return node;
        const child = find(node.children ?? []);
        if (child) return child;
      }
      return null;
    };

    return find(clientCategories) ?? currentNode;
  }, [clientCategories, currentNode]);

  const visibleCategories = activeCurrentNode
    ? activeCurrentNode.children ?? []
    : clientCategories;
  const isRoot = !activeCurrentNode;
  const isProductPage = Boolean(activeCurrentNode && !visibleCategories.length);
  const totalProducts = countProducts(visibleCategories);

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">
      <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
        <header
          className={
            isProductPage
              ? "flex justify-center"
              : "flex justify-center"
          }
        >
          <Link href="/">
            <img
              src="/kudattr.png"
              alt="Kudat"
              className={
                isProductPage
                  ? "h-auto w-[132px] object-contain sm:w-[156px]"
                  : "h-auto w-[270px] object-contain sm:w-[300px]"
              }
            />
          </Link>
        </header>

        <div
          className={
            isProductPage
              ? "mt-5 sm:mt-7"
              : "mt-2 sm:mt-4"
          }
        >
          {isProductPage && activeCurrentNode ? (
            <>
              <CatalogTrail
                categories={clientCategories}
                path={path}
                isRoot={false}
              />
              <ProductCatalogView
                category={activeCurrentNode}
                products={products}
              />
            </>
          ) : visibleCategories.length ? (
            <>
              {isRoot ? (
                <CatalogTrail
                  categories={clientCategories}
                  path={path}
                  isRoot={isRoot}
                />
              ) : path.length || totalProducts ? (
                <div className="grid grid-cols-[1fr_auto] items-start gap-3">
                  <CatalogTrail
                    categories={clientCategories}
                    path={path}
                    isRoot={isRoot}
                  />
                  {totalProducts ? (
                    <span className="pt-0.5 text-xs font-medium text-black/38">
                      {totalProducts} ürün
                    </span>
                  ) : null}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5">
                {visibleCategories.map((category) => (
                  <CategoryLink
                    key={category.id}
                    node={category}
                    path={[...path, category.id]}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>

        <footer className="mt-auto pt-8 pb-2">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <nav
              aria-label="Alt menü"
              className="flex flex-wrap gap-x-5 gap-y-3 text-[13px] font-medium text-black/48"
            >
              <Link href="/privacy-policy" className="transition hover:text-black">
                Gizlilik
              </Link>
              <Link href="/terms-of-service" className="transition hover:text-black">
                Koşullar
              </Link>
              <Link href="/data-deletion" className="transition hover:text-black">
                Veri silme
              </Link>
              <a
                href="mailto:kurumsal@kudatgroup.com"
                className="transition hover:text-black"
              >
                İletişim
              </a>
            </nav>
          </div>

          <div className="mt-8 flex flex-col gap-2 text-[12px] leading-5 text-black/35 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Kudat Group. Tüm hakları saklıdır.</p>
            <p>kudatgroup.com</p>
          </div>
        </footer>
      </section>
    </main>
  );
}
