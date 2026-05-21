"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  cartStorageKey,
  customerCacheStorageKey,
  formatPrice,
  orderItemCount,
  orderPreviewStorageKey,
  orderTotal,
  formatCustomerAddress,
  submittedOrdersStorageKey,
  type CustomerInfo,
  type OrderPreviewDraft,
  type OrderPreviewItem,
  type SubmittedOrder,
} from "@/lib/order-preview";

const emptyCustomer: CustomerInfo = {
  fullName: "",
  phone: "",
  district: "",
  neighborhood: "",
  street: "",
  buildingNo: "",
  storeName: "",
  note: "",
};

type CustomerCache = Record<string, CustomerInfo>;

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";

  let normalized = digits;
  if (normalized.startsWith("0090")) normalized = normalized.slice(4);
  if (normalized.startsWith("90")) normalized = normalized.slice(2);
  if (normalized.startsWith("0")) normalized = normalized.slice(1);

  if (normalized.length > 10) {
    const lastTenDigits = normalized.slice(-10);
    if (lastTenDigits.startsWith("5")) normalized = lastTenDigits;
  }

  return normalized.slice(0, 10);
}

function formatPhone(value: string) {
  const normalized = normalizePhone(value);
  if (!normalized) return "";

  return [
    "+90",
    normalized.slice(0, 3),
    normalized.slice(3, 6),
    normalized.slice(6, 8),
    normalized.slice(8, 10),
  ]
    .filter(Boolean)
    .join(" ");
}

function readCustomerCache(): CustomerCache {
  try {
    const cached = window.localStorage.getItem(customerCacheStorageKey);
    return cached ? (JSON.parse(cached) as CustomerCache) : {};
  } catch {
    window.localStorage.removeItem(customerCacheStorageKey);
    return {};
  }
}

function saveCustomerToCache(customer: CustomerInfo) {
  if (customer.phone.length < 10) return;
  const cache = readCustomerCache();
  cache[customer.phone] = customer;
  window.localStorage.setItem(customerCacheStorageKey, JSON.stringify(cache));
}

function saveSubmittedOrder(order: SubmittedOrder) {
  try {
    const saved = window.localStorage.getItem(submittedOrdersStorageKey);
    const orders = saved ? (JSON.parse(saved) as SubmittedOrder[]) : [];
    window.localStorage.setItem(
      submittedOrdersStorageKey,
      JSON.stringify([order, ...orders])
    );
  } catch {
    window.localStorage.setItem(submittedOrdersStorageKey, JSON.stringify([order]));
  }
}

function QuantityControl({
  item,
  onChange,
}: {
  item: OrderPreviewItem;
  onChange: (quantity: number) => void;
}) {
  return (
    <div className="grid h-9 w-[112px] grid-cols-[36px_1fr_36px] overflow-hidden rounded-full border border-black/10 text-[14px] font-semibold text-black">
      <button
        type="button"
        aria-label={`${item.name} adedini azalt`}
        className="transition active:bg-black/5"
        onClick={() => onChange(item.quantity - 1)}
      >
        −
      </button>
      <span className="flex items-center justify-center border-x border-black/8">
        {item.quantity}
      </span>
      <button
        type="button"
        aria-label={`${item.name} adedini artır`}
        className="transition active:bg-black/5"
        onClick={() => onChange(item.quantity + 1)}
      >
        +
      </button>
    </div>
  );
}

function TextInput({
  label,
  value,
  placeholder,
  inputMode,
  autoComplete,
  enterKeyHint,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  inputMode?: "text" | "tel";
  autoComplete?: string;
  enterKeyHint?: "next" | "done";
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-black/38">
        {label}
      </span>
      <input
        value={value}
        inputMode={inputMode}
        autoComplete={autoComplete}
        enterKeyHint={enterKeyHint}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-11 w-full border-b border-black/10 bg-transparent text-[15px] font-medium text-black outline-none transition placeholder:text-black/25 focus:border-black/32"
      />
    </label>
  );
}

function BackButton({ fallbackPath }: { fallbackPath: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label="Önceki sayfaya dön"
      className="flex size-10 items-center justify-center rounded-full text-[22px] text-black/54 transition active:scale-95 active:bg-black/[0.04]"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push(fallbackPath || "/");
      }}
    >
      ‹
    </button>
  );
}

export default function OrderPreviewPage() {
  const [draft, setDraft] = useState<OrderPreviewDraft | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo>(emptyCustomer);
  const [rememberedPhone, setRememberedPhone] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    const savedDraft =
      window.sessionStorage.getItem(orderPreviewStorageKey) ??
      window.localStorage.getItem(cartStorageKey);
    if (!savedDraft) return;

    try {
      const parsed = JSON.parse(savedDraft) as OrderPreviewDraft;
      if (Array.isArray(parsed.items) && parsed.items.length) setDraft(parsed);
    } catch {
      window.sessionStorage.removeItem(orderPreviewStorageKey);
    }
  }, []);

  useEffect(() => {
    if (!draft) return;
    window.sessionStorage.setItem(orderPreviewStorageKey, JSON.stringify(draft));
  }, [draft]);

  const totals = useMemo(() => {
    const items = draft?.items ?? [];
    return {
      count: orderItemCount(items),
      total: orderTotal(items),
    };
  }, [draft]);

  const updateItemQuantity = (itemId: string, quantity: number) => {
    setDraft((current) => {
      if (!current) return current;
      const items = current.items
        .map((item) =>
          item.id === itemId ? { ...item, quantity: Math.max(0, quantity) } : item
        )
        .filter((item) => item.quantity > 0);
      return { ...current, items };
    });
  };

  const updatePhone = (value: string) => {
    const phone = normalizePhone(value);
    const cache = readCustomerCache();
    const cachedCustomer = cache[phone] ?? cache[value.replace(/\D/g, "").slice(0, 11)];

    setCustomer((current) => ({
      ...(cachedCustomer ?? current),
      phone,
    }));
    setRememberedPhone(cachedCustomer ? phone : null);
  };

  const createOrder = async () => {
    if (!draft || !draft.items.length || isCreatingOrder) return;

    const order: SubmittedOrder = {
      id: `KDT-${Date.now().toString(36).toUpperCase()}`,
      createdAt: new Date().toISOString(),
      status: "new",
      categoryTitle: draft.categoryTitle,
      customer,
      items: draft.items,
      totalQuantity: orderItemCount(draft.items),
      totalAmount: orderTotal(draft.items),
    };

    setIsCreatingOrder(true);
    setOrderError(null);
    try {
      const response = await fetch("/api/qanta-wholesale-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok || result?.success !== true) {
        throw new Error(result?.error || "Sipariş Qanta'ya gönderilemedi.");
      }

      saveCustomerToCache(customer);
      saveSubmittedOrder(order);
      window.sessionStorage.removeItem(orderPreviewStorageKey);
      window.localStorage.removeItem(cartStorageKey);
      setCreatedOrderId(order.id);
    } catch (error) {
      setOrderError(
        error instanceof Error ? error.message : "Sipariş oluşturulamadı."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  if (!draft && !createdOrderId) {
    return (
      <main className="min-h-screen bg-[#f8f6f2] text-black">
        <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
          <header className="grid grid-cols-[40px_1fr_40px] items-center">
            <BackButton fallbackPath="/" />
            <Link href="/" className="justify-self-center">
              <img src="/kudattr.png" alt="Kudat" className="h-auto w-[132px] object-contain" />
            </Link>
          </header>
          <div className="my-auto py-16 text-center">
            <p className="text-[22px] font-medium tracking-[-0.04em]">Sepet bulunamadı</p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-6 text-black/45">
              Sipariş önizlemesi için önce katalogdan ürün seçmelisin.
            </p>
            <Link href="/" className="mt-7 inline-flex rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white">
              Kataloğa dön
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (createdOrderId) {
    return (
      <main className="min-h-screen bg-[#f8f6f2] text-black">
        <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
          <header className="flex justify-center">
            <Link href="/">
              <img src="/kudattr.png" alt="Kudat" className="h-auto w-[132px] object-contain" />
            </Link>
          </header>
          <div className="my-auto py-16 text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/36">Sipariş alındı</p>
            <h1 className="mt-3 text-[34px] font-medium leading-none tracking-[-0.06em]">{createdOrderId}</h1>
            <p className="mx-auto mt-4 max-w-xs text-[14px] leading-6 text-black/48">
              Siparişiniz bize ulaştı. Ekibimiz en kısa sürede sizinle iletişime geçecek.
            </p>
            <Link href="/" className="mt-8 inline-flex rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white">
              Kataloğa dön
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const activeDraft = draft;
  if (!activeDraft) return null;

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">
      <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
        <header className="grid grid-cols-[40px_1fr_40px] items-center">
          <BackButton fallbackPath={draft?.sourcePath || "/"} />
          <Link href="/" className="justify-self-center">
            <img src="/kudattr.png" alt="Kudat" className="h-auto w-[132px] object-contain" />
          </Link>
        </header>

        <div className="mt-5">
          <div className="text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/36">Sipariş önizleme</p>
            <h1 className="mt-2 text-[32px] font-medium leading-none tracking-[-0.06em] text-black">{formatPrice(totals.total)}</h1>
          </div>

          <div className="mt-7 space-y-5">
            {activeDraft.items.map((item) => (
              <article key={item.id} className="grid grid-cols-[70px_1fr] gap-4 border-b border-black/8 pb-5">
                <img src={item.imageSrc} alt={item.name} className="aspect-square rounded-[18px] object-cover" />
                <div className="min-w-0">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-[15px] font-medium leading-5 tracking-[-0.025em]">{item.name}</p>
                      <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-black/34">{item.code}</p>
                    </div>
                    <div className="text-right">
                      {item.compareAtPrice && item.compareAtPrice > item.price ? (
                        <p className="text-[10px] font-medium text-black/25 line-through">{formatPrice(item.compareAtPrice)}</p>
                      ) : null}
                      <p className="text-[15px] font-semibold tracking-[-0.03em]">{formatPrice(item.price)}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <QuantityControl item={item} onChange={(quantity) => updateItemQuantity(item.id, quantity)} />
                    <p className="text-[13px] font-semibold text-black/62">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 pt-2">
            <div className="relative text-center">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-black/36">Teslimat bilgileri</p>
              </div>
              {rememberedPhone ? (
                <span className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-black/[0.06] px-3 py-1 text-[11px] font-semibold text-black/48">Hatırlandı</span>
              ) : null}
            </div>

            <div className="mt-5 grid gap-5">
              <TextInput
                label="Telefon"
                value={formatPhone(customer.phone)}
                placeholder="0532 123 45 67"
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="next"
                onChange={updatePhone}
              />
              <TextInput
                label="Ad Soyad"
                value={customer.fullName}
                placeholder="Örn. Ayşe Demir"
                autoComplete="name"
                enterKeyHint="next"
                onChange={(fullName) => setCustomer((current) => ({ ...current, fullName }))}
              />
              <TextInput
                label="İl / İlçe"
                value={customer.district}
                placeholder="Örn. İstanbul / Kadıköy"
                autoComplete="address-level2"
                enterKeyHint="next"
                onChange={(district) => setCustomer((current) => ({ ...current, district }))}
              />
              <TextInput
                label="Mahalle"
                value={customer.neighborhood}
                placeholder="Örn. Suadiye"
                autoComplete="address-line1"
                enterKeyHint="next"
                onChange={(neighborhood) => setCustomer((current) => ({ ...current, neighborhood }))}
              />
              <TextInput
                label="Cadde / Sokak"
                value={customer.street}
                placeholder="Örn. Bağdat Cad."
                autoComplete="address-line2"
                enterKeyHint="next"
                onChange={(street) => setCustomer((current) => ({ ...current, street }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <TextInput
                  label="Bina / Kapı No"
                  value={customer.buildingNo}
                  placeholder="Örn. 24"
                  inputMode="text"
                  enterKeyHint="next"
                  onChange={(buildingNo) => setCustomer((current) => ({ ...current, buildingNo }))}
                />
                <TextInput
                  label="Mağaza Adı"
                  value={customer.storeName}
                  placeholder="Örn. Işıl Takı"
                  autoComplete="organization"
                  enterKeyHint="next"
                  onChange={(storeName) => setCustomer((current) => ({ ...current, storeName }))}
                />
              </div>
              {formatCustomerAddress(customer) ? (
                <p className="-mt-1 text-[12px] leading-5 text-black/36">
                  {formatCustomerAddress(customer)}
                </p>
              ) : null}
              <TextInput
                label="Sipariş notu"
                value={customer.note}
                placeholder="Renk, teslimat veya özel istek"
                enterKeyHint="done"
                onChange={(note) => setCustomer((current) => ({ ...current, note }))}
              />
            </div>
          </div>
        </div>

        {orderError ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-[13px] font-medium leading-5 text-red-700">
            {orderError}
          </p>
        ) : null}

        {activeDraft.items.length ? (
          <div className="sticky bottom-4 z-30 mt-8 rounded-[28px] border border-black/10 bg-[#111] p-3 text-white shadow-[0_18px_60px_rgba(0,0,0,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 px-2">
                <p className="text-[18px] font-semibold tracking-[-0.03em]">{formatPrice(totals.total)}</p>
              </div>
              <button
                type="button"
                onClick={createOrder}
                disabled={isCreatingOrder}
                className="shrink-0 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-black transition active:scale-[0.98] disabled:opacity-60"
              >
                {isCreatingOrder ? "Gönderiliyor" : "Siparişi oluştur"}
              </button>
            </div>
          </div>
        ) : (
          <Link href={activeDraft.sourcePath || "/"} className="mt-8 rounded-full bg-black px-5 py-3 text-center text-[14px] font-semibold text-white">
            Ürün seçmeye dön
          </Link>
        )}
      </section>
    </main>
  );
}
