import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "kudat-bulten-app.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "kudat-bulten-app",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "kudat-bulten-app.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "469680851853",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:469680851853:web:a721ff06e06434d02c8bc4",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-WFDP7PTFPV"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını al
export const db = getFirestore(app);

// Firebase Storage'ı al
export const storage = getStorage(app);

export default app;
