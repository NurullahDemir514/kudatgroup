"use client";

import { useState } from "react";

export type MissingTrackingItem = {
  name: string;
  quantity: number;
  missing_quantity: number;
  available_quantity: number;
};

type DecisionState = "idle" | "submitting" | "sent" | "error";

type Props = {
  token: string;
  initialDecision?: string;
  items: MissingTrackingItem[];
};

const decisionCopy: Record<string, string> = {
  continue_available: "Mevcut ürünlerle devam etmek istiyorsunuz.",
  cancel_order: "Sipariş iptal talebiniz iletildi.",
};

export default function CustomerDecisionPanel({
  token,
  initialDecision = "",
  items,
}: Props) {
  const [state, setState] = useState<DecisionState>(
    initialDecision ? "sent" : "idle"
  );
  const [selectedDecision, setSelectedDecision] = useState(initialDecision);
  const [error, setError] = useState("");

  async function submitDecision(decision: "continue_available" | "cancel_order") {
    setState("submitting");
    setError("");
    try {
      const response = await fetch(
        `/api/qanta-order-decision/${encodeURIComponent(token)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision }),
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success !== true) {
        throw new Error(data?.error || "Karar iletilemedi.");
      }
      setSelectedDecision(decision);
      setState("sent");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Karar iletilemedi.");
      setState("error");
    }
  }

  return (
    <div className="mt-4 rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/34">
        Karar gerekiyor
      </p>
      <h2 className="mt-3 text-[28px] font-semibold leading-none tracking-[-0.05em]">
        Bazı ürünler eksik
      </h2>
      <p className="mt-3 text-[15px] leading-6 text-black/52">
        Hazır olan ürünlerle devam edebilir veya siparişi iptal edebilirsiniz.
      </p>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="rounded-[20px] border border-black/7 bg-black/[0.025] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="min-w-0 text-[16px] font-semibold tracking-[-0.03em]">
                {item.name}
              </p>
              <p className="shrink-0 text-[15px] font-semibold text-[#c93221]">
                {item.missing_quantity} eksik
              </p>
            </div>
            <p className="mt-2 text-[13px] font-medium text-black/45">
              {item.quantity} adet istendi, {item.available_quantity} adet hazır.
            </p>
          </div>
        ))}
      </div>

      {state === "sent" ? (
        <div className="mt-5 rounded-[22px] border border-[#1f8f5a]/18 bg-[#1f8f5a]/8 p-4">
          <p className="text-[17px] font-semibold tracking-[-0.03em] text-[#166c44]">
            Kararın iletildi
          </p>
          <p className="mt-1 text-[14px] leading-5 text-black/50">
            {decisionCopy[selectedDecision] || "İşletme bu karara göre ilerleyecek."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          <button
            type="button"
            disabled={state === "submitting"}
            onClick={() => submitDecision("continue_available")}
            className="h-14 rounded-full bg-black px-5 text-[15px] font-semibold text-white transition disabled:opacity-55"
          >
            Mevcut ürünlerle devam et
          </button>
          <button
            type="button"
            disabled={state === "submitting"}
            onClick={() => submitDecision("cancel_order")}
            className="h-14 rounded-full border border-black/10 bg-white px-5 text-[15px] font-semibold text-black transition disabled:opacity-55"
          >
            Siparişi iptal et
          </button>
          {error ? (
            <p className="text-center text-[13px] font-medium text-[#c93221]">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
