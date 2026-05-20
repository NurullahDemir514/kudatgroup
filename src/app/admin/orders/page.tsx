"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatCustomerAddress,
  formatPrice,
  submittedOrdersStorageKey,
  type SubmittedOrder,
} from "@/lib/order-preview";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<SubmittedOrder[]>([]);

  useEffect(() => {
    try {
      const savedOrders = window.localStorage.getItem(submittedOrdersStorageKey);
      setOrders(savedOrders ? (JSON.parse(savedOrders) as SubmittedOrder[]) : []);
    } catch {
      window.localStorage.removeItem(submittedOrdersStorageKey);
      setOrders([]);
    }
  }, []);

  const totals = useMemo(
    () => ({
      count: orders.length,
      amount: orders.reduce((sum, order) => sum + order.totalAmount, 0),
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
            <p className="mt-1 font-semibold text-black">{totals.count} sipariş</p>
          </div>
          <div className="rounded-2xl bg-white/70 px-4 py-3 ring-1 ring-black/5">
            <p className="text-black/40">Tutar</p>
            <p className="mt-1 font-semibold text-black">
              {formatPrice(totals.amount)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[28px] bg-white/74 p-5 ring-1 ring-black/6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">
                  {order.id}
                </p>
                <h2 className="mt-2 text-xl font-semibold tracking-[-0.035em]">
                  {order.customer.fullName || "İsimsiz müşteri"}
                </h2>
                <p className="mt-1 text-sm text-black/45">
                  {order.customer.phone || "Telefon yok"} ·{" "}
                  {order.customer.district || "Adres bölgesi yok"}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                <p className="mt-1 text-xs text-black/38">
                  {order.totalQuantity} adet · {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-2">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <p className="min-w-0 truncate text-black/62">
                    {item.quantity} adet · {item.name}
                  </p>
                  <p className="shrink-0 font-medium">{formatPrice(item.price)}</p>
                </div>
              ))}
            </div>

            {(formatCustomerAddress(order.customer) || order.customer.note) && (
              <div className="mt-5 grid gap-2 border-t border-black/8 pt-4 text-sm leading-6 text-black/52">
                {formatCustomerAddress(order.customer) ? (
                  <p>{formatCustomerAddress(order.customer)}</p>
                ) : null}
                {order.customer.note ? <p>Not: {order.customer.note}</p> : null}
              </div>
            )}
          </article>
        ))}

        {!orders.length ? (
          <div className="rounded-[32px] bg-white/60 px-6 py-12 text-center ring-1 ring-black/5">
            <p className="text-lg font-semibold tracking-[-0.03em]">
              Henüz sipariş yok
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/45">
              Katalog tarafında oluşturulan siparişler burada listelenecek.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
