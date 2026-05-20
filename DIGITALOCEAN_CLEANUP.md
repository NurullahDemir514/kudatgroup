# DigitalOcean Temizlik Rehberi

Vercel'e geçtiğiniz için DigitalOcean'daki kaynakları temizlemek için adımlar:

## 1. Droplet'i İptal Etme

### Adım 1: DigitalOcean Dashboard'a Giriş
1. [cloud.digitalocean.com](https://cloud.digitalocean.com) adresine gidin
2. Giriş yapın

### Adım 2: Droplet'i Silme
1. Sol menüden **"Droplets"** seçeneğine tıklayın
2. Mevcut Droplet'inizi bulun: `ubuntu-s-1vcpu-1gb-fra1-01`
3. Droplet'in yanındaki **"..."** (üç nokta) menüsüne tıklayın
4. **"Destroy"** seçeneğini seçin
5. Onay penceresinde Droplet adını yazın
6. **"Destroy Droplet"** butonuna tıklayın

⚠️ **UYARI:** Bu işlem geri alınamaz! Önemli verileriniz varsa önce yedekleyin.

### Adım 3: Floating IP'leri Silme (Varsa)
1. **"Networking"** → **"Floating IPs"** menüsüne gidin
2. Kullanılmayan Floating IP'ler varsa **"Destroy"** ile silin

## 2. Diğer Kaynakları Kontrol Etme

### Volumes (Block Storage)
1. **"Volumes"** menüsüne gidin
2. Kullanılmayan volume'ları **"Destroy"** ile silin

### Snapshots
1. **"Snapshots"** menüsüne gidin
2. Kullanılmayan snapshot'ları silin

### Load Balancers
1. **"Networking"** → **"Load Balancers"** menüsüne gidin
2. Kullanılmayan load balancer'ları silin

### Databases
1. **"Databases"** menüsüne gidin
2. Kullanılmayan database'leri silin (MongoDB kullanmıyorsanız)

### Spaces (Object Storage)
1. **"Spaces"** menüsüne gidin
2. Kullanılmayan space'leri silin

## 3. Faturalandırmayı Kontrol Etme

### Faturalandırma Ayarları
1. **"Settings"** → **"Billing"** menüsüne gidin
2. **"Payment Methods"** bölümünden ödeme yöntemini kontrol edin
3. Otomatik ödeme ayarlarını kontrol edin

### Kullanım Raporu
1. **"Billing"** → **"Usage"** menüsüne gidin
2. Mevcut kullanımı kontrol edin
3. Droplet silindikten sonra faturalandırmanın durduğunu doğrulayın

## 4. Proje Temizliği

### Proje Silme (Opsiyonel)
Eğer projeyi tamamen kullanmıyorsanız:
1. **"Projects"** menüsüne gidin
2. Projenizi seçin
3. **"Settings"** → **"Delete Project"**

**Not:** Proje silmeden önce tüm kaynakların silindiğinden emin olun.

## 5. E-posta Bildirimlerini Güncelleme

### Bildirim Ayarları
1. **"Settings"** → **"Notifications"** menüsüne gidin
2. Gereksiz bildirimleri kapatabilirsiniz
3. Önemli bildirimleri (faturalandırma vb.) açık tutun

## 6. Son Kontroller

✅ Droplet silindi mi?
✅ Floating IP'ler temizlendi mi?
✅ Kullanılmayan kaynaklar silindi mi?
✅ Faturalandırma durdu mu?
✅ Önemli veriler yedeklendi mi?

## Önemli Notlar

- **Droplet silindikten sonra:** 24-48 saat içinde faturalandırma durur
- **Yedekleme:** Önemli verilerinizi silmeden önce mutlaka yedekleyin
- **Faturalandırma:** Silinen kaynaklar için bir sonraki fatura döneminde ücretlendirilmezsiniz
- **Hesap Kapatma:** Hesabı tamamen kapatmak isterseniz, önce tüm kaynakları silin, sonra Support'a başvurun

## Destek

Sorun yaşarsanız:
- **Support:** DigitalOcean Dashboard → **"Support"** → **"Get Support"**
- **Documentation:** [docs.digitalocean.com](https://docs.digitalocean.com)

