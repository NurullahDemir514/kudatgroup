"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCustomerAddress,
  formatPrice,
  submittedOrdersStorageKey,
  type SubmittedOrder,
  type SubmittedOrderStatus,
} from "@/lib/order-preview";

type TrackingItem = {
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type TrackingOrder = {
  id: string;
  status: SubmittedOrderStatus;
  totalAmount: number;
  itemCount: number;
  items: TrackingItem[];
  updatedAt?: string | null;
};

type OrderViewModel = SubmittedOrder & {
  qanta?: TrackingOrder;
  qantaStatus: SubmittedOrderStatus;
};

const statusMeta: Record<
  SubmittedOrderStatus,
  { label: string; tone: string; helper: string }
> = {
  new: {
    label: "Yeni",
    tone: "bg-black text-white",
    helper: "Qanta’ya gönderildi, işlem bekliyor.",
  },
  reviewed: {
    label: "İncelendi",
    tone: "bg-black text-white",
    helper: "Admin tarafından incelendi.",
  },
  pending: {
    label: "Sipariş alındı",
    tone: "bg-black text-white",
    helper: "Qanta’da işlem bekliyor.",
  },
  approved: {
    label: "Hazırlanıyor",
    tone: "bg-[#C46A1D] text-white",
    helper: "Qanta’da onaylandı.",
  },
  completed: {
    label: "Tamamlandı",
    tone: "bg-[#267A4F] text-white",
    helper: "Qanta’da satış tamamlandı.",
  },
  cancelled: {
    label: "İptal",
    tone: "bg-[#B3261E] text-white",
    helper: "Sipariş iptal edildi.",
  },
};

const filters: Array<{ value: "all" | SubmittedOrderStatus; label: string }> = [
  { value: "all", label: "Tümü" },
  { value: "pending", label: "İşlem bekleyen" },
  { value: "approved", label: "Hazırlanan" },
  { value: "completed", label: "Tamamlanan" },
  { value: "cancelled", label: "İptal" },
];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function orderTrackingPath(order: SubmittedOrder) {
  if (order.trackingUrl) return order.trackingUrl;
  if (!order.trackingToken) return "";
  return `/siparis-takip/${encodeURIComponent(order.trackingToken)}`;
}

async function fetchTrackingOrder(token: string): Promise<TrackingOrder | null> {
  const response = await fetch(
    `/api/qanta-order-tracking/${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) return null;
  return data.data as TrackingOrder;
}

async function fetchSavedOrders(): Promise<SubmittedOrder[]> {
  const response = await fetch("/api/kudat-orders", { cache: "no-store" });
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true || !Array.isArray(data.data)) {
    return [];
  }
  return data.data as SubmittedOrder[];
}

function mergeOrders(
  savedOrders: SubmittedOrder[],
  localOrders: SubmittedOrder[]
) {
  const byId = new Map<string, SubmittedOrder>();
  for (const order of [...savedOrders, ...localOrders]) {
    if (!order.id || byId.has(order.id)) continue;
    byId.set(order.id, order);
  }
  return Array.from(byId.values()).sort(
    (first, second) =>
      new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime()
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<
    "all" | SubmittedOrderStatus
  >("all");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      try {
        const savedOrders = window.localStorage.getItem(submittedOrdersStorageKey);
        const localOrders = savedOrders
          ? (JSON.parse(savedOrders) as SubmittedOrder[])
          : [];
        const serverOrders = await fetchSavedOrders();
        const orders = mergeOrders(serverOrders, localOrders);
        const enriched = await Promise.all(
          orders.map(async (order) => {
            const qanta = order.trackingToken
              ? await fetchTrackingOrder(order.trackingToken)
              : null;
            return {
              ...order,
              qanta: qanta ?? undefined,
              qantaStatus: qanta?.status ?? order.status,
            };
          })
        );
        if (!cancelled) setOrders(enriched);
      } catch {
        window.localStorage.removeItem(submittedOrdersStorageKey);
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleOrders = useMemo(() => {
    if (activeFilter === "all") return orders;
    return orders.filter((order) => order.qantaStatus === activeFilter);
  }, [activeFilter, orders]);

  const totals = useMemo(
    () => ({
      count: orders.length,
      amount: orders.reduce(
        (sum, order) => sum + (order.qanta?.totalAmount ?? order.totalAmount),
        0
      ),
    }),
    [orders]
  );

  return (
    <section>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/35">
            Sipariş yönetimi
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] text-black">
            Siparişler
          </h1>
        </div>
        <div className="flex gap-3 text-sm">
          <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-black/5">
            <p className="text-black/40">Toplam</p>
            <p className="mt-1 font-semibold text-black">
              {totals.count} sipariş
            </p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-black/5">
            <p className="text-black/40">Tutar</p>
            <p className="mt-1 font-semibold text-black">
              {formatPrice(totals.amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const selected = activeFilter === filter.value;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                selected
                  ? "bg-black text-white"
                  : "bg-white/70 text-black/48 ring-1 ring-black/6"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="min-h-[330px] rounded-[26px] bg-white/70 p-5 ring-1 ring-black/6"
                aria-hidden="true"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="h-3 w-32 rounded-full bg-black/[0.06]" />
                    <div className="mt-4 h-6 w-44 rounded-full bg-black/[0.07]" />
                    <div className="mt-3 h-4 w-36 rounded-full bg-black/[0.05]" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-black/[0.07]" />
                </div>
                <div className="mt-8 grid gap-2.5">
                  {Array.from({ length: 2 }).map((__, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="grid grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 rounded-2xl bg-black/[0.025] p-2"
                    >
                      <div className="aspect-square rounded-xl bg-black/[0.06]" />
                      <div>
                        <div className="h-4 w-28 rounded-full bg-black/[0.06]" />
                        <div className="mt-2 h-3 w-20 rounded-full bg-black/[0.04]" />
                      </div>
                      <div className="h-4 rounded-full bg-black/[0.06]" />
                    </div>
                  ))}
                </div>
                <div className="mt-8 h-10 rounded-full bg-black/[0.06]" />
              </div>
            ))
          : null}

        {!isLoading && visibleOrders.map((order) => {
          const status = statusMeta[order.qantaStatus] ?? statusMeta.pending;
          const items = order.qanta?.items.length ? order.qanta.items : order.items;
          const totalAmount = order.qanta?.totalAmount ?? order.totalAmount;
          const totalQuantity = order.qanta?.itemCount ?? order.totalQuantity;
          const trackingPath = orderTrackingPath(order);
          const address = formatCustomerAddress(order.customer);

          return (
            <article
              key={order.id}
              className="flex min-h-[330px] flex-col rounded-[26px] bg-white/84 p-5 ring-1 ring-black/6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
                      {order.id}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${status.tone}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate text-xl font-semibold tracking-[-0.035em]">
                    {order.customer.storeName || order.customer.fullName || "İsimsiz müşteri"}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-sm leading-5 text-black/45">
                    {order.customer.phone || "Telefon yok"}
                    {order.customer.district ? ` · ${order.customer.district}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold">{formatPrice(totalAmount)}</p>
                  <p className="mt-1 text-xs text-black/38">{totalQuantity} adet</p>
                </div>
              </div>

              <p className="mt-4 text-xs font-medium text-black/36">
                {status.helper}
              </p>
              <p className="mt-2 text-xs font-medium text-black/35">
                {formatDate(order.qanta?.updatedAt ?? order.createdAt)}
              </p>

              <div className="mt-4 grid gap-2.5">
                {items.slice(0, 3).map((item, index) => {
                  const imageSrc =
                    "imageSrc" in item ? item.imageSrc : item.imageUrl ?? "";
                  const price = "price" in item ? item.price : item.unitPrice;
                  const itemTotal =
                    "total" in item ? item.total : item.price * item.quantity;
                  return (
                    <div
                      key={`${item.name}-${index}`}
                      className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-black/[0.025] p-2 text-sm"
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="aspect-square rounded-xl bg-black/[0.04] object-cover"
                        />
                      ) : (
                        <div className="aspect-square rounded-xl bg-black/[0.04]" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-[-0.02em] text-black/78">
                          {item.name}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-black/38">
                          {item.quantity} adet · {formatPrice(price)}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-sm font-semibold">
                        {formatPrice(itemTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-auto border-t border-black/8 pt-4">
                <div className="flex flex-wrap gap-2">
                  {address ? (
                    <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black/48">
                      Adres var
                    </span>
                  ) : null}
                  {order.customer.note ? (
                    <span className="rounded-full bg-black/[0.04] px-3 py-1.5 text-xs font-semibold text-black/48">
                      Not var
                    </span>
                  ) : null}
                </div>
                <div className="mt-4 flex gap-2">
                  {trackingPath ? (
                    <a
                      href={trackingPath}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-10 flex-1 items-center justify-center rounded-full bg-black text-sm font-semibold text-white"
                    >
                      Takip ekranı
                    </a>
                  ) : null}
                  <a
                    href="/admin"
                    className="flex h-10 flex-1 items-center justify-center rounded-full bg-white text-sm font-semibold text-black/62 ring-1 ring-black/8"
                  >
                    Qanta’da yönet
                  </a>
                </div>
              </div>
            </article>
          );
        })}

        {!isLoading && !visibleOrders.length ? (
          <div className="py-16 text-center md:col-span-2 xl:col-span-3">
            <p className="text-lg font-semibold tracking-[-0.03em]">
              Sipariş bulunamadı
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
              Bu filtrede gösterilecek sipariş yok.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
