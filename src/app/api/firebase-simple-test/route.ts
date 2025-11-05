import { NextResponse } from 'next/server';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

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
const db = getFirestore(app);

export async function GET() {
    try {
        console.log('Firebase bağlantısı test ediliyor...');
        
        // Test verisi ekle
        const docRef = await addDoc(collection(db, 'test'), {
            message: 'Firebase test başarılı!',
            timestamp: new Date(),
            project: 'kudat-bulten-app'
        });
        
        console.log('Test dokümanı oluşturuldu:', docRef.id);
        
        // Test verilerini oku
        const querySnapshot = await getDocs(collection(db, 'test'));
        const docs = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        console.log('Test dokümanları:', docs);
        
        return NextResponse.json({
            success: true,
            message: 'Firebase bağlantısı başarılı!',
            data: {
                createdDocId: docRef.id,
                totalDocs: docs.length,
                docs: docs
            }
        });
        
    } catch (error: any) {
        console.error('Firebase test hatası:', error);
        return NextResponse.json(
            { 
                success: false, 
                error: error.message,
                code: error.code,
                details: error 
            },
            { status: 500 }
        );
    }
}
