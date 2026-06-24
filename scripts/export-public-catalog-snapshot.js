const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const { initializeApp } = require("firebase/app");
const { collection, getDocs, getFirestore, query } = require("firebase/firestore");

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "kudat-bulten-app.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kudat-bulten-app",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "kudat-bulten-app.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "469680851853",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:469680851853:web:a721ff06e06434d02c8bc4",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WFDP7PTFPV",
};

const reservedCategoryDocumentIds = new Set(["marketing-home-content"]);

function cleanText(value) {
  return String(value ?? "").trim();
}

function leafHref(category) {
  return `/kategori/${encodeURIComponent(category)}`;
}

function buildCatalogTree(records) {
  const activeRecords = records
    .filter((record) => record.isActive !== false)
    .sort((first, second) => (first.order ?? 0) - (second.order ?? 0));

  const nodes = new Map();
  const roots = [];

  activeRecords.forEach((record) => {
    nodes.set(record.id, {
      id: record.id,
      title: record.title,
      description: record.description,
      imageSrc: record.imageSrc,
      productCount: record.productCount,
      href: record.href,
      children: [],
    });
  });

  activeRecords.forEach((record) => {
    const node = nodes.get(record.id);
    if (!node) return;

    const parent = record.parentId ? nodes.get(record.parentId) : null;
    if (parent) parent.children.push(node);
    else roots.push(node);
  });

  const normalize = (node) => {
    const children = node.children.map(normalize).filter(Boolean);
    const hasChildren = children.length > 0;

    return {
      ...node,
      href: hasChildren ? undefined : node.href ?? leafHref(node.title),
      children: hasChildren ? children : undefined,
    };
  };

  return roots.map(normalize);
}

function toCategoryRecord(document) {
  if (reservedCategoryDocumentIds.has(document.id)) return null;
  const data = document.data();
  const title = cleanText(data.title);
  if (!title) return null;

  return {
    id: document.id,
    title,
    slug: cleanText(data.slug) || document.id,
    parentId: data.parentId ?? null,
    description: cleanText(data.description) || undefined,
    imageSrc: cleanText(data.imageSrc) || undefined,
    productCount:
      typeof data.productCount === "number" ? data.productCount : undefined,
    href: cleanText(data.href) || undefined,
    order: typeof data.order === "number" ? data.order : 0,
    isActive: data.isActive !== false,
  };
}

function toProduct(document) {
  const data = document.data();
  return {
    id: document.id,
    name: cleanText(data.name),
    code: cleanText(data.code),
    categoryId: cleanText(data.categoryId),
    variants: Array.isArray(data.variants)
      ? data.variants
          .map((variant) => ({
            id: cleanText(variant.id),
            name: cleanText(variant.name),
            code: cleanText(variant.code),
            colorHex: cleanText(variant.colorHex),
          }))
          .filter(
            (variant) =>
              variant.id && variant.name && variant.code && variant.colorHex
          )
      : undefined,
    imageSrc: cleanText(data.imageSrc) || undefined,
    purchasePrice:
      typeof data.purchasePrice === "number" ? data.purchasePrice : undefined,
    price: typeof data.price === "number" ? data.price : 0,
    compareAtPrice:
      typeof data.compareAtPrice === "number" ? data.compareAtPrice : undefined,
    stock: typeof data.stock === "number" ? data.stock : 0,
    hideStock: data.hideStock === true,
    supplier: cleanText(data.supplier) || undefined,
    order: typeof data.order === "number" ? data.order : 0,
    isActive: data.isActive !== false,
  };
}

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [categorySnapshot, productSnapshot] = await Promise.all([
    getDocs(query(collection(db, "catalog_categories"))),
    getDocs(query(collection(db, "catalog_products"))),
  ]);

  const categories = categorySnapshot.docs
    .map(toCategoryRecord)
    .filter(Boolean)
    .sort((first, second) => first.order - second.order);

  const products = productSnapshot.docs
    .map(toProduct)
    .filter((product) => product.name && product.categoryId)
    .sort((first, second) => first.order - second.order);

  const productCounts = products.reduce((counts, product) => {
    if (product.isActive === false) return counts;
    counts[product.categoryId] = (counts[product.categoryId] ?? 0) + 1;
    return counts;
  }, {});

  const categoriesWithCounts = categories.map((category) => ({
    ...category,
    productCount: productCounts[category.id] ?? category.productCount ?? 0,
  }));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    categories: categoriesWithCounts,
    tree: buildCatalogTree(categoriesWithCounts),
    products,
  };

  const outputPath = path.join(
    process.cwd(),
    "src/data/public-catalog-snapshot.json"
  );
  fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);

  console.log(
    `Public katalog snapshot yazıldı: ${categories.length} kategori, ${products.length} ürün.`
  );
}

main().catch((error) => {
  console.error("Public katalog snapshot üretilemedi:", error);
  process.exit(1);
});
