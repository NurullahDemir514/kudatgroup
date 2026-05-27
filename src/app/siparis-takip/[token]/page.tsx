import Link from "next/link";
import { formatPrice } from "@/lib/order-preview";

type TrackingItem = {
  name: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type TrackingOrder = {
  id: string;
  status: string;
  customerName: string;
  customerCompanyName: string;
  totalAmount: number;
  itemCount: number;
  items: TrackingItem[];
  orderDate?: string | null;
  updatedAt?: string | null;
  receiptPdfUrl?: string;
};

const statusCopy: Record<string, { label: string; description: string }> = {
  pending: {
    label: "Sipariş alındı",
    description: "Siparişiniz bize ulaştı. Onaylandığında burada güncellenecek.",
  },
  approved: {
    label: "Hazırlanıyor",
    description: "Siparişiniz onaylandı ve hazırlık sürecine alındı.",
  },
  completed: {
    label: "Tamamlandı",
    description: "Siparişiniz tamamlandı. Satış belgenizi aşağıdan indirebilirsiniz.",
  },
  cancelled: {
    label: "İptal edildi",
    description: "Siparişiniz iptal edildi olarak güncellendi.",
  },
};

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

async function getOrder(token: string): Promise<TrackingOrder | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : "http://localhost:3000");
  const response = await fetch(
    `${baseUrl}/api/qanta-order-tracking/${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );
  const data = await response.json().catch(() => null);
  if (!response.ok || data?.success !== true) return null;
  return data.data as TrackingOrder;
}

export default async function OrderTrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const receiptUrl = `/api/qanta-order-receipt/${encodeURIComponent(token)}`;
  const order = await getOrder(token);
  const status = order ? statusCopy[order.status] ?? statusCopy.pending : null;
  const updatedAt = formatDate(order?.updatedAt ?? order?.orderDate);

  return (
    <main className="min-h-screen bg-[#f8f6f2] text-black">
      <section className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-3 sm:px-8 sm:py-6">
        <header className="flex justify-center">
          <Link href="/">
            <img
              src="/kudattr.png"
              alt="Kudat"
              className="h-auto w-[264px] object-contain"
            />
          </Link>
        </header>

        {!order || !status ? (
          <div className="my-auto py-16 text-center">
            <p className="text-[22px] font-medium tracking-[-0.04em]">
              Sipariş bulunamadı
            </p>
            <p className="mx-auto mt-2 max-w-xs text-[14px] leading-6 text-black/45">
              Takip bağlantısı hatalı ya da süresi dolmuş olabilir.
            </p>
            <Link
              href="/"
              className="mt-7 inline-flex rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white"
            >
              Kataloğa dön
            </Link>
          </div>
        ) : (
          <div className="my-auto py-12">
            <p className="text-center text-[12px] font-semibold uppercase tracking-[0.2em] text-black/36">
              Sipariş takibi
            </p>
            <h1 className="mt-3 text-center text-[34px] font-medium leading-none tracking-[-0.06em]">
              {order.id}
            </h1>

            <div className="mt-10 rounded-[28px] border border-black/8 bg-white/70 p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/34">
                Güncel durum
              </p>
              <h2 className="mt-3 text-[30px] font-semibold tracking-[-0.05em]">
                {status.label}
              </h2>
              <p className="mt-3 text-[15px] leading-6 text-black/52">
                {status.description}
              </p>
              {updatedAt ? (
                <p className="mt-5 text-[12px] font-medium text-black/36">
                  Son güncelleme: {updatedAt}
                </p>
              ) : null}
            </div>

            <div className="mt-4 rounded-[24px] border border-black/8 bg-white/55 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/34">
                    Sipariş özeti
                  </p>
                  <p className="mt-2 text-[16px] font-semibold tracking-[-0.03em]">
                    {order.customerCompanyName || order.customerName}
                  </p>
                </div>
                <p className="text-right text-[18px] font-semibold tracking-[-0.04em]">
                  {formatPrice(order.totalAmount)}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${item.name}-${index}`}
                    className="flex items-center justify-between gap-4 border-t border-black/6 pt-3 text-[14px]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-[16px] object-cover"
                        />
                      ) : (
                        <div className="h-14 w-14 shrink-0 rounded-[16px] bg-black/[0.04]" />
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold tracking-[-0.02em]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-black/42">
                          {item.quantity} adet x {formatPrice(item.unitPrice)}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 font-semibold">{formatPrice(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>

            {order.status === "completed" && order.receiptPdfUrl ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center justify-between rounded-[24px] border border-black/8 bg-black px-5 py-4 text-white shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
              >
                <span>
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.18em] text-white/48">
                    Satış belgesi
                  </span>
                  <span className="mt-1 block text-[18px] font-semibold tracking-[-0.04em]">
                    PDF olarak indir
                  </span>
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-black">
                  Aç
                </span>
              </a>
            ) : null}

            <Link
              href="/"
              className="mx-auto mt-8 flex w-fit rounded-full bg-black px-5 py-3 text-[14px] font-semibold text-white"
            >
              Kataloğa dön
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
