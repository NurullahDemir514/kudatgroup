# Kudat yük testi ve hızlandırma notları

Bu doküman Kudat sitesinin çökme riskini ve temel performans eşiklerini düzenli ölçmek için kullanılır.

## Kurulum

Makinede k6 yoksa:

```bash
brew install k6
```

Yerel production testi için:

```bash
npm run build
npm run start
```

## Komutlar

Smoke test:

```bash
KUDAT_BASE_URL=http://localhost:3000 npm run load:smoke
```

Normal yük:

```bash
KUDAT_BASE_URL=http://localhost:3000 npm run load:normal
```

Stres:

```bash
KUDAT_BASE_URL=http://localhost:3000 npm run load:stress
```

Ani trafik:

```bash
KUDAT_BASE_URL=http://localhost:3000 npm run load:spike
```

Uzun süreli dayanıklılık:

```bash
KUDAT_BASE_URL=http://localhost:3000 npm run load:soak
```

Takip ekranı da ölçülecekse geçerli bir token ver:

```bash
KUDAT_BASE_URL=https://kudatgroup.com \
KUDAT_TRACKING_TOKEN=gecerli-token \
npm run load:normal
```

## Yazma endpoint'leri

Sipariş oluşturan veya müşteri kararı yazan endpoint'ler varsayılan olarak kapalıdır. Canlı veriyi kirletmemek için yalnızca kontrollü test ortamında açılmalıdır:

```bash
KUDAT_BASE_URL=http://localhost:3000 \
KUDAT_ENABLE_WRITE_TESTS=true \
KUDAT_TEST_ORDER_ID=load-test-001 \
npm run load:smoke
```

## Başarı eşikleri

- Genel hata oranı `%1` altında kalmalı.
- Genel p95 yanıt süresi `1500 ms` altında kalmalı.
- Katalog API p95 yanıt süresi `800 ms` altında kalmalı.
- Takip API p95 yanıt süresi `1500 ms` altında kalmalı.
- Normal yükte `429`, `500` ve timeout görülmemeli.

## Canlı ortam uyarısı

Canlı sitede doğrudan stres veya spike testi yapma. Önce preview veya yerel production build üzerinde çalıştır. Canlıda sadece kısa smoke test ile başla; aksi durumda Vercel, Firebase veya Qanta servislerinde limit ve maliyet oluşabilir.
