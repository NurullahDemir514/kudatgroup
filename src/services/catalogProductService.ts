import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

const collectionName = "catalog_products";

export type AdminCatalogProduct = {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  imageSrc?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  description?: string;
  order: number;
  isActive: boolean;
};

export async function getAdminCatalogProducts(): Promise<AdminCatalogProduct[]> {
  const snapshot = await getDocs(query(collection(db, collectionName)));

  return snapshot.docs
    .map((document) => {
      const data = document.data() as Partial<AdminCatalogProduct>;

      return {
        id: document.id,
        name: data.name ?? "",
        code: data.code ?? "",
        categoryId: data.categoryId ?? "",
        imageSrc: data.imageSrc,
        price: typeof data.price === "number" ? data.price : 0,
        compareAtPrice:
          typeof data.compareAtPrice === "number" ? data.compareAtPrice : undefined,
        stock: typeof data.stock === "number" ? data.stock : 0,
        description: data.description,
        order: typeof data.order === "number" ? data.order : 0,
        isActive: data.isActive !== false,
      };
    })
    .sort((first, second) => first.order - second.order);
}

export async function createAdminCatalogProduct(
  product: Omit<AdminCatalogProduct, "id">
) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...product };
}

export async function updateAdminCatalogProduct(
  id: string,
  product: Partial<Omit<AdminCatalogProduct, "id">>
) {
  await updateDoc(doc(db, collectionName, id), {
    ...product,
    updatedAt: serverTimestamp(),
  });

  return { id, ...product };
}

export async function deleteAdminCatalogProduct(id: string) {
  await deleteDoc(doc(db, collectionName, id));
  return true;
}
