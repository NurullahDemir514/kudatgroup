# www.kudatgroup.com DNS Kaydı Ekleme

## Sorun
DigitalOcean DNS panelinde sadece `kudatgroup.com` için A kaydı var, `www.kudatgroup.com` için kayıt yok.

## Çözüm

### DigitalOcean'da www Kaydı Ekleme

1. **DigitalOcean DNS paneline gidin:**
   - https://cloud.digitalocean.com/networking/domains/kudatgroup.com

2. **"Create a record" butonuna tıklayın**

3. **CNAME kaydı ekleyin:**
   - **Type:** CNAME
   - **Hostname:** `www`
   - **Value:** `@` (veya `kudatgroup.com`)
   - **TTL:** 3600 (veya varsayılan)
   - **Kaydet**

### Alternatif: A Kaydı (CNAME yerine)

Eğer CNAME çalışmazsa, A kaydı da ekleyebilirsiniz:
- **Type:** A
- **Hostname:** `www`
- **Value:** `161.35.221.149`
- **TTL:** 3600

## Önemli Not

DigitalOcean hesabınızda **$7.20 ödenmemiş bakiye** var. Bu DNS servisinin askıya alınmasına neden olabilir. Önce ödemeyi yapın.

## Test

Kayıt ekledikten sonra (birkaç dakika içinde):

```bash
dig www.kudatgroup.com A +short
```

Bu komut `161.35.221.149` döndürmeli.

