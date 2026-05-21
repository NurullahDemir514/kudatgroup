export const orderPreviewStorageKey = "kudat.order-preview.v1";
export const cartStorageKey = "kudat.cart.v1";
export const customerCacheStorageKey = "kudat.customer-cache.v1";
export const submittedOrdersStorageKey = "kudat.submitted-orders.v1";

export type OrderPreviewItem = {
  id: string;
  name: string;
  code: string;
  imageSrc: string;
  price: number;
  compareAtPrice?: number;
  quantity: number;
};

export type OrderPreviewDraft = {
  categoryTitle: string;
  sourcePath: string;
  items: OrderPreviewItem[];
};

export type CustomerInfo = {
  fullName: string;
  phone: string;
  district: string;
  neighborhood: string;
  street: string;
  buildingNo: string;
  storeName: string;
  note: string;
};

export type SubmittedOrder = {
  id: string;
  createdAt: string;
  status: "new" | "reviewed";
  trackingToken?: string;
  trackingUrl?: string;
  categoryTitle: string;
  customer: CustomerInfo;
  items: OrderPreviewItem[];
  totalQuantity: number;
  totalAmount: number;
};

export function formatCustomerAddress(customer: CustomerInfo) {
  return [
    customer.neighborhood ? `${customer.neighborhood} Mah.` : null,
    customer.street ? `${customer.street}` : null,
    customer.buildingNo ? `No: ${customer.buildingNo}` : null,
    customer.storeName ? `Mağaza: ${customer.storeName}` : null,
    customer.district,
  ]
    .filter(Boolean)
    .join(", ");
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(price);
}

export function orderTotal(items: OrderPreviewItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export function orderItemCount(items: OrderPreviewItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

export function buildWhatsAppOrderText(
  draft: OrderPreviewDraft,
  customer: CustomerInfo
) {
  const customerLines = [
    customer.fullName ? `Ad Soyad: ${customer.fullName}` : null,
    customer.phone ? `Telefon: ${customer.phone}` : null,
    customer.district ? `İl / İlçe: ${customer.district}` : null,
    formatCustomerAddress(customer)
      ? `Adres: ${formatCustomerAddress(customer)}`
      : null,
    customer.note ? `Not: ${customer.note}` : null,
  ].filter(Boolean);

  return [
    "Kudat sipariş talebi",
    `Kategori: ${draft.categoryTitle}`,
    "",
    "Ürünler",
    ...draft.items.map(
      (item) =>
        `${item.quantity} adet - ${item.name} (${item.code}) - ${formatPrice(
          item.price
        )}`
    ),
    "",
    `Toplam adet: ${orderItemCount(draft.items)}`,
    `Toplam tutar: ${formatPrice(orderTotal(draft.items))}`,
    customerLines.length ? "" : null,
    customerLines.length ? "Müşteri bilgileri" : null,
    ...customerLines,
  ]
    .filter(Boolean)
    .join("\n");
}
