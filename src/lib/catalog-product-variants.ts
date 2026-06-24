import metalVariantCodes from "@/data/catalog-metal-variant-codes.json";

export type CatalogProductVariant = {
  id: string;
  name: string;
  code: string;
  colorHex: string;
};

export type CatalogProductVariantSource = {
  code: string;
  variantMode?: "auto" | "none" | "custom";
  variants?: CatalogProductVariant[];
};

const metalVariants: CatalogProductVariant[] = [
  { id: "gold", name: "Gold", code: "GLD", colorHex: "#D5A642" },
  { id: "silver", name: "Silver", code: "SLV", colorHex: "#C7CBD1" },
];

const stoneVariants: CatalogProductVariant[] = [
  { id: "black", name: "Siyah", code: "SYH", colorHex: "#111111" },
  { id: "white", name: "Beyaz", code: "BYZ", colorHex: "#E7E4DA" },
  {
    id: "mixed",
    name: "Karma",
    code: "KRM",
    colorHex:
      "linear-gradient(135deg,#00AEEF 0%,#7AC943 25%,#FFD23F 50%,#F15A24 75%,#D4145A 100%)",
  },
];

const metalProductCodes = new Set(metalVariantCodes);

const stoneProductCodes = new Set([
  "BJ-KP-002",
]);

export function variantsForCatalogProduct(product: CatalogProductVariantSource) {
  if (product.variantMode === "none") return [];
  if (product.variantMode === "custom") return product.variants ?? [];
  if (product.variants?.length) return product.variants;
  if (stoneProductCodes.has(product.code)) return stoneVariants;
  if (metalProductCodes.has(product.code)) return metalVariants;
  return [];
}
