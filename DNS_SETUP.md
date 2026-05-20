# DNS Yapılandırma Kontrol Listesi

## DigitalOcean DNS Panel Kontrolü

1. **DigitalOcean Dashboard'a giriş yapın:**
   - https://cloud.digitalocean.com/networking/domains

2. **Domain'in kayıtlı olduğundan emin olun:**
   - `kudatgroup.com` domain'inin DigitalOcean'da kayıtlı olması gerekiyor
   - Eğer yoksa, "Add a domain" butonuna tıklayıp domain'i ekleyin

3. **A Kayıtlarını Kontrol Edin:**
   - `kudatgroup.com` için A kaydı:
     - Type: A
     - Hostname: @ (veya boş)
     - Value: 161.35.221.149
     - TTL: 3600 (veya daha düşük, örn: 300)
   
   - `www.kudatgroup.com` için CNAME kaydı:
     - Type: CNAME
     - Hostname: www
     - Value: @ (veya kudatgroup.com)
     - TTL: 3600

4. **Name Server'ları Kontrol Edin:**
   - DigitalOcean'da domain için name server'lar şöyle olmalı:
     - ns1.digitalocean.com
     - ns2.digitalocean.com
     - ns3.digitalocean.com

## GoDaddy'de Name Server Ayarları

1. **GoDaddy'ye giriş yapın:**
   - https://www.godaddy.com/tr-tr

2. **Domain yönetimine gidin:**
   - "My Products" → "Domains" → `kudatgroup.com` → "DNS" veya "Manage DNS"

3. **Name Server'ları değiştirin:**
   - "Name Servers" bölümüne gidin
   - "Change" veya "Custom" seçeneğini seçin
   - Şu name server'ları ekleyin:
     - ns1.digitalocean.com
     - ns2.digitalocean.com
     - ns3.digitalocean.com
   - Kaydedin

## Hızlı Test

Terminal'de şu komutları çalıştırın:

```bash
# DNS kayıtlarını kontrol et
dig kudatgroup.com A +short
dig www.kudatgroup.com A +short

# Name server'ları kontrol et
dig kudatgroup.com NS +short
```

## DNS Cache Temizleme

### Windows:
```cmd
ipconfig /flushdns
```

### Mac:
```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Chrome:
- Chrome'u tamamen kapatın
- Veya `chrome://net-internals/#dns` adresine gidip "Clear host cache" butonuna tıklayın

## Geçici Çözüm

Eğer DNS hala çalışmıyorsa, geçici olarak IP adresiyle erişebilirsiniz:
- http://161.35.221.149

## Not

DNS değişikliklerinin yayılması 24-48 saat sürebilir, ancak genellikle birkaç saat içinde çalışmaya başlar.

