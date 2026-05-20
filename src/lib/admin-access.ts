import { createHash, randomBytes } from "crypto";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const settingsCollection = "admin_settings";
const accessDocument = "access";
const defaultAccessCode = process.env.ADMIN_ACCESS_CODE || "KUDAT-2018";

export type AdminAccessSettings = {
  codeHash: string;
  salt: string;
  updatedAt?: unknown;
};

const accessRef = doc(db, settingsCollection, accessDocument);

export function hashAdminCode(code: string, salt: string) {
  return createHash("sha256")
    .update(`${salt}:${code.trim()}`)
    .digest("hex");
}

function createSettings(code: string): AdminAccessSettings {
  const salt = randomBytes(16).toString("hex");

  return {
    salt,
    codeHash: hashAdminCode(code, salt),
  };
}

export async function getAdminAccessSettings() {
  const snapshot = await getDoc(accessRef);

  if (snapshot.exists()) {
    return snapshot.data() as AdminAccessSettings;
  }

  const initialSettings = createSettings(defaultAccessCode);

  await setDoc(accessRef, {
    ...initialSettings,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return initialSettings;
}

export async function verifyAdminCode(code: string) {
  const settings = await getAdminAccessSettings();
  const codeHash = hashAdminCode(code, settings.salt);

  return codeHash === settings.codeHash;
}

export async function updateAdminCode(nextCode: string) {
  const settings = createSettings(nextCode);

  await setDoc(
    accessRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
