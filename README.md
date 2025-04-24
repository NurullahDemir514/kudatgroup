# Admin Paneli Projesi

Modern teknolojilerle geliştirilmiş güvenli bir admin paneli.

## Özellikler

- ✅ Güvenli giriş sistemi
- ✅ Rol tabanlı yetkilendirme
- ✅ Müşteri yönetimi
- ✅ Ürün yönetimi
- ✅ E-bülten abonelikleri
- ✅ Kampanya yönetimi
- ✅ MongoDB veritabanı entegrasyonu

## Teknolojiler

- **Frontend:** Next.js, React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Veritabanı:** MongoDB
- **Kimlik Doğrulama:** NextAuth.js, JWT
- **Form Yönetimi:** React Hook Form, Zod

## Kurulum

1. Projeyi klonla:
   ```bash
   git clone <proje-repo-adresi>
   cd bulten
   ```

2. Bağımlılıkları yükle:
   ```bash
   npm install
   ```

3. `.env.local` dosyasını oluştur:
   ```
   MONGODB_URI=mongodb+srv://xxxxx:xxxxx@cluster0.xxxx.mongodb.net/bulten
   NEXTAUTH_SECRET=gizli-anahtar-bulten-admin-panel
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Veritabanını başlangıç verileri ile doldur:
   ```bash
   # Uygulamayı başlat
   npm run dev
   
   # Tarayıcıdan seed API'sine erişerek veritabanını oluştur
   # http://localhost:3000/api/seed
   ```

5. Uygulamayı çalıştır:
   ```bash
   npm run dev
   ```

6. Tarayıcıda `http://localhost:3000/admin` adresine git.

## Giriş Bilgileri

- **Kullanıcı Adı:** admin
- **Şifre:** password123

## API Endpoints

- **GET /api/customers** - Tüm müşterileri listele
- **POST /api/customers** - Yeni müşteri ekle
- **GET /api/customers/[id]** - Belirli bir müşteriyi getir
- **PUT /api/customers/[id]** - Bir müşteriyi güncelle
- **DELETE /api/customers/[id]** - Bir müşteriyi sil

(Diğer API'ler de benzer şekilde yapılandırılmıştır)

## Lisans

MIT
