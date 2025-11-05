# DigitalOcean App Platform Deploy Rehberi

## Yöntem 1: App Platform (Önerilen - En Kolay)

### Adım 1: GitHub Repository Hazırlığı
1. Projenizi GitHub'a push edin:
   ```bash
   git add .
   git commit -m "Deploy için hazır"
   git push origin main
   ```

### Adım 2: DigitalOcean App Platform'da Proje Oluşturma
1. [DigitalOcean Control Panel](https://cloud.digitalocean.com/apps)'e gidin
2. **"Create App"** butonuna tıklayın
3. **"GitHub"** seçeneğini seçin ve repository'nizi bağlayın
4. Branch seçin (genellikle `main` veya `master`)

### Adım 3: Build Ayarları
DigitalOcean otomatik olarak Next.js'i algılayacak, ancak ayarları kontrol edin:

- **Build Command**: `npm run build`
- **Run Command**: `npm start`
- **Source Directory**: `/` (root)

### Adım 4: Environment Variables (Ortam Değişkenleri)
App Platform'da **Settings > App-Level Environment Variables** bölümüne gidin ve şunları ekleyin:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-secret-key-here-minimum-32-characters
NEXTAUTH_URL=https://your-app-name.ondigitalocean.app
WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_TEST_NUMBER=your-test-phone-number
```

**Önemli Notlar:**
- `NEXTAUTH_URL` production URL'iniz olmalı (deploy sonrası otomatik oluşur)
- `NEXTAUTH_SECRET` en az 32 karakter olmalı (güvenli bir random string oluşturun)

### Adım 5: Deploy
1. **"Create Resources"** butonuna tıklayın
2. DigitalOcean otomatik olarak build başlatır
3. İlk deploy 5-10 dakika sürebilir

### Adım 6: Post-Deploy
Deploy tamamlandıktan sonra:
1. App URL'inizi alın (örn: `https://your-app.ondigitalocean.app`)
2. `NEXTAUTH_URL` environment variable'ını güncelleyin
3. **"Settings > Redeploy"** ile yeniden deploy edin

---

## Yöntem 2: Droplet (Manuel - Daha Fazla Kontrol)

### Adım 1: Droplet Oluşturma
1. DigitalOcean'da **Droplet** oluşturun (Ubuntu 22.04 önerilir)
2. En az 2GB RAM önerilir

### Adım 2: Server Kurulumu
SSH ile bağlanın ve şunları çalıştırın:

```bash
# Node.js kurulumu
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu (process manager)
sudo npm install -g pm2

# Nginx kurulumu
sudo apt update
sudo apt install nginx -y

# Git kurulumu
sudo apt install git -y
```

### Adım 3: Proje Klonlama
```bash
cd /var/www
sudo git clone https://github.com/yourusername/your-repo.git
cd your-repo
sudo npm install
```

### Adım 4: Environment Variables
`.env.production` dosyası oluşturun:
```bash
sudo nano .env.production
```

İçeriğini yapıştırın (yukarıdaki environment variables'ları)

### Adım 5: Build ve Start
```bash
sudo npm run build
sudo pm2 start npm --name "kudat" -- start
sudo pm2 save
sudo pm2 startup
```

### Adım 6: Nginx Yapılandırması
```bash
sudo nano /etc/nginx/sites-available/default
```

Şu içeriği ekleyin:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo nginx -t
sudo systemctl restart nginx
```

### Adım 7: SSL Sertifikası (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Önerilen Yöntem: App Platform

App Platform daha kolay, otomatik SSL, otomatik scaling ve daha az yönetim gerektirir.

## Gerekli Environment Variables Listesi

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth secret key (32+ karakter)
- `NEXTAUTH_URL` - Production URL
- `WHATSAPP_API_KEY` - WhatsApp Business API key (opsiyonel)
- `WHATSAPP_API_URL` - WhatsApp API URL (opsiyonel)
- `WHATSAPP_PHONE_NUMBER_ID` - WhatsApp phone number ID (opsiyonel)
- `WHATSAPP_BUSINESS_ACCOUNT_ID` - WhatsApp business account ID (opsiyonel)
- `WHATSAPP_TEST_NUMBER` - Test phone number (opsiyonel)

## Troubleshooting

### Build Hatası
- `next.config.mjs` dosyasını kontrol edin
- Node.js versiyonu 18+ olmalı

### MongoDB Bağlantı Hatası
- MongoDB Atlas'da IP whitelist'e DigitalOcean IP'lerini ekleyin (0.0.0.0/0 tüm IP'lere izin verir)

### Environment Variables Çalışmıyor
- App Platform'da Settings > Environment Variables'ı kontrol edin
- Değişikliklerden sonra yeniden deploy edin

