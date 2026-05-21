import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type MarketingHomeCollection = {
  title: string;
  text: string;
  image: string;
  href: string;
};

export type MarketingHomeProduct = {
  name: string;
  category: string;
  image: string;
  href: string;
};

export type MarketingHomeContent = {
  logo: string;
  eyebrow: string;
  title: string;
  body: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  heroImages: string[];
  collectionsEyebrow: string;
  collections: MarketingHomeCollection[];
  reasonsEyebrow: string;
  reasonsTitle: string;
  reasons: string[];
  featuredEyebrow: string;
  featuredTitle: string;
  featuredLinkLabel: string;
  featuredLinkHref: string;
  featuredProductIds: string[];
  featuredProducts: MarketingHomeProduct[];
  processEyebrow: string;
  processTitle: string;
  processSteps: string[];
  finalTitle: string;
  finalBody: string;
  finalCtaLabel: string;
  finalCtaHref: string;
};

const documentRef = doc(db, "catalog_categories", "marketing-home-content");

export const defaultMarketingHomeContent: MarketingHomeContent = {
  logo: "/kudattr.png",
  eyebrow: "Toptan Bijuteri Kataloğu",
  title: "Seçkin koleksiyonlar, net sipariş akışı.",
  body:
    "Çelik, bijuteri ve özel seri ürünlerde mağazalar için düzenli, hızlı ve güvenilir tedarik deneyimi.",
  primaryCtaLabel: "Kataloğu incele",
  primaryCtaHref: "/katalog",
  secondaryCtaLabel: "Sipariş önizleme",
  secondaryCtaHref: "/siparis-onizleme",
  heroImages: [
    "/catalog/categories/category-01-steel-family.png",
    "/catalog/categories/category-06-vip-series.png",
    "/katalog/pearl-earrings.png",
  ],
  collectionsEyebrow: "Koleksiyonlar",
  collections: [
    {
      title: "Çelik Ürünler",
      text: "Günlük satışa uygun, dayanıklı ve güçlü kategori seçkisi.",
      image: "/catalog/categories/category-01-steel-family.png",
      href: "/katalog",
    },
    {
      title: "Bijuteri Ürünleri",
      text: "Mağaza vitrini için hızlı dönen tamamlayıcı modeller.",
      image: "/catalog/categories/category-05-ysx.png",
      href: "/katalog",
    },
    {
      title: "VIP Seri",
      text: "Daha seçkin sunumlar için ayrıştırılmış özel koleksiyon.",
      image: "/catalog/categories/category-06-vip-series.png",
      href: "/katalog",
    },
  ],
  reasonsEyebrow: "Neden Kudat?",
  reasonsTitle: "Toptan satış için sade, hızlı ve takip edilebilir katalog.",
  reasons: [
    "Toptan satışa uygun ürün seçkisi",
    "Düzenli güncellenen dijital katalog",
    "Mağaza ve butiklere uygun hızlı ürün akışı",
    "Sipariş önizleme ile net talep oluşturma",
  ],
  featuredEyebrow: "Sezon Vitrini",
  featuredTitle: "Öne çıkan ürünler",
  featuredLinkLabel: "Tüm kataloğa geç",
  featuredLinkHref: "/katalog",
  featuredProductIds: [],
  featuredProducts: [
    {
      name: "Gold Kolye",
      category: "Sezon seçkisi",
      image: "/katalog/gold-necklace.png",
      href: "/katalog",
    },
    {
      name: "Rose Bileklik",
      category: "Yeni gelenler",
      image: "/katalog/rose-gold-bracelet.png",
      href: "/katalog",
    },
    {
      name: "İnci Küpe",
      category: "Vitrin ürünleri",
      image: "/katalog/pearl-earrings.png",
      href: "/katalog",
    },
  ],
  processEyebrow: "Toptan Alım Akışı",
  processTitle: "Sipariş talebini birkaç adımda netleştirin.",
  processSteps: [
    "Ürünleri seçin",
    "Sipariş önizlemesini oluşturun",
    "Ekibimiz sizinle iletişime geçsin",
  ],
  finalTitle: "Koleksiyonları keşfetmeye hazır mısınız?",
  finalBody:
    "Katalogdan ürünleri seçin, sipariş önizlemesini oluşturun ve talebinizi hızlıca iletin.",
  finalCtaLabel: "Kataloğa geç",
  finalCtaHref: "/katalog",
};

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const stringValue = (value: unknown, fallback: string) =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

const stringArray = (value: unknown, fallback: string[]) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : fallback;

function collectionsValue(
  value: unknown,
  fallback: MarketingHomeCollection[]
): MarketingHomeCollection[] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .filter(isPlainRecord)
    .map((item, index) => ({
      title: stringValue(item.title, fallback[index]?.title ?? ""),
      text: stringValue(item.text, fallback[index]?.text ?? ""),
      image: stringValue(item.image, fallback[index]?.image ?? ""),
      href: stringValue(item.href, fallback[index]?.href ?? "/katalog"),
    }))
    .filter((item) => item.title && item.image);

  return items.length ? items : fallback;
}

function productsValue(
  value: unknown,
  fallback: MarketingHomeProduct[]
): MarketingHomeProduct[] {
  if (!Array.isArray(value)) return fallback;

  const items = value
    .filter(isPlainRecord)
    .map((item, index) => ({
      name: stringValue(item.name, fallback[index]?.name ?? ""),
      category: stringValue(item.category, fallback[index]?.category ?? ""),
      image: stringValue(item.image, fallback[index]?.image ?? ""),
      href: stringValue(item.href, fallback[index]?.href ?? "/katalog"),
    }))
    .filter((item) => item.name && item.image);

  return items.length ? items : fallback;
}

export function normalizeMarketingHomeContent(
  value: unknown
): MarketingHomeContent {
  const data = isPlainRecord(value) ? value : {};
  const fallback = defaultMarketingHomeContent;

  return {
    logo: stringValue(data.logo, fallback.logo),
    eyebrow: stringValue(data.eyebrow, fallback.eyebrow),
    title: stringValue(data.title, fallback.title),
    body: stringValue(data.body, fallback.body),
    primaryCtaLabel: stringValue(data.primaryCtaLabel, fallback.primaryCtaLabel),
    primaryCtaHref: stringValue(data.primaryCtaHref, fallback.primaryCtaHref),
    secondaryCtaLabel: stringValue(
      data.secondaryCtaLabel,
      fallback.secondaryCtaLabel
    ),
    secondaryCtaHref: stringValue(data.secondaryCtaHref, fallback.secondaryCtaHref),
    heroImages: stringArray(data.heroImages, fallback.heroImages).slice(0, 3),
    collectionsEyebrow: stringValue(
      data.collectionsEyebrow,
      fallback.collectionsEyebrow
    ),
    collections: collectionsValue(data.collections, fallback.collections).slice(0, 4),
    reasonsEyebrow: stringValue(data.reasonsEyebrow, fallback.reasonsEyebrow),
    reasonsTitle: stringValue(data.reasonsTitle, fallback.reasonsTitle),
    reasons: stringArray(data.reasons, fallback.reasons).slice(0, 6),
    featuredEyebrow: stringValue(data.featuredEyebrow, fallback.featuredEyebrow),
    featuredTitle: stringValue(data.featuredTitle, fallback.featuredTitle),
    featuredLinkLabel: stringValue(
      data.featuredLinkLabel,
      fallback.featuredLinkLabel
    ),
    featuredLinkHref: stringValue(data.featuredLinkHref, fallback.featuredLinkHref),
    featuredProductIds: stringArray(
      data.featuredProductIds,
      fallback.featuredProductIds
    ).slice(0, 6),
    featuredProducts: productsValue(
      data.featuredProducts,
      fallback.featuredProducts
    ).slice(0, 6),
    processEyebrow: stringValue(data.processEyebrow, fallback.processEyebrow),
    processTitle: stringValue(data.processTitle, fallback.processTitle),
    processSteps: stringArray(data.processSteps, fallback.processSteps).slice(0, 5),
    finalTitle: stringValue(data.finalTitle, fallback.finalTitle),
    finalBody: stringValue(data.finalBody, fallback.finalBody),
    finalCtaLabel: stringValue(data.finalCtaLabel, fallback.finalCtaLabel),
    finalCtaHref: stringValue(data.finalCtaHref, fallback.finalCtaHref),
  };
}

export async function getMarketingHomeContent() {
  try {
    const snapshot = await getDoc(documentRef);
    return normalizeMarketingHomeContent(snapshot.exists() ? snapshot.data() : {});
  } catch (error) {
    console.error("Tanıtım ana sayfası içeriği okunamadı:", error);
    return defaultMarketingHomeContent;
  }
}

export async function updateMarketingHomeContent(content: MarketingHomeContent) {
  const normalized = normalizeMarketingHomeContent(content);
  await setDoc(
    documentRef,
    {
      ...normalized,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return normalized;
}
