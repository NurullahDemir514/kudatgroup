"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  variantsForCatalogProduct,
  type CatalogProductVariant,
} from "@/lib/catalog-product-variants";

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
  variantMode?: "auto" | "none" | "custom";
  variants?: CatalogProductVariant[];
  imageSrc?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  hideStock?: boolean;
  isNew?: boolean;
  categoryId?: string;
  isActive?: boolean;
};

type ProductQuantities = Record<string, number>;
type ProductVariantQuantities = Record<string, Record<string, number>>;

const quickQuantityOptions = [12, 24, 36, 48];
const variantQuickQuantityOptions = [12, 24, 36, 48, 60];
const initialVisibleProductCount = 48;
const visibleProductStep = 48;

function variantsForProduct(product: CatalogProduct) {
  return variantsForCatalogProduct(product);
}

function variantSwatchStyle(variant: CatalogProductVariant) {
  return variant.colorHex.startsWith("linear-gradient")
    ? { background: variant.colorHex }
    : { backgroundColor: variant.colorHex };
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const distanceBetween = (
  first: { x: number; y: number },
  second: { x: number; y: number }
) => Math.hypot(first.x - second.x, first.y - second.y);

function ProductImageViewer({
  imageSrc,
  productName,
  onClose,
}: {
  imageSrc: string;
  productName: string;
  onClose: () => void;
}) {
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  const lastDistanceRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const resetImage = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointersRef.current.values());
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    lastDistanceRef.current =
      points.length >= 2 ? distanceBetween(points[0], points[1]) : null;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;

    pointersRef.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const points = Array.from(pointersRef.current.values());
    if (points.length >= 2) {
      const nextDistance = distanceBetween(points[0], points[1]);
      const previousDistance = lastDistanceRef.current ?? nextDistance;
      lastDistanceRef.current = nextDistance;

      if (previousDistance > 0) {
        setScale((currentScale) =>
          clamp(currentScale * (nextDistance / previousDistance), 1, 4)
        );
      }
      return;
    }

    if (scale <= 1 || !lastPointRef.current) {
      lastPointRef.current = { x: event.clientX, y: event.clientY };
      return;
    }

    const deltaX = event.clientX - lastPointRef.current.x;
    const deltaY = event.clientY - lastPointRef.current.y;
    lastPointRef.current = { x: event.clientX, y: event.clientY };
    setOffset((currentOffset) => ({
      x: clamp(currentOffset.x + deltaX, -220, 220),
      y: clamp(currentOffset.y + deltaY, -220, 220),
    }));
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(event.pointerId);
    const points = Array.from(pointersRef.current.values());
    lastPointRef.current = points[0] ?? null;
    lastDistanceRef.current =
      points.length >= 2 ? distanceBetween(points[0], points[1]) : null;

    if (scale <= 1.02) resetImage();
  };

  const handleDoubleClick = () => {
    if (scale > 1) {
      resetImage();
      return;
    }
    setScale(2.2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black">
      <img
        src={imageSrc}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-45 blur-2xl"
      />
      <div className="absolute inset-0 bg-black/58" />
      <button
        type="button"
        aria-label="Görseli kapat"
        className="absolute inset-0"
        onClick={onClose}
      />
      <button
        type="button"
        aria-label="Görseli kapat"
        onClick={onClose}
        className="absolute right-4 top-[max(16px,env(safe-area-inset-top))] z-20 flex size-11 items-center justify-center rounded-full bg-white/14 text-[28px] font-light text-white shadow-sm backdrop-blur-xl transition active:scale-95"
      >
        ×
      </button>
      <div
        className="relative z-10 flex h-full w-full touch-none select-none items-center justify-center p-4"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onDoubleClick={handleDoubleClick}
      >
        <img
          src={imageSrc}
          alt={productName}
          draggable={false}
          className="max-h-[88dvh] max-w-[94vw] rounded-[18px] object-contain shadow-[0_28px_90px_rgba(0,0,0,0.42)] will-change-transform"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
            transition: pointersRef.current.size ? "none" : "transform 180ms ease",
          }}
        />
      </div>
    </div>
  );
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
        {node.imageSrc ? (
          <img
            src={node.imageSrc}
            alt=""
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
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
  variantQuantities,
  onChangeQuantity,
  onChangeVariantQuantity,
}: {
  product: CatalogProduct;
  quantity: number;
  variantQuantities?: Record<string, number>;
  onChangeQuantity: (productId: string, quantity: number) => void;
  onChangeVariantQuantity: (
    productId: string,
    variantId: string,
    quantity: number
  ) => void;
}) {
  const variants = variantsForProduct(product);
  const hasVariants = variants.length > 0;
  const totalVariantQuantity = variants.reduce(
    (total, variant) => total + (variantQuantities?.[variant.id] ?? 0),
    0
  );
  const hasQuantity = hasVariants ? totalVariantQuantity > 0 : quantity > 0;
  const isOutOfStock = product.stock <= 0;
  const showStock = product.hideStock !== true;
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [isVariantSheetOpen, setIsVariantSheetOpen] = useState(false);
  const hasDiscount =
    typeof product.compareAtPrice === "number" && product.compareAtPrice > product.price;
  const discountRate = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;
  const setQuantity = (nextQuantity: number) => {
    if (isOutOfStock) {
      onChangeQuantity(product.id, 0);
      return;
    }
    onChangeQuantity(product.id, Math.min(Math.max(nextQuantity, 0), product.stock));
  };
  const setVariantQuantity = (variantId: string, nextQuantity: number) => {
    if (isOutOfStock) {
      onChangeVariantQuantity(product.id, variantId, 0);
      return;
    }
    onChangeVariantQuantity(
      product.id,
      variantId,
      Math.min(Math.max(nextQuantity, 0), product.stock)
    );
  };
  const handleQuantityInput = (value: string) => {
    const numericValue = Number(value.replace(/\D/g, ""));
    setQuantity(Number.isFinite(numericValue) ? numericValue : 0);
  };

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[18px] bg-black/[0.04]">
        <button
          type="button"
          aria-label={`${product.name} görselini büyüt`}
          aria-pressed={isImageExpanded}
          onClick={() => setIsImageExpanded(true)}
          className="block h-full w-full overflow-hidden"
        >
          {product.imageSrc ? (
            <img
              src={product.imageSrc}
              alt={product.name}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
            />
          ) : null}
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
          <span className="flex items-center gap-1.5">
            {hasVariants ? (
              <span
                aria-label={`${variants.length} renk seçeneği`}
                className="flex h-7 items-center gap-1 rounded-full bg-white/92 px-2 shadow-sm backdrop-blur"
              >
                {variants.map((variant) => (
                  <span
                    key={variant.id}
                    aria-hidden="true"
                    className="size-3 rounded-full border border-black/10"
                    style={variantSwatchStyle(variant)}
                  />
                ))}
              </span>
            ) : null}
            {showStock ? (
              <span className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur">
                {isOutOfStock ? "Stok yok" : `${product.stock} stok`}
              </span>
            ) : null}
          </span>
        </div>

        <div className="absolute inset-x-3 bottom-3">
          {isOutOfStock ? (
            <button
              type="button"
              disabled
              className="h-11 w-full rounded-full bg-white/72 text-[14px] font-semibold text-black/38 shadow-sm backdrop-blur"
            >
              Stokta yok
            </button>
          ) : hasVariants ? (
            <button
              type="button"
              className="h-11 w-full rounded-full bg-white/94 text-[14px] font-semibold text-black shadow-sm backdrop-blur transition active:scale-[0.98]"
              onClick={() => setIsVariantSheetOpen(true)}
            >
              {totalVariantQuantity ? `${totalVariantQuantity} adet seçildi` : "Sepete ekle"}
            </button>
          ) : hasQuantity ? (
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
      {isVariantSheetOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            aria-label="Renk seçimini kapat"
            className="absolute inset-0 bg-black/24"
            onClick={() => setIsVariantSheetOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-[30px] bg-[#f8f6f2] px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-3 shadow-[0_-24px_80px_rgba(0,0,0,0.22)] sm:rounded-[30px] sm:pb-5">
            <div className="mx-auto mb-5 h-1 w-11 rounded-full bg-black/12" />
            <div className="grid grid-cols-[76px_1fr_auto] items-start gap-4">
              <img
                src={product.imageSrc ?? ""}
                alt={product.name}
                className="aspect-square rounded-[14px] bg-black/[0.04] object-cover"
              />
              <div className="min-w-0">
                <p className="line-clamp-2 text-[18px] font-semibold leading-6 tracking-[-0.04em] text-black">
                  {product.name}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-black/38">
                  {product.code}
                </p>
              </div>
              <button
                type="button"
                aria-label="Kapat"
                className="flex size-10 items-center justify-center rounded-full bg-white text-[24px] font-medium text-black/50 shadow-sm transition active:scale-95"
                onClick={() => setIsVariantSheetOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {variants.map((variant) => {
                const variantQuantity = variantQuantities?.[variant.id] ?? 0;

                return (
                  <div
                    key={variant.id}
                    className="rounded-[18px] bg-white p-3 shadow-sm"
                  >
                    <div className="grid min-h-10 grid-cols-[minmax(0,1fr)_36px_44px_36px] items-center gap-2">
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          aria-hidden="true"
                          className="size-6 shrink-0 rounded-full border border-black/10"
                          style={variantSwatchStyle(variant)}
                        />
                        <span className="truncate text-[15px] font-semibold text-black">
                          {variant.name}
                        </span>
                      </span>
                      <button
                        type="button"
                        aria-label={`${product.name} ${variant.name} adedini azalt`}
                        className="size-9 rounded-full bg-black/[0.045] text-[20px] font-semibold text-black/58 transition active:scale-95 disabled:text-black/20"
                        disabled={variantQuantity <= 0}
                        onClick={() => setVariantQuantity(variant.id, variantQuantity - 1)}
                      >
                        −
                      </button>
                      <input
                        aria-label={`${product.name} ${variant.name} adedi`}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={variantQuantity || ""}
                        placeholder="0"
                        onChange={(event) => {
                          const numericValue = Number(event.target.value.replace(/\D/g, ""));
                          setVariantQuantity(
                            variant.id,
                            Number.isFinite(numericValue) ? numericValue : 0
                          );
                        }}
                        onBlur={() => setVariantQuantity(variant.id, variantQuantity)}
                        className="min-w-0 bg-transparent text-center text-[18px] font-semibold tracking-[-0.03em] text-black outline-none placeholder:text-black/24"
                      />
                      <button
                        type="button"
                        aria-label={`${product.name} ${variant.name} adedini artır`}
                        className="size-9 rounded-full bg-black text-[20px] font-semibold text-white transition active:scale-95"
                        onClick={() => setVariantQuantity(variant.id, variantQuantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-1.5">
                      {variantQuickQuantityOptions.map((option) => {
                        const selected = variantQuantity === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            className={`h-8 rounded-full text-[12px] font-semibold transition active:scale-[0.98] ${
                              selected
                                ? "bg-black text-white"
                                : "bg-black/[0.045] text-black/54"
                            }`}
                            onClick={() => setVariantQuantity(variant.id, option)}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="mt-5 h-14 w-full rounded-full bg-black text-[15px] font-semibold text-white shadow-[0_16px_42px_rgba(0,0,0,0.2)] transition active:scale-[0.98]"
              onClick={() => setIsVariantSheetOpen(false)}
            >
              {totalVariantQuantity
                ? `${totalVariantQuantity} adet sepete eklendi`
                : "Seçimi kapat"}
            </button>
          </div>
        </div>
      ) : null}
      {isImageExpanded && product.imageSrc ? (
        <ProductImageViewer
          imageSrc={product.imageSrc}
          productName={product.name}
          onClose={() => setIsImageExpanded(false)}
        />
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
  const allActiveProducts = useMemo(
    () => (sourceProducts ?? []).filter((product) => product.isActive !== false),
    [sourceProducts]
  );
  const products = useMemo(() => {
    const categoryProducts = allActiveProducts.filter(
      (product) => product.categoryId === category.id
    );

    return categoryProducts;
  }, [allActiveProducts, category]);
  const [quantities, setQuantities] = useState<ProductQuantities>({});
  const [variantQuantities, setVariantQuantities] = useState<ProductVariantQuantities>({});
  const [cartHydrated, setCartHydrated] = useState(false);
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(initialVisibleProductCount);

  useEffect(() => {
    try {
      const cachedCart = window.localStorage.getItem(cartStorageKey);
      if (!cachedCart) {
        setCartHydrated(true);
        return;
      }
      const parsed = JSON.parse(cachedCart) as OrderPreviewDraft;
      const catalogProducts = allActiveProducts.length ? allActiveProducts : products;
      const nextQuantities = Object.fromEntries(
        parsed.items
          .filter((item) => catalogProducts.some((product) => product.id === item.id))
          .map((item) => {
            const product = catalogProducts.find((candidate) => candidate.id === item.id);
            return [item.id, Math.min(item.quantity, product?.stock ?? item.quantity)];
          })
      );

      setQuantities(nextQuantities);
    } catch {
      window.localStorage.removeItem(cartStorageKey);
    } finally {
      setCartHydrated(true);
    }
  }, [allActiveProducts, products]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr-TR");
    const availableProducts = products.filter((product) => product.stock > 0);
    if (!normalizedQuery) return availableProducts;

    return availableProducts.filter((product) => {
      const searchable = `${product.name} ${product.code}`.toLocaleLowerCase("tr-TR");
      return searchable.includes(normalizedQuery);
    });
  }, [products, query]);
  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMoreProducts = visibleProducts.length < filteredProducts.length;

  const cartProducts = allActiveProducts.length ? allActiveProducts : products;
  const selectedProducts = cartProducts.filter((product) => {
    const variants = variantsForProduct(product);
    if (variants.length) {
      return variants.some((variant) => (variantQuantities[product.id]?.[variant.id] ?? 0) > 0);
    }
    return quantities[product.id] > 0;
  });
  const selectedCount = selectedProducts.reduce(
    (total, product) => {
      const variants = variantsForProduct(product);
      if (!variants.length) return total + quantities[product.id];
      return total + variants.reduce(
        (variantTotal, variant) => variantTotal + (variantQuantities[product.id]?.[variant.id] ?? 0),
        0
      );
    },
    0
  );
  const selectedTotal = selectedProducts.reduce(
    (total, product) => {
      const variants = variantsForProduct(product);
      if (!variants.length) return total + product.price * quantities[product.id];
      const quantity = variants.reduce(
        (variantTotal, variant) => variantTotal + (variantQuantities[product.id]?.[variant.id] ?? 0),
        0
      );
      return total + product.price * quantity;
    },
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
  const updateVariantQuantity = (
    productId: string,
    variantId: string,
    quantity: number
  ) => {
    setVariantQuantities((current) => {
      const product = products.find((candidate) => candidate.id === productId);
      const clampedQuantity = Math.min(
        Math.max(quantity, 0),
        product?.stock ?? Number.MAX_SAFE_INTEGER
      );
      const nextProductQuantities = { ...(current[productId] ?? {}) };
      if (clampedQuantity <= 0) delete nextProductQuantities[variantId];
      else nextProductQuantities[variantId] = clampedQuantity;

      const next = { ...current };
      if (Object.keys(nextProductQuantities).length) {
        next[productId] = nextProductQuantities;
      } else {
        delete next[productId];
      }
      return next;
    });
  };

  const buildDraftItems = () =>
    selectedProducts.flatMap((product) => {
      const variants = variantsForProduct(product);
      if (!variants.length) {
        return [{
          id: product.id,
          name: product.name,
          code: product.code,
          imageSrc: product.imageSrc ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          quantity: quantities[product.id],
        }];
      }

      return variants
        .map((variant) => ({
          id: `${product.id}:${variant.id}`,
          productId: product.id,
          variantId: variant.id,
          variantName: variant.name,
          name: `${product.name} - ${variant.name}`,
          code: `${product.code}-${variant.code}`,
          imageSrc: product.imageSrc ?? "",
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          quantity: variantQuantities[product.id]?.[variant.id] ?? 0,
        }))
        .filter((item) => item.quantity > 0);
    });

  useEffect(() => {
    setVisibleCount(initialVisibleProductCount);
  }, [category.id, query]);

  useEffect(() => {
    if (!cartHydrated) return;

    const draft: OrderPreviewDraft = {
      categoryTitle: category.title,
      sourcePath: pathname,
      items: buildDraftItems(),
    };

    if (draft.items.length) {
      window.localStorage.setItem(cartStorageKey, JSON.stringify(draft));
      window.sessionStorage.setItem(orderPreviewStorageKey, JSON.stringify(draft));
    } else {
      window.localStorage.removeItem(cartStorageKey);
      window.sessionStorage.removeItem(orderPreviewStorageKey);
    }
  }, [cartHydrated, category.title, pathname, quantities, selectedProducts, variantQuantities]);

  const previewOrder = () => {
    const draft: OrderPreviewDraft = {
      categoryTitle: category.title,
      sourcePath: pathname,
      items: buildDraftItems(),
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
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={quantities[product.id] ?? 0}
            variantQuantities={variantQuantities[product.id]}
            onChangeQuantity={updateQuantity}
            onChangeVariantQuantity={updateVariantQuantity}
          />
        ))}
      </div>

      {hasMoreProducts ? (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + visibleProductStep)}
            className="h-12 rounded-full border border-black/10 bg-white px-7 text-[14px] font-semibold text-black/70 shadow-sm transition hover:border-black/18 hover:text-black active:scale-[0.98]"
          >
            Daha fazla ürün göster
          </button>
        </div>
      ) : null}

      {!filteredProducts.length ? (
        <div className="mt-10 rounded-[28px] bg-white/60 px-5 py-8 text-center">
          <p className="text-[15px] font-medium text-black">
            {query.trim() ? "Ürün bulunamadı" : "Bu kategoride stokta ürün yok"}
          </p>
          <p className="mt-2 text-[13px] leading-5 text-black/45">
            {query.trim()
              ? "Arama metnini değiştirerek tekrar deneyebilirsin."
              : "Yeni ürünler eklendiğinde bu kategori tekrar siparişe açılır."}
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
