# DigitalOcean Droplet Deploy Rehberi

## Hızlı Başlangıç

### 1. SSH ile Droplet'e Bağlanın
```bash
ssh root@161.35.221.149
# veya
ssh root@ubuntu-s-1vcpu-1gb-fra1-01
```

### 2. Sistem Güncellemeleri
```bash
sudo apt update && sudo apt upgrade -y
```

### 3. Node.js Kurulumu (v20)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Versiyon kontrolü
node --version
npm --version
```

### 4. PM2 Kurulumu (Process Manager)
```bash
sudo npm install -g pm2
```

### 5. Nginx Kurulumu ve Yapılandırması
```bash
sudo apt install nginx -y

# Nginx yapılandırma dosyası oluştur
sudo nano /etc/nginx/sites-available/kudat
```

Aşağıdaki içeriği yapıştırın:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Domain'iniz yoksa IP kullanın veya _ bırakın

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Yapılandırmayı aktif edin:
```bash
sudo ln -s /etc/nginx/sites-available/kudat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Git Kurulumu
```bash
sudo apt install git -y
```

### 7. Projeyi Klonlayın
```bash
cd /var/www
sudo git clone https://github.com/NurullahDemir514/kudatgroup.git
cd kudatgroup
sudo npm install
```

### 8. Environment Variables (.env.production)
```bash
sudo nano .env.production
```

Aşağıdaki değişkenleri ekleyin:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters-long
NEXTAUTH_URL=http://161.35.221.149
# veya domain kullanıyorsanız:
# NEXTAUTH_URL=https://your-domain.com

WHATSAPP_API_KEY=your-whatsapp-api-key
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_BUSINESS_ACCOUNT_ID=your-business-account-id
WHATSAPP_TEST_NUMBER=your-test-phone-number
```

**Önemli:** `NEXTAUTH_SECRET` için güvenli bir anahtar oluşturun:
```bash
openssl rand -base64 32
```

### 9. Build ve Start
```bash
# Production build
sudo npm run build

# PM2 ile başlat
sudo pm2 start npm --name "kudat" -- start
sudo pm2 save
sudo pm2 startup
```

### 10. SSL Sertifikası (Let's Encrypt) - Opsiyonel
Domain kullanıyorsanız:
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Güncelleme İşlemi

Kod güncellemeleri için:
```bash
cd /var/www/kudatgroup
sudo git pull origin master
sudo npm install
sudo npm run build
sudo pm2 restart kudat
```

## PM2 Komutları

```bash
# Durum kontrolü
sudo pm2 status

# Logları görüntüle
sudo pm2 logs kudat

# Uygulamayı yeniden başlat
sudo pm2 restart kudat

# Uygulamayı durdur
sudo pm2 stop kudat

# Uygulamayı başlat
sudo pm2 start kudat
```

## Nginx Komutları

```bash
# Nginx durumunu kontrol et
sudo systemctl status nginx

# Nginx'i yeniden başlat
sudo systemctl restart nginx

# Nginx loglarını görüntüle
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Güvenlik Notları

1. **Firewall Yapılandırması:**
```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

2. **SSH Key Authentication:** Password yerine SSH key kullanın.

3. **MongoDB Atlas:** MongoDB Atlas kullanıyorsanız, DigitalOcean Droplet IP'sini whitelist'e ekleyin.

## Sorun Giderme

### Port 3000 Zaten Kullanılıyor
```bash
sudo lsof -i :3000
sudo kill -9 <PID>
```

### PM2 Uygulama Çalışmıyor
```bash
sudo pm2 logs kudat
sudo pm2 restart kudat
```

### Nginx 502 Bad Gateway
- PM2 uygulamasının çalıştığını kontrol edin: `sudo pm2 status`
- Port 3000'in dinlediğini kontrol edin: `sudo netstat -tulpn | grep 3000`

### Build Hatası
```bash
# Node modules'ü temizle ve yeniden yükle
sudo rm -rf node_modules package-lock.json
sudo npm install
sudo npm run build
```

## İlk Deploy Sonrası Kontrol

1. Tarayıcıdan `http://161.35.221.149` adresine gidin
2. Admin paneli: `http://161.35.221.149/admin`
3. PM2 loglarını kontrol edin: `sudo pm2 logs kudat`

