#!/usr/bin/env node

const path = require("path");
require("dotenv").config({ path: path.join(process.cwd(), ".env.local") });

const { initializeApp } = require("firebase/app");
const {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} = require("firebase/firestore");
const { deleteObject, getStorage, ref } = require("firebase/storage");

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
};

const categoryId = "bijuteri-urunlerimiz-kupe";
const storagePrefix = "catalog/products/bijuteri-kupe/";
const dryRun = process.argv.includes("--dry-run");

async function main() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const snapshot = await getDocs(
    query(collection(db, "catalog_products"), where("categoryId", "==", categoryId))
  );

  const products = snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));

  const storagePaths = [
    ...new Set(
      products
        .map((product) => product.imagePath)
        .filter((imagePath) => typeof imagePath === "string")
        .filter((imagePath) => imagePath.startsWith(storagePrefix))
    ),
  ];

  console.log(
    JSON.stringify(
      {
        dryRun,
        categoryId,
        products: products.length,
        storageObjects: storagePaths.length,
      },
      null,
      2
    )
  );

  if (dryRun) return;

  let deletedProducts = 0;
  for (const product of products) {
    await deleteDoc(doc(db, "catalog_products", product.id));
    deletedProducts += 1;
    if (deletedProducts % 25 === 0 || deletedProducts === products.length) {
      console.log(`${deletedProducts}/${products.length} ürün silindi`);
    }
  }

  let deletedImages = 0;
  let missingImages = 0;
  for (const storagePath of storagePaths) {
    try {
      await deleteObject(ref(storage, storagePath));
      deletedImages += 1;
    } catch (error) {
      if (error?.code === "storage/object-not-found") {
        missingImages += 1;
      } else {
        throw error;
      }
    }

    if (
      (deletedImages + missingImages) % 25 === 0 ||
      deletedImages + missingImages === storagePaths.length
    ) {
      console.log(
        `${deletedImages + missingImages}/${storagePaths.length} görsel işlendi`
      );
    }
  }

  await updateDoc(doc(db, "catalog_categories", categoryId), {
    productCount: 0,
    updatedAt: serverTimestamp(),
  });

  console.log(
    JSON.stringify(
      {
        deletedProducts,
        deletedImages,
        missingImages,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error("Küpe ürünleri silinemedi:", error);
  process.exit(1);
});
