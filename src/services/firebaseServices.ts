import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Yardımcı fonksiyon: Firestore Timestamp'leri string'e çevir
const formatFirestoreData = (data: any) => {
  const formatted: any = {};
  Object.keys(data).forEach(key => {
    if (data[key] && typeof data[key] === 'object' && data[key].toDate) {
      formatted[key] = data[key].toDate().toISOString();
    } else {
      formatted[key] = data[key];
    }
  });
  return formatted;
};

// Newsletter servisleri
export class NewsletterService {
  private collectionName = 'newsletters';

  async getAll(limitCount?: number) {
    try {
      const q = limitCount 
        ? query(collection(db, this.collectionName), limit(limitCount))
        : collection(db, this.collectionName);
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Newsletter getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...formatFirestoreData(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Newsletter getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Newsletter oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Newsletter güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Newsletter silme hatası:', error);
      throw error;
    }
  }

  async findByPhone(phone: string) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('phone', '==', phone)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Telefon ile arama hatası:', error);
      throw error;
    }
  }
}

// User servisleri
export class UserService {
  private collectionName = 'users';

  async findByUsername(username: string) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('username', '==', username)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('Kullanıcı arama hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Kullanıcı güncelleme hatası:', error);
      throw error;
    }
  }
}

// Product servisleri
export class ProductService {
  private collectionName = 'products';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Ürün getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...formatFirestoreData(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Ürün getirme hatası:', error);
      throw error;
    }
  }

  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      const categories = new Set();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category) {
          categories.add(data.category);
        }
      });
      
      return Array.from(categories);
    } catch (error) {
      console.error('Kategori getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Ürün oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      throw error;
    }
  }
}

// Customer servisleri
export class CustomerService {
  private collectionName = 'customers';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Müşteri getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Müşteri oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Müşteri güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Müşteri silme hatası:', error);
      throw error;
    }
  }
}

// Sale servisleri
export class SaleService {
  private collectionName = 'sales';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Satış getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Satış getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Satış oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Satış güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Satış silme hatası:', error);
      throw error;
    }
  }
}

// Campaign servisleri
export class CampaignService {
  private collectionName = 'campaigns';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Kampanya getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...formatFirestoreData(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Kampanya getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Kampanya oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Kampanya güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Kampanya silme hatası:', error);
      throw error;
    }
  }
}

// WhatsApp Template servisleri
export class WhatsAppTemplateService {
  private collectionName = 'whatsapp_templates';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Şablon getirme hatası:', error);
      throw error;
    }
  }

  async getById(id: string) {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { id: docSnap.id, ...formatFirestoreData(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Şablon getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Şablon oluşturma hatası:', error);
      throw error;
    }
  }

  async update(id: string, data: any) {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Şablon güncelleme hatası:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await deleteDoc(doc(db, this.collectionName, id));
      return true;
    } catch (error) {
      console.error('Şablon silme hatası:', error);
      throw error;
    }
  }
}

// WhatsApp Message servisleri
export class WhatsAppMessageService {
  private collectionName = 'whatsapp_messages';

  async getAll() {
    try {
      const snapshot = await getDocs(collection(db, this.collectionName));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...formatFirestoreData(doc.data())
      }));
    } catch (error) {
      console.error('Mesaj getirme hatası:', error);
      throw error;
    }
  }

  async create(data: any) {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...data,
        createdAt: Timestamp.now()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Mesaj oluşturma hatası:', error);
      throw error;
    }
  }
}

// Servis instance'ları
export const newsletterService = new NewsletterService();
export const userService = new UserService();
export const productService = new ProductService();
export const customerService = new CustomerService();
export const saleService = new SaleService();
export const campaignService = new CampaignService();
export const whatsappTemplateService = new WhatsAppTemplateService();
export const whatsappMessageService = new WhatsAppMessageService();
