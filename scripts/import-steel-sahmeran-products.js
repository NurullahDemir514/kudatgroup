#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const sharp = require("sharp");
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const { initializeApp } = require("firebase/app");
const {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} = require("firebase/firestore");
const {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
} = require("firebase/storage");

const positionalArgs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const sourceDir =
  positionalArgs[0] || "/Users/onurdemir/Downloads/ÇELİK ŞAHMERAN - 125 TL ";
const outputRoot =
  positionalArgs[1] || path.join(process.cwd(), ".catalog-import", "celik-sahmeran");

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
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WFDP7PTFPV",
};

const category = {
  id: "celik-urunlerimiz-sahmeran",
  title: "ÇELİK ŞAHMERAN",
  slug: "celik-sahmeran",
  parentId: "celik-urunlerimiz",
  imageSrc: "/catalog/categories/category-01-steel-family.png",
  order: 5,
  isActive: true,
};

const productPrefix = "CL-SH";
const imagePrefix = "celik-sahmeran";
const storagePrefix = "catalog/products/celik-sahmeran";
const salePrice = 125;
const defaultStock = 10000;
const maxImageEdge = 1400;
const webpQuality = 82;

function toDocId(code) {
  return code.toLocaleLowerCase("en-US");
}

function withoutUndefined(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

async function writeWebp(inputPath, outputPath) {
  try {
    await sharp(inputPath, { failOn: "none" })
      .rotate()
      .resize({
        width: maxImageEdge,
        height: maxImageEdge,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: webpQuality, effort: 5 })
      .toFile(outputPath);
    return { fallback: false };
  } catch (error) {
    const tempPath = path.join(
      os.tmpdir(),
      `kudat-sahmeran-${Date.now()}-${Math.random().toString(16).slice(2)}.jpg`
    );

    try {
      execFileSync("sips", ["-s", "format", "jpeg", inputPath, "--out", tempPath], {
        stdio: "ignore",
      });
      await sharp(tempPath, { failOn: "none" })
        .rotate()
        .resize({
          width: maxImageEdge,
          height: maxImageEdge,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: webpQuality, effort: 5 })
        .toFile(outputPath);
      return { fallback: true };
    } catch {
      throw error;
    } finally {
      fs.rmSync(tempPath, { force: true });
    }
  }
}

function imageEntries() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Kaynak klasör bulunamadı: ${sourceDir}`);
  }

  return fs
    .readdirSync(sourceDir)
    .map((name) => ({ name, fullPath: path.join(sourceDir, name) }))
    .filter((entry) => {
      if (!fs.statSync(entry.fullPath).isFile()) return false;
      return /\.(heic|heif|jpe?g|png|webp)$/i.test(entry.name);
    })
    .sort((first, second) =>
      first.name.localeCompare(second.name, "tr-TR", { numeric: true })
    );
}

async function prepareProducts(entries) {
  const imagesDir = path.join(outputRoot, "images");
  fs.rmSync(outputRoot, { recursive: true, force: true });
  fs.mkdirSync(imagesDir, { recursive: true });

  const products = [];
  const failures = [];
  let fallbackConversions = 0;

  for (const [index, entry] of entries.entries()) {
    const sequence = index + 1;
    const padded = String(sequence).padStart(3, "0");
    const code = `${productPrefix}-${padded}`;
    const imageFileName = `${imagePrefix}-${padded}.webp`;
    const storagePath = `${storagePrefix}/${imageFileName}`;
    const outputPath = path.join(imagesDir, imageFileName);

    try {
      const result = await writeWebp(entry.fullPath, outputPath);
      if (result.fallback) fallbackConversions += 1;

      products.push({
        sourceFile: entry.name,
        name: `Çelik Şahmeran ${padded}`,
        code,
        categoryId: category.id,
        price: salePrice,
        stock: defaultStock,
        hideStock: true,
        imageFileName,
        storagePath,
        order: sequence,
        isActive: true,
      });
    } catch (error) {
      failures.push({
        sourceFile: entry.name,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    sourceDir,
    outputRoot,
    categoryId: category.id,
    image: {
      format: "webp",
      maxEdge: maxImageEdge,
      quality: webpQuality,
    },
    pricing: {
      salePrice,
      rule: "Tüm ürünlerde sabit 125 TL satış fiyatı",
    },
    products,
    failures,
    summary: {
      sourceFiles: entries.length,
      processed: products.length,
      failed: failures.length,
      fallbackConversions,
    },
  };

  fs.writeFileSync(
    path.join(outputRoot, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  return manifest;
}

async function uploadProducts(manifest) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);
  const imagesDir = path.join(outputRoot, "images");

  const parentSnapshot = await getDoc(doc(db, "catalog_categories", category.parentId));
  if (!parentSnapshot.exists()) {
    throw new Error(`Üst kategori bulunamadı: ${category.parentId}`);
  }

  await setDoc(
    doc(db, "catalog_categories", category.id),
    {
      ...category,
      productCount: manifest.products.length,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  for (const product of manifest.products) {
    const imagePath = path.join(imagesDir, product.imageFileName);
    const storageRef = ref(storage, product.storagePath);
    await uploadBytes(storageRef, fs.readFileSync(imagePath), {
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
        price: product.price,
        stock: product.stock,
        hideStock: product.hideStock,
        supplier: "Çelik şahmeran ithalat",
        sourceFile: product.sourceFile,
        order: product.order,
        isActive: product.isActive,
        updatedAt: serverTimestamp(),
        createdAt: productSnapshot.exists() ? undefined : serverTimestamp(),
      }),
      { merge: true }
    );

    console.log(`${product.order}/${manifest.products.length} ${product.code} yüklendi`);
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const entries = imageEntries();
  const manifest = await prepareProducts(entries);

  console.log(JSON.stringify(manifest.summary, null, 2));
  console.log(`Çıktı: ${outputRoot}`);

  if (manifest.failures.length) {
    throw new Error(`Bazı görseller dönüştürülemedi: ${manifest.failures.length}`);
  }

  if (dryRun) return;
  await uploadProducts(manifest);
}

main().catch((error) => {
  console.error("Çelik şahmeran import hatası:", error);
  process.exit(1);
});
