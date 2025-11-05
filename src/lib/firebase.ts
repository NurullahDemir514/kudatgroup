import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA",
  authDomain: "kudat-bulten-app.firebaseapp.com",
  projectId: "kudat-bulten-app",
  storageBucket: "kudat-bulten-app.firebasestorage.app",
  messagingSenderId: "469680851853",
  appId: "1:469680851853:web:a721ff06e06434d02c8bc4",
  measurementId: "G-WFDP7PTFPV"
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firestore veritabanını al
export const db = getFirestore(app);

export default app;
