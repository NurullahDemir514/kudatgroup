# Vercel Deploy Rehberi

## Vercel'e Deploy Etme

### Adım 1: Vercel Hesabı Oluşturma
1. [vercel.com](https://vercel.com) adresine gidin
2. "Sign Up" ile GitHub hesabınızla giriş yapın

### Adım 2: Projeyi İçe Aktarma
1. Vercel Dashboard'a gidin
2. **"Add New..."** → **"Project"** butonuna tıklayın
3. GitHub repository'nizi seçin: `NurullahDemir514/kudatgroup`
4. **"Import"** butonuna tıklayın

### Adım 3: Proje Ayarları
Vercel otomatik olarak Next.js'i algılayacak. Ayarları kontrol edin:

- **Framework Preset:** Next.js (otomatik algılanır)
- **Root Directory:** `./` (root)
- **Build Command:** `npm run build` (otomatik)
- **Output Directory:** `.next` (otomatik)
- **Install Command:** `npm install` (otomatik)

### Adım 4: Environment Variables Ekleme
**Settings** sekmesinde **Environment Variables** bölümüne gidin ve şunları ekleyin:

**Firebase Configuration (NEXT_PUBLIC_ prefix'i ile başlamalı):**
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBP50LFNn9xFJE7i9pszqCxniJrCw76aQA
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=kudat-bulten-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=kudat-bulten-app
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=kudat-bulten-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=469680851853
NEXT_PUBLIC_FIREBASE_APP_ID=1:469680851853:web:a721ff06e06434d02c8bc4
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WFDP7PTFPV
```

**NextAuth:**
```
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long
NEXTAUTH_URL=https://your-app.vercel.app
```

**WhatsApp API (Opsiyonel):**
```
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_TEST_NUMBER=your-test-phone-number
```

**Önemli Notlar:**
- `NEXTAUTH_URL` ilk deploy sonrası otomatik oluşan URL ile güncellenmelidir
- Her environment variable için **Production**, **Preview**, ve **Development** ortamlarını seçin

### Adım 5: Deploy
1. **"Deploy"** butonuna tıklayın
2. İlk deploy 2-5 dakika sürebilir
3. Deploy tamamlandıktan sonra URL'inizi alın (örn: `https://kudatgroup.vercel.app`)

### Adım 6: NEXTAUTH_URL'i Güncelleme
1. Deploy tamamlandıktan sonra gerçek URL'inizi alın
2. **Settings** → **Environment Variables** → `NEXTAUTH_URL`'i güncelleyin
3. **"Redeploy"** butonuna tıklayın

---

## Domain Bağlama

### Adım 1: Vercel'de Domain Ekleme
1. Projenizin **Settings** → **Domains** sekmesine gidin
2. Domain adresinizi girin (örn: `kudatgroup.com` veya `www.kudatgroup.com`)
3. **"Add"** butonuna tıklayın

### Adım 2: DNS Kayıtlarını Güncelleme
Vercel size DNS kayıtlarını gösterecek. Domain sağlayıcınızda (GoDaddy, Namecheap, vb.) şunları yapın:

#### A) Vercel'e Yönlendirme (Önerilen)
Domain sağlayıcınızın DNS ayarlarına gidin ve şu kayıtları ekleyin:

**CNAME Kaydı:**
- **Type:** CNAME
- **Name:** `www` (veya `@` eğer root domain için)
- **Value:** `cname.vercel-dns.com`

**Veya A Kaydı:**
- **Type:** A
- **Name:** `@` (root domain için)
- **Value:** `76.76.21.21` (Vercel'in IP adresi - güncel IP'yi Vercel'den kontrol edin)

#### B) Nameserver Değiştirme (Daha Kolay)
Domain sağlayıcınızda nameserver'ları değiştirin:
1. Domain sağlayıcınızın panelinde **Nameservers** bölümüne gidin
2. Vercel'in nameserver'larını ekleyin (Vercel size gösterecek):
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`

### Adım 3: SSL Sertifikası
Vercel otomatik olarak SSL sertifikası sağlar (Let's Encrypt). Domain eklendikten sonra otomatik olarak aktif olur (birkaç dakika sürebilir).

### Adım 4: Domain Doğrulama
1. DNS kayıtları eklendikten sonra 24-48 saat içinde domain aktif olur
2. Vercel Dashboard'da domain durumunu kontrol edebilirsiniz
3. **"Valid Configuration"** yazısı göründüğünde domain hazırdır

---

## Ortam Değişkenlerini Güncelleme

Domain bağlandıktan sonra `NEXTAUTH_URL`'i güncelleyin:

1. **Settings** → **Environment Variables**
2. `NEXTAUTH_URL`'i bulun ve düzenleyin
3. Değeri domain'inizle değiştirin: `https://yourdomain.com`
4. **"Save"** → **"Redeploy"**

---

## Güncelleme İşlemi

Kod güncellemeleri için:
1. GitHub'a push yapın: `git push origin master`
2. Vercel otomatik olarak yeni deploy başlatır
3. Preview deployment oluşturulur (test edebilirsiniz)
4. Production'a merge edildiğinde otomatik deploy olur

**Veya manuel deploy:**
1. Vercel Dashboard → **Deployments**
2. **"Redeploy"** butonuna tıklayın

---

## Vercel Avantajları

✅ **Otomatik SSL:** Let's Encrypt ile ücretsiz SSL
✅ **CDN:** Global CDN ile hızlı yükleme
✅ **Otomatik Deploy:** GitHub push sonrası otomatik deploy
✅ **Preview Deployments:** Her PR için preview URL
✅ **Analytics:** Ücretsiz analytics
✅ **Edge Functions:** Serverless fonksiyonlar
✅ **Kolay Domain Yönetimi:** Tek tıkla domain ekleme

---

## Sorun Giderme

### Build Hatası
- Vercel Dashboard → **Deployments** → Logları kontrol edin
- `next.config.mjs` dosyasını kontrol edin
- Environment variables'ların doğru olduğundan emin olun

### Domain Bağlanmıyor
- DNS kayıtlarının doğru olduğunu kontrol edin
- DNS propagation 24-48 saat sürebilir
- `dig yourdomain.com` komutu ile DNS kayıtlarını kontrol edin

### Environment Variables Çalışmıyor
- Variables'ların **Production** ortamında olduğundan emin olun
- Redeploy yapın
- Vercel Dashboard'da **Runtime Logs**'u kontrol edin

---

## DigitalOcean Droplet'i İptal Etme

1. [DigitalOcean Control Panel](https://cloud.digitalocean.com/) → **Droplets**
2. Droplet'inizi seçin: `ubuntu-s-1vcpu-1gb-fra1-01`
3. **"Destroy"** → **"Destroy Droplet"** butonuna tıklayın
4. Onaylayın

**Not:** Droplet'i iptal etmeden önce tüm önemli verilerinizi yedeklediğinizden emin olun.

---

## Maliyet Karşılaştırması

**Vercel:**
- Ücretsiz plan: Sınırsız bandwidth, 100GB bandwidth
- Pro plan: $20/ay (daha fazla özellik)
- Enterprise: Özel fiyatlandırma

**DigitalOcean Droplet:**
- $6-12/ay (1GB RAM)
- Ek bandwidth ücretleri olabilir

Vercel, Next.js projeleri için genellikle daha ekonomik ve kolaydır.

