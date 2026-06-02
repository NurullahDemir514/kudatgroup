#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { initializeApp } = require("firebase/app");
const {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} = require("firebase/firestore");
const {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} = require("firebase/storage");

const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "kudat-bulten-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kudat-bulten-app",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "kudat-bulten-app.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "469680851853",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:469680851853:web:a721ff06e06434d02c8bc4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WFDP7PTFPV",
};

const args = new Map();
for (let index = 2; index < process.argv.length; index += 1) {
  const [key, value] = process.argv[index].split("=");
  args.set(key.replace(/^--/, ""), value ?? "true");
}

const importRoot =
  args.get("root") || path.join(process.cwd(), ".catalog-import", "bijuteri-kupe");
const limit = Number(args.get("limit") || 0);
const dryRun = args.get("dry-run") === "true";
const manifestPath = path.join(importRoot, "manifest.json");
const imagesDir = path.join(importRoot, "images");

const withoutUndefined = (value) =>
  Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );

const toDocId = (code) => code.toLocaleLowerCase("en-US");

async function assertCategoryExists(db, categoryId) {
  const snapshot = await getDoc(doc(db, "catalog_categories", categoryId));
  if (!snapshot.exists()) {
    throw new Error(`Kategori bulunamadı: ${categoryId}`);
  }
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Manifest bulunamadı: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const products = manifest.products
    .filter((product) => product.purchasePrice !== null && product.price !== null)
    .slice(0, limit > 0 ? limit : undefined);

  if (!products.length) {
    throw new Error("İçe aktarılacak ürün bulunamadı");
  }

  const app = initializeApp(firebaseConfig);
  const { getFirestore } = require("firebase/firestore");
  const db = getFirestore(app);
  const storage = getStorage(app);

  await assertCategoryExists(db, manifest.categoryId);

  const results = [];
  for (const product of products) {
    const imagePath = path.join(imagesDir, product.imageFileName);
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Görsel bulunamadı: ${imagePath}`);
    }

    if (dryRun) {
      results.push({ code: product.code, status: "dry-run" });
      continue;
    }

    const storageRef = ref(storage, product.storagePath);
    const imageBytes = fs.readFileSync(imagePath);
    await uploadBytes(storageRef, imageBytes, {
      contentType: "image/webp",
      customMetadata: {
        sourceFile: product.sourceFile,
        code: product.code,
      },
    });
    const imageSrc = await getDownloadURL(storageRef);
    const productRef = doc(db, "catalog_products", toDocId(product.code));
    const productSnapshot = await getDoc(productRef);

    await setDoc(
      productRef,
      withoutUndefined({
        name: product.name,
        code: product.code,
        categoryId: product.categoryId,
        imageSrc,
        imagePath: product.storagePath,
        purchasePrice: product.purchasePrice,
        price: product.price,
        priceOffset: product.priceOffset,
        stock: product.stock,
        hideStock: product.hideStock === true,
        supplier: "Küpe ithalat",
        sourceFile: product.sourceFile,
        order: product.order,
        isActive: product.isActive !== false,
        updatedAt: serverTimestamp(),
        createdAt: productSnapshot.exists() ? undefined : serverTimestamp(),
      }),
      { merge: true }
    );

    results.push({ code: product.code, status: "uploaded", imagePath: product.storagePath });
    console.log(`${results.length}/${products.length} ${product.code} yüklendi`);
  }

  console.log(
    JSON.stringify(
      {
        dryRun,
        requested: products.length,
        uploaded: results.filter((result) => result.status === "uploaded").length,
        categoryId: manifest.categoryId,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Katalog import hatası:", error);
  process.exit(1);
});
