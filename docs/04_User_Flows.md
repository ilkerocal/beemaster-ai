# BeeMaster AI — Kullanıcı Akışları (User Flows) v1.0

> **Amaç:** Kullanıcının uygulamadaki ana görevlerini adım adım, ekran bazlı, hata durumları ve kenar senaryalarıyla tanımlamak. Tasarım ve geliştirme ekipleri bu akışları referans alarak UI/UX ve backend'i inşa eder.

---

## 1. Akış Haritası (Flow Map)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BEEMASTER AI — ANA AKIŞLAR                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │  ONBOARDING  │───▶│  ANA SAYFA   │───▶│  ARı ÜSSÜ    │───▶│  KOVAN   │  │
│  │   AKIŞI      │    │  (DASHBOARD) │    │  YÖNETİMİ    │    │  DETAY   │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │  Kayıt/Giriş │    │  Özet Kartlar│    │  Liste/Harita│    │  Çerçeve │  │
│  │  Profil      │    │  Uyarılar    │    │  Yeni Üs     │    │  Haritası│  │
│  │  Bölge Seçimi│    │  Hızlı Aksiyon│   │  Mikroiklim  │    │  Petek   │  │
│  │  İzinler     │    │  Hava/Flora  │    │  Taşıma Planı│    │  Döngüsü │  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│                                                           │       │       │
│                           ┌───────────────────────────────┼───────┼───────┘
│                           ▼                               ▼       ▼
│                  ┌─────────────────┐            ┌──────────────┐ ┌────────┐
│                  │   MUAYENE       │            │   HASAT      │ │ BESLEME│
│                  │   SİHİRBAZI     │            │   GİRİŞİ     │ │ TAKVİMİ│
│                  └─────────────────┘            └──────────────┘ └────────┘
│                           │                               │       │
│                           ▼                               ▼       ▼
│                  ┌─────────────────┐            ┌──────────────┐ ┌────────┐
│                  │   AI ANALİZİ    │            │   VERİM      │ │ STOK   │
│                  │   ANOMALİ/ÖNERİ │            │   RAPORU     │ │ UYARI  │
│                  └─────────────────┘            └──────────────┘ └────────┘
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │   ANA ARı    │    │  HASTALIK/   │    │  ENVANTER    │    │  ANALİTİK│  │
│  │   YÖNETİMİ   │    │  VARROA      │    │  YÖNETİMİ    │    │  RAPORLAR│  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Onboarding Akışı (First-Time User Experience)

### 2.1 Akış Diyagramı

```
START
  │
  ▼
┌─────────────────┐
│ Splash / Logo   │ (2s, animaasyon)
│ "Arıcılık Bilimi,│
│  Yapay Zeka ile │
│  Buluşuyor"     │
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Hoş Geldin      │ ──▶ "Hemen Başla" (CTA)
│ 3 Özellik Kartı │     1. Akıllı Muayene
│ • Offline Çalışır│     2. Petek Döngüsü
│ • AI Danışman   │     3. Bölge Takvimi
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Kayıt / Giriş   │ ──▶ Email + Şifre
│                 │     Magic Link
│                 │     Google / Apple
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Profil Bilgileri│ ──▶ İsim, Telefon (opsiyonel)
│                 │     Profil foto (opsiyonel)
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ Bölge Seçimi    │ ──▶ İl/İlçe seçimi (Harita veya Liste)
│ (Kritikal!)     │     "Eğil, Diyarbakır" varsayılan
│                 │     Flora/iklim verisi yüklenir
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ İzinler         │ ──▶ Mikrofon (sesli muayene)
│                 │     Kamera (fotoğraf)
│                 │     Konum (harita, hava)
│                 │     Bildirim (hatırlatmalar)
│                 │     Depolama (offline DB)
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ İlk Arı Üssü    │ ──▶ "İlk Arı Üssümü Oluştur"
│ Oluşturma       │     İsim, Konum (harita), Yükseklik
│                 │     NFC etiket yazdırma (opsiyonel)
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ İlk Kovan       │ ──▶ İsim, İrk (Anadolu/Kafkas/Karnika),
│ Ekleme          │     Kutu tipi, Çerçeve sayısı
│                 │     Ana arı bilgisi (varsa)
└─────────────────┘
  │
  ▼
┌─────────────────┐
│ İlk Muayene     │ ──▶ "Şimdi İlk Muayeneyi Yap"
│ Rehberi         │     3 adım: Ses → Form → Foto
│ (İnteraktif)    │     AI analizi göster
└─────────────────┘
  │
  ▼
DASHBOARD ──▶ "Hazırsın! İlk muayenen kaydedildi."
```

### 2.2 Ekran Detayları

| Ekran | Bileşenler | Doğrulama | Hata Durumları |
|-------|------------|-----------|----------------|
| **Splash** | Logo, slogan, yükleme çubuğu | - | Uygulama yüklenemez → Offline sayfası |
| **Hoş Geldin** | 3 özellik kartı, "Hemen Başla" butonu | - | - |
| **Kayıt/Giriş** | Email input, şifre, Magic Link butonu, OAuth butonları | Email format, şifre min 8 karakter | Geçersiz email, zaten kayıtlı, ağ hatası |
| **Profil** | İsim input, telefon (masked), avatar yükleme | İsim zorunlu, 2-50 karakter | Resim boyutu > 5MB, format desteklenmiyor |
| **Bölge Seçimi** | Harita (Leaflet/MapLibre) + Liste, arama, "Konumumu Kullan" | En az ilçe seviyesinde seçim | Konum izni reddedildi → manuel seçim zorunlu |
| **İzinler** | 5 izin kartı, açıklama, "İzin Ver" / "Sonra" | Mikrofon + Kamera + Depolama = zorunlu | İzin reddedildi → ayarlardan açma rehberi göster |
| **İlk Arı Üssü** | İsim, harita pin, yükseklik, not | İsim zorunlu, konum pin zorunlu | GPS hassasiyeti düşük → manuel düzeltme |
| **İlk Kovan** | İsim, ırk dropdown, kutu tipi, çerçeve sayısı, NFC yaz | İsim zorunlu, çerçeve 1-20 arası | NFC etiketi zaten kullanımda |
| **İlk Muayene Rehberi** | 3 sekme: Ses / Form / Foto, ilerleme çubuğu, "Tamamla" | En az 1 yöntemle veri girilmeli | Ses çok kısa (< 3sn), fotoğraf bulanık |

### 2.3 Kenar Senaryoları

| Senaryo | Davranış |
|---------|----------|
| Kullanıcı onboarding'i yarıda bırakır | LocalStorage'da `onboarding_step` saklanır, tekrar açıldığında kaldığı yerden devam |
| İnternet yok, kayıt yapılamıyor | Offline mod: lokal kullanıcı oluşturulur, senkron kuyruğa alınır |
| Bölge verisi yüklenemez | Varsayılan (genel Türkiye) flora takvimi kullanılır, banner ile uyarılır |
| NFC etiketi yazılamaz | Manuel QR kod gösterilir, "Sonra Yazdır" opsiyonu |

---

## 3. Ana Sayfa (Dashboard) Akışı

### 3.1 Kullanıcı Hikayesi
> "Arıcı olarak uygulamayı açtığımda, kovanlarımın genel durumunu, acil uyarıları, hava durumunu ve bugün ne yapmam gereğini tek bakışta görmek istiyorum."

### 3.2 Akış

```
DASHBOARD YÜKLENİR
  │
  ▼
┌─────────────────────────────────────┐
│ VERİ ÇEKME (Paralel)                │
│ ├─ Kovan özetleri (IndexedDB)       │
│ ├─ Aktif uyarılar (AI + Kurallar)   │
│ ├─ Hava durumu (Cache + API)        │
│ ├─ Flora takvimi (Bugün + 7 gün)    │
│ └─ Son aktiviteler                  │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ RENDER (Skeleton → İçerik)          │
│                                     │
│ 1. ÜST BAR                          │
│    ├─ Arı üssü seçici (dropdown)    │
│    ├─ Senkron durumu (ikon)         │
│    └─ Bildirim zili (badge)         │
│                                     │
│ 2. ÖZET KARTLAR (Grid 2x2)          │
│    ├─ Toplam Kovan: XX              │
│    ├─ Aktif Uyarı: X (Kırmızı/Sarı) │
│    ├─ Bu Ay Hasat: XX kg            │
│    └─ Bu Ay Tedavi: X kovan         │
│                                     │
│ 3. ACİL UYARILAR (Maks 3)           │
│    • "Kovan-12: Varroa 15 (Yüksek!)│
│    • "Kovan-05: Ana arı yok 3 gündür"│
│    • "Eğil'de öğün 30°C - Besleme"  │
│                                     │
│ 4. HIZLI AKSİYONLAR (Chips)         │
│    [+ Muayene] [+ Hasat] [+ Besleme]│
│    [+ Tedavi] [+ Envanter]          │
│                                     │
│ 5. HAVA + FLORA WIDGET              │
│    Bugün: 28°C, %45 nem, Güneşli    │
│    Bu Hafta: Geven %80, Kekik %20   │
│                                     │
│ 6. SON MUAYENELER (Son 5)           │
│    Kart listesi → "Tümünü Gör"      │
│                                     │
│ 7. ALT NAV: Dashboard (aktif)       │
└─────────────────────────────────────┘
```

### 3.3 Etkileşimler

| Eylem | Sonuç |
|-------|-------|
| Arı üssü değiştir | Tüm veriler o üssüne filtrelenir, URL güncellenir (`?apiary=uuid`) |
| Uyarı kartına tıkla | İlgili kovan detay sayfasına / muayene modalına gider |
| Hızlı aksiyon butonu | İlgili wizard açılır (Muayene/Hasat/Besleme/Tedavi/Envanter) |
| Hava widget'ına tıkla | Detaylı 7 günlük hava + flora sayfası |
| "Tümünü Gör" (Muayeneler) | Muayeneler sayfası (`/inspections`) |
| Pull-to-refresh | Senkron tetiklenir, veri güncellenir |
| Alt nav "Arı Üssleri" | Apiary liste sayfası |

### 3.4 Boş Durum (İlk Kullanım)

```
┌─────────────────────────────────────┐
│          🎉 Hoş Geldin!             │
│                                     │
│  Henüz kovan eklemediniz.           │
│  İlk arı üssünüzü ve kovanınızı     │
│  oluşturarak başlayın.              │
│                                     │
│  [+ İlk Arı Üssünü Oluştur]         │
│  [Örnek Veriyle Deneme]             │
└─────────────────────────────────────┘
```

---

## 4. Arı Üssü Yönetimi (Apiary Management)

### 4.1 Kullanıcı Hikayeleri

| Hikaye | Kabul Kriterleri |
|--------|------------------|
| Yeni arı üssü oluşturmak | İsim, konum (harita), yükseklik, mikroiklim notu → Listeye eklenir |
| Arı üssünü haritada görmek | Tüm üssler pin olarak, aktif üss vurgulu |
| Üssler arası taşıma planı | Seçili kovanlar için rota, mesafe, süre hesaplanır |
| Üss detayını görmek | Kovan listesi, ortalama güç, toplam hasat, uyarılar |

### 4.2 Akış: Yeni Arı Üssü Oluşturma

```
[Dashboard] ──▶ [Arı Üssleri] ──▶ [+ Yeni Üs] (FAB)
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 1: Temel Bilgiler              │
│ ├─ İsim * (örn: "Eğil Yaylası")     │
│ ├─ Açıklama                         │
│ └─ [İleri]                          │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 2: Konum (Harita)              │
│ ├─ Harita tam ekran (Leaflet)       │
│ ├─ Pin sürükle/bırak                │
│ ├─ "Konumumu Kullan" butonu         │
│ ├─ Adres otomatik (Reverse Geocode) │
│ ├─ Yükseklik (m) otomatik (DEM)     │
│ └─ [İleri]                          │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 3: Mikroiklim (Opsiyonel)      │
│ ├─ Yön (Kuzey/Güney/Doğu/Batı)      │
│ ├─ Eğim (%)                         │
│ ├─ Rüzgar maruziyeti (Düşük/Orta/Yüksek)│
│ ├─ Su kaynağı mesafesi (m)          │
│ ├─ Gölge oranı (%)                  │
│ └─ [Oluştur]                        │
└─────────────────────────────────────┘
  │
  ▼
BAŞARILI → Listeye eklenir, toast "Arı üssü oluşturuldu"
  │
  ▼
[Arı Üssü Detay Sayfası] ──▶ "İlk Kovanı Ekle" CTA
```

### 4.3 Akış: Arı Üssü Listesi / Harita

```
[Arı Üssleri Sekmesi]
  │
  ├─ SEG: [Liste] [Harita] (Default: Liste)
  │
  ├─ LİSTE GÖRÜNÜMÜ
  │   ├─ Arama/filtre (İsim, İl, Durum)
  │   ├─ Kart: İsim, Konum, Kovan Sayısı, Son Aktivite
  │   ├─ Swipe actions: Düzenle, Sil, Paylaş
  │   └─ Pull-to-refresh + Sonsuz kaydırma
  │
  └─ HARİTA GÖRÜNÜMÜ
      ├─ Clustering (çoklu pin birleşir)
      ├─ Aktif üss: Pembe/Gold pin, diğerler: Gri
      ├─ Pin tıkla → Bottom sheet: Özet + "Git" + "Kovanlar"
      └─ Konum butonu: Kullanıcının konumuna git
```

### 4.4 Akış: Kovan Taşıma Planlayıcı

```
[Arı Üssü Detay] ──▶ [Taşıma Planla] (3 nokta menü)
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 1: Hedef Üss Seç               │
│ ├─ Diğer üssler listesi (mesafe ile)│
│ ├─ Harita üzerinde seç              │
│ └─ [İleri]                          │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 2: Kovanları Seç               │
│ ├─ Kaynak üstteki kovanlar (checkbox)│
│ ├─ "Tümünü Seç" / "Güçlü Olanlar"   │
│ ├─ Seçili: X kovan, ~Y kg           │
│ └─ [İleri]                          │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 3: Plan Özeti                  │
│ ├─ Mesafe: X km                     │
│ ├─ Süre: Y saat (gece önerilir)     │
│ ├─ Rota (Harita)                    │
│ ├─ Kontrol listesi:                 │
│ │  □ Giriş kapakları kilitli        │
│ │  □ Hava 15-20°C arası             │
│ │  □ Yolda besin/yakıt var          │
│ │  □ Araç uygun                     │
│ └─ [Planı Kaydet] [Paylaş]          │
└─────────────────────────────────────┘
```

---

## 5. Kovan Detay ve Çerçeve Haritası

### 5.1 Kullanıcı Hikayesi
> "Bir kovanı açtığımda, o kovanın tüm geçmişini, çerçeve haritasını (hangi çerçeve ne tip, kaç döngü yaptı), ana arı bilgilerini ve hızlı muayene başlatabilmeyi istiyorum."

### 5.2 Kovan Detay Sayfası Yapısı

```
[KOVAN DETAY] — /hives/:id
  │
  ├─ HEADER (Sticky)
  │   ├─ Geri, Kovan Adı, Durum Badge, 3-nokta menü
  │   └─ NFC/QR ikonu → "Etiketi Tara / Yazdır"
  │
  ├─ ÖZET KARTLAR (Scrollable row)
  │   ├─ Güç: [●●●○○] Orta
  │   ├─ İrk: Anadolu Arısı
  │   ├─ Ana Arı: 2024, Yeşil, Aktif
  │   ├─ Çerçeve: 10 (4B/3H/2P/1E)
  │   └─ Son Muayene: 3 gün önce
  │
  ├─ SEKMELER (Tabs)
  │   ├─ [Genel] [Çerçeveler] [Geçmiş] [Analitik]
  │
  ├─ GENEL SEKME
  │   ├─ Temel Bilgiler kartı
  │   ├─ Ana Arı kartı (Pedigree, Performans)
  │   ├─ Hızlı Aksiyonlar: [Muayene] [Hasat] [Besleme] [Tedavi]
  │   └─ Notlar
  │
  ├─ ÇERÇEVE SEKMESİ (Petek Haritası) — ANA ÖZELLİK
  │   ├─ Görsel ızgara: 10 çerçeve (kutu tipine göre)
  │   ├─ Her çerçeve: Tip ikonu + Döngü sayısı + Yaş
  │   ├─ Renk kodlama: Bal=Sarı, Yumurtalık=Turuncu, Polen=Portakal, Perga=Gri, Boş=Koyu
  │   ├─ Tıklama → Çerçeve detay modalı (Tip değiştir, Not ekle, Döngü artır)
  │   ├─ Alt bar: Toplam / Tip dağılımı (FrameCounter chips)
  │   └─ "Tümünü Bal Olarak İşaretle" / "Yeni Sezon Sıfırla"
  │
  ├─ GEÇMİŞ SEKMESİ
  │   ├─ Zaman çizelgesi: Muayene, Hasat, Besleme, Tedavi, Ana Arı Değişimi
  │   ├─ Filtre: [Tümü] [Muayene] [Hasat] [Tedavi] [Diğer]
  │   └─ Her öğe tıklanabilir → Detay
  │
  └─ ANALİTİK SEKMESİ
      ├─ Güç trendi (çizgi grafik)
      ├─ Varroa trendi
      ├─ Hasat verimi (yıllık)
      └─ Besleme maliyet/gelir özeti
```

### 5.3 Çerçeve Detay Modalı

```
┌─────────────────────────────────────┐
│ Çerçeve #3 — Detay                  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [BAL]       Döngü: 3       │    │  ← Büyük tip badge
│  │  Perga Yaşı: 14 ay          │    │
│  │  Son Bal Alımı: 15 Tem 2024 │    │
│  │  Temizlik: 20 Ara 2024      │    │
│  └─────────────────────────────┘    │
│                                     │
│  Tip Değiştir:                      │
│  [Yumurtalık] [Bal] [Polen] [Perga] [Boş]  ← Chip group
│                                     │
│  Perga Tipi: [Mum] [Plastik] [Pergasız]   │
│                                     │
│  Not: [________________________]    │
│                                     │
│  [İptal]          [Kaydet]          │
└─────────────────────────────────────┘
```

### 5.4 Hızlı Muayene Girişi (Kovan Detaydan)

```
[Kovan Detay] ──▶ [Muayene Yap] (Primary Button)
  │
  ▼
MUAYENE SİHİRBAZI (Bkz. Bölüm 6)
  │
  ▼
TAMAMLANDI → Kovan detayına dön, "Son muayene" güncellenir, toast
```

---

## 6. Muayene Sihirbazı (Inspection Wizard) — CORE FLOW

### 6.1 Kullanıcı Hikayesi
> "Petek başındayken, eldivenli parmaklarımla, 60 saniyede muayene kaydetmek istiyorum. Sesli not alayım, fotoğraf çekeyim, AI bana anomali ve öneri versin."

### 6.2 Akış Diyagramı

```
[MUAYENE BAŞLAT] (Herhangi bir yerden)
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 1: KOVAN SEÇİMİ (Eğer belirsiz)│
│ ├─ Mevcut kovan varsa atlanır       │
│ ├─ Liste: Arama + Son kullanılanlar │
│ ├─ NFC Tara → Otomatik seçim        │
│ └─ [Devam]                          │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 2: YÖNTEM SEÇİMİ               │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ │
│ │  🎙 SES  │ │ 📝 FORM │ │ 📷 FOTO │ │  ← En az 1 zorunlu
│ │  (Ana)  │ │ (Detay) │ │ (Kanıt) │ │
│ └─────────┘ └─────────┘ └─────────┘ │
│ [Devam]                             │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 3A: SESLİ KAYIT (Opsiyonel)    │
│ ├─ Büyük mikrofon butonu (Bas-Tut)  │
│ ├─ Canlı dalga formu                │
│ ├─ Süre sayacı                      │
│ ├─ "Kaydet" → STT (Whisper.cpp)     │
│ ├─ Metin önizleme + Düzenle         │
│ └─ [Sonraki] / [Atla]               │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 3B: FORM (Yapılandırılmış)     │
│ ├─ Hava: Otomatik (Konum + API)     │
│ ├─ Güç: [●○○○○] - [●●●●●] (5 seviye)│
│ ├─ Huysuzluk: [Sakin] [Orta] [Saldırgan]│
│ ├─ Ana Arı: [Gördüm] [Görmedim] [Hucre] [Yeni] [Yok]│
│ ├─ PETEK DAĞILIMI (FrameCounter!)   │
│ │  [Yumurtalık: 4] [Bal: 3] [Polen: 2] [Perga: 1] [Boş: 0] │
│ ├─ Varroa: Sayı + Yöntem [Alkol] [Şeker] [Çöp] [Görsel]│
│ ├─ Hastalık İşaretleri (Checkbox)   │
│ └─ Genel Not                        │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 3C: FOTOĞRAFLAR (Opsiyonel)    │
│ ├─ Kamera / Galeri                  │
│ ├─ Çoklu seçim (Max 5)              │
│ ├─ Etiket: [Petek] [Ana Arı] [Hastalık] [Genel]│
│ └─ [Sonraki]                        │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 4: AI ANALİZİ (Loading)        │
│ ├─ "Verileriniz analiz ediliyor..." │
│ ├─ Local model (Hermes) çalışır     │
│ ├─ Anomali tespiti                  │
│ ├─ Risk skorları                    │
│ └─ Öneri listesi                    │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ ADIM 5: SONUÇ VE ONAY               │
│ ├─ AI Özeti (1-2 cümle)             │
│ ├─ Anomaliler (Renkli badge'ler)    │
│ │  ⚠ Varroa 12/100 → Yüksek risk    │
│ │  ⚠ Ana arı görülmedi 2. kez       │
│ │  ✓ Güç normal                     │
│ ├─ Öneriler (Öncelikli)             │
│ │  1. 3 gün içinde varroa tedavisi  │
│ │  2. Ana arı kontrolü (7 gün içinde)│
│ ├─ [Düzenle] [Kaydet]               │
└─────────────────────────────────────┘
  │
  ▼
KAYDEDİLDİ → IndexedDB + Sync Queue
  │
  ▼
TOAST: "Muayene kaydedildi. AI 2 anomali, 2 öneri bulundu."
  │
  ▼
[Kovan Detay / Dashboard] — Son muayene kartı görünür
```

### 6.3 Form Alanı Detayları

| Alan | Tip | Zorunlu | Varsayılan | Doğrulama |
|------|-----|---------|------------|-----------|
| `inspected_at` | DateTime | Evet | Şimdi | Gelecek olamaz |
| `duration_seconds` | Int | Hayat | Otomatik | - |
| `weather_snapshot` | JSON | Hayat | Konum API | - |
| `strength` | Enum | Evet | - | 5 değerden biri |
| `temperament` | Enum | Evet | - | 4 değerden biri |
| `queen_status` | Enum | Evet | - | 5 değerden biri |
| `brood_area_pct` | Int (0-100) | Hayat | FrameCounter'dan | Toplam ≤ 100 |
| `honey_area_pct` | Int (0-100) | Hayat | FrameCounter'dan | Toplam ≤ 100 |
| `pollen_area_pct` | Int (0-100) | Hayat | FrameCounter'dan | Toplam ≤ 100 |
| `drone_area_pct` | Int (0-100) | Hayat | FrameCounter'dan | Toplam ≤ 100 |
| `empty_area_pct` | Int (0-100) | Hayat | FrameCounter'dan | Toplam ≤ 100 |
| `varroa_count` | Int | Hayat | - | ≥ 0 |
| `varroa_method` | Enum | Varroa varsa | - | 4 yöntem |
| `disease_signs` | Enum[] | Hayat | - | Çoklu seçim |
| `voice_transcript` | Text | Hayat | - | Max 5000 karakter |
| `photos` | File[] | Hayat | - | Max 5, 5MB each |

### 6.4 AI Analiz Çıktısı (Örnek)

```json
{
  "summary": "Kovan orta güçte, varroa enfeksiyonu tedavi eşiğini aştı, ana arı 2. ardışık muayenede görülmedi.",
  "anomalies": [
    {
      "type": "varroa_high",
      "severity": "critical",
      "confidence": 0.95,
      "evidence": "Alkol yıkamada 12 varroa/100 arı (eşik: 3), trend: 2→5→12 (son 3 muayene)",
      "threshold": 3,
      "current": 12
    },
    {
      "type": "queen_missing",
      "severity": "warning",
      "confidence": 0.8,
      "evidence": "Son 2 muayenede ana arı görmedi, yumurtalık alanı %15 (normal: %25-35)",
      "days_since_seen": 14
    }
  ],
  "recommendations": [
    {
      "action": "Okzalik asidi buhar tedavisi (2g/kovan)",
      "priority": "critical",
      "reasoning": "Varroa %12 enfeksiyon, literatürde %3'ten üzeri acil müdahale gerektirir",
      "due_date": "2026-07-22",
      "references": ["TÜBİTAK 2023 Varroa Rehberi", "COLOSS 2022 Protocol"]
    },
    {
      "action": "Ana arı kontrolü ve gerekirse yeni ana arı",
      "priority": "high",
      "reasoning": "14 gündür ana arı görmüyor, yumurtalık alanı daralıyor",
      "due_date": "2026-07-26",
      "references": ["Anadolu Arısı Yönetimi, s.45"]
    }
  ],
  "risk_scores": {
    "varroa": 0.92,
    "queen_failure": 0.65,
    "starvation": 0.12,
    "swarming": 0.08
  }
}
```

### 6.5 Kenar Senaryoları

| Senaryo | Davranış |
|---------|----------|
| İnternet yok, AI çalışmaz | Local model (Hermes) çalışır, remote AI kuyruğa alınır, "Çevrimdışı analiz yapıldı" badge |
| Ses kaydı çok kısa (< 3sn) | "Ses çok kısa, tekrar deneyin veya atlayın" uyarısı |
| Fotoğraf yüklenemez | Local'de blob olarak saklanır, senkron kuyruğuna alınır |
| Kullanıcı sihirbazı kapatır | Taslak olarak kaydedilir, Dashboard'da "Devam Et" kartı gösterilir |
| Varroa sayısı anormal yüksek (100+) | "Sayım yöntemini kontrol edin" uyarısı + manuel onay |

---

## 7. Hasat Girişi (Honey Harvest Flow)

### 7.1 Kullanıcı Hikayesi
> "Bal hasadı yaptığında, kaç çerçevenin kaç kg bal verdiğini, nemini, tipini kaydetmek ve anlık verim hesaplamak istiyorum."

### 7.2 Akış

```
[Dashboard / Kovan Detay / Envanter] ──▶ [+ Hasat]
  │
  ▼
┌─────────────────────────────────────┐
│ TEK SAYFA FORM (Modal/Bottom Sheet) │
│                                     │
│  Arı Üssü: [Seçili] ▼               │
│  Kovan: [Seçili / Tümü] ▼           │
│                                     │
│  Tarih: [Bugün] 📅                  │
│  Hasat Edilen Çerçeve: [8] 🔢       │
│  Toplam Ağırlık (kg): [24.5] ⚖️     │
│  Bal Nemi (%): [17.2] 💧  ← Ölçer   │
│                                     │
│  Bal Tipi: [Çiçek] [Çam] [Kestane]  │
│          [Kekik] [Karışık] [Tek Çiçek]▼│
│  Dominant Flora: [Otomatik/Takvimden]│
│                                     │
│  Fiyat (TL/kg): [180] 💰            │
│  Satılan Miktar: [0] kg             │
│                                     │
│  Not: [________________________]    │
│                                     │
│  [İptal]          [Kaydet]          │
└─────────────────────────────────────┘
  │
  ▼
BAŞARILI → Toast, Envanter stoktan düşer (eğer paketleme varsa)
  │
  ▼
[Hasat Listesi / Analitik] — Verim grafiğinde görünür
```

### 7.3 Otomatik Hesaplamalar

| Hesaplama | Formül | Gösterim |
|-----------|--------|----------|
| **Çerçeve Başına Verim** | `toplam_kg / cerceve_sayisi` | "3.1 kg/çerçeve" |
| **Kovan Verimi (Sezonluk)** | `SUM(hasat_kg) WHERE kovan_id` | "Bu sezon: 45 kg" |
| **Apiary Verimi** | `SUM(hasat_kg) WHERE apiary_id` | "Eğil Yaylası: 1.2 ton" |
| **Nem Uyarısı** | `nem > 18%` → "Yüksek nem, fermente riski" | Kırmızı badge |
| **Fiyat Önerisi** | Bölge pazar fiyatı + kalite primi | "Öneri: 185-195 TL/kg" |

---

## 8. Besleme Takvimi (Feeding Flow)

### 8.1 Kullanıcı Hikayesi
> "Kış öncesi şekerli su, bahar gelişimi için paté, açlık döneminde acil besleme — hepsini planlayıp, stoktan düşerek, maliyet takip ederek yapmak istiyorum."

### 8.2 Akış: Besleme Planlama

```
[Dashboard] ──▶ [Besleme] (Alt nav "Daha Fazla" → Besleme)
  │
  ▼
┌─────────────────────────────────────┐
│ BEŞLEME TAKVİMİ (Aylık Görünüm)     │
│                                     │
│  ┌─────────────────────────────┐   │
│  │  EKİM 2026                  │   │
│  │  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐  │   │
│  │  │1 │ │2 │ │3●│ │4 │ │5●│  │   │  ← Nokta = planlı besleme
│  │  └──┘ └──┘ └──┘ └──┘ └──┘  │   │
│  └─────────────────────────────┘   │
│                                     │
│  [+ Yeni Besleme Planı]             │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ YENİ BEŞLEME PLANI (Wizard)         │
│                                     │
│ ADIM 1: Neden?                      │
│ [Kış Hazırlığı] [Bahar Gelişimi]    │
│ [Açlık Dönemi] [Ana Arı Yetiştirme] │
│ [Uyarıtma] [Diğer]                  │
│                                     │
│ ADIM 2: Ne?                         │
│ [Şekerli Su 1:1] [Şekerli Su 2:1]   │
│ [Paté/Fondant] [Polen Pastası]      │
│ [Protein Tozu] [Bal]                │
│                                     │
│ ADIM 3: Miktar ve Yöntem            │
│ Miktar: [5] kg/litre                │
│ Yöntem: [Üst Besleyici] [Çerçeve]   │
│         [Giriş] [Damlatma]          │
│                                     │
│ ADIM 4: Zamanlama                   │
│ Başlangıç: [15 Ekim] 📅             │
│ Bitiş: [30 Ekim] 📅                 │
│ Sıklık: [Günde 1] [2 günde 1] [Haftada 1] ▼│
│                                     │
│ ADIM 5: Kovanlar                    │
│ [Tüm Kovanlar] [Zayıf Kovanlar]     │
│ [Seçili Kovanlar] ▼                 │
│                                     │
│ ADIM 6: Maliyet ve Stok             │
│ Birim Maliyet: [25] TL/kg           │
│ Stokta: 50 kg şeker (Yeterli ✓)     │
│ Tahmini Maliyet: 125 TL             │
│ [Stok Azaldı Uyarısı Aç]            │
│                                     │
│ [Planı Kaydet]                      │
└─────────────────────────────────────┘
```

### 8.3 Akış: Besleme Uygulama (Günlük)

```
[Besleme Takvimi] ──▶ Bugünkü beslemeler (Kart listesi)
  │
  ▼
┌─────────────────────────────────────┐
│ BEŞLEME UYGULA — Kovan-12           │
│                                     │
│ Plan: Şekerli Su 2:1, 2 Litre       │
│ Yöntem: Üst Besleyici               │
│                                     │
│ Gerçekleşen:                        │
│ Miktar: [2.0] Litre 📝              │
│ Tüketilen: [1.8] Litre (Yarın kontrol)│
│ Maliyet: [45] TL (Otomatik)         │
│                                     │
│ Not: [Hızla tüketti]                │
│                                     │
│ [İptal]          [Kaydet]           │
└─────────────────────────────────────┘
  │
  ▼
STOK GÜNCELLENİR → Envanterden düşer
  │
  ▼
[Besleme Geçmişi] — Tüketim trendi grafiği
```

---

## 9. Hastalık / Varroa Yönetimi (Disease Flow)

### 9.1 Kullanıcı Hikayesi
> "Varroa sayımı yaptım, sonucu giriyorum. AI bana risk seviyesini, hangi ilacı, hangi dozajda, nasıl uygulayacağını, ne zaman tekrar sayım yapmam gerektiğini söylesin."

### 9.2 Akış: Varroa Sayımı ve Tedavi

```
[Dashboard Uyarı / Kovan Detay / Hastalıklar] ──▶ [Varroa Sayımı]
  │
  ▼
┌─────────────────────────────────────┐
│ VARROA SAYIMI GİRİŞİ                │
│                                     │
│ Yöntem: [Alkol Yıkama] [Pudra Şekeri]│
│         [Çöp Tablası] [Görsel]      │
│                                     │
│ Sayım Sonucu:                       │
│ ├─ Alkol/Pudra: [12] varroa / 100 arı│
│ ├─ Çöp Tablası: [45] varroa / 24 saat│
│ └─ Görsel: [Az] [Orta] [Çok]        │
│                                     │
│ Tarih: [Bugün] 📅                   │
│ Not: [________________________]     │
│                                     │
│ [Hesapla ve Kaydet]                 │
└─────────────────────────────────────┘
  │
  ▼
┌─────────────────────────────────────┐
│ AI RİSK DEĞERLENDİRMESİ (Anlık)     │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  RİSK SEVİYESİ: YÜKSEK 🔴       │ │
│ │  Enfeksiyon: %12 (Eşik: %3)     │ │
│ │  Trend: 2 → 5 → 12 (Artan)      │ │
│ │  Kayıp Riski: %40 (Tedavisz)    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ÖNERİLEN TEDAVİLER:                 │
│ 1. Okzalik Asidi Buhar (Birincil)   │
│    Dozaj: 2g/kovan, 3 seans, 5 gün arayla│
│    Maliyet: ~15 TL/kovan            │
│    Etkinlik: %95+                   │
│                                     │
│ 2. Okzalik Asidi Damlatma (Alternatif)│
│    Dozaj: 35ml 3.5% çözelti/kovan   │
│    Etkinlik: %85-90                 │
│                                     │
│ 3. Formik Asit (Sıcaklık 10-25°C)   │
│    Dozaj: 250ml/kovan, tek seans    │
│    Etkinlik: %90                    │
│                                     │
│ [Tedavi Başlat] [Daha Sonra]        │
└─────────────────────────────────────┘
  │
  ▼ (Tedavi Başlat)
┌─────────────────────────────────────┐
│ TEDAVİ KAYDI                        │
│                                     │
│ İlaç: [Okzalik Asidi Buhar] ▼       │
│ Ürün Adı: [VarroMed / Apibioxal]    │
│ Etkin Madde: Okzalik Asidi %XX      │
│ Dozaj: [2] g/kovan                  │
│ Uygulama: [Buhar Makinesi] ▼        │
│                                     │
│ Başlangıç: [Bugün] 📅               │
│ Planlanan Bitiş: [5 gün sonra] 📅   │
│                                     │
│ Önceden Sayım: [12] (Otomatik)      │
│ Sonraki Sayım: [Tedavi sonrası 2 hafta] 📅│
│                                     │
│ Maliyet: [15] TL/kovan              │
│ Not: [Akşam saatlerinde uygula]     │
│                                     │
│ [Kaydet]                            │
└─────────────────────────────────────┘
  │
  ▼
HATIRLATICI OLUŞTURULUR:
  • "Okzalik asidi 1. seansı bugün"
  • "2. seans 5 gün sonra"
  • "Kontrol sayımı 2 hafta sonra"
  │
  ▼
[Tedavi Listesi] — Etkinlik takibi
```

### 9.3 Tedavi Etkinlik Takibi

```
[Tedavi Detayı] ──▶ [Kontrol Sayımı Yap]
  │
  ▼
Sonraki sayım girilir → Etkinlik hesaplanır
  │
  ▼
┌─────────────────────────────────────┐
│ ETKİNLİK RAPORU                     │
│                                     │
│ Öncesi: 12 varroa/100               │
│ Sonrası: 1 varroa/100               │
│ Etkinlik: %91.6 ✓                   │
│                                     │
│ [Başarılı] [Kısmi Başarısız] [Başarısız]│
│                                     │
│ Not: [2. seans gerekmedi]           │
└─────────────────────────────────────┘
```

---

## 10. Envanter Yönetimi (Inventory Flow)

### 10.1 Kullanıcı Hikayesi
> "Şeker, ilaç, perga, kovan parçaları — hepsini takip etmek, minimum stok altına düştüğünde uyarı almak, barkodla hızlı giriş yapmak istiyorum."

### 10.2 Akış: Envanter Listesi ve Stok Girişi

```
[Envanter Sekmesi]
  │
  ├─ SEKMELER: [Tümü] [Malzeme] [İlaç] [Besin] [Koruma] [Ambalaj]
  │
  ├─ ARAMA/FİLTRE: Metin, Kategori, Stok Durumu (Normal/Düşük/Bitti)
  │
  ├─ LİSTE (Kartlar)
  │   ├─ İsim, Kategori, Mevcut/Min, Birim, Maliyet
  │   ├─ Renk: Yeşil (Normal), Sarı (Düşük), Kırmızı (Bitti)
  │   ├─ Swipe: [Düzenle] [Harcama Ekle] [Sil]
  │   └─ FAB: [+ Yeni Öğe] [Barkod Tara]
  │
  └─ BOŞ DURUM: "Henüz envanter yok" → [İlk Öğeyi Ekle]
```

### 10.3 Akış: Yeni Envanter Öğesi

```
[+ Yeni Öğe]
  │
  ▼
┌─────────────────────────────────────┐
│ YENİ ENVANTER ÖĞESİ                 │
│                                     │
│ İsim: [Okzalik Asidi]               │
│ Kategori: [İlaç] ▼                  │
│ Birim: [Adet] [kg] [Litre] [Paket] ▼│
│                                     │
│ Mevcut Stok: [10]                   │
│ Minimum Stok: [3]  ← Uyarı eşiği    │
│                                     │
│ Birim Maliyet: [15] TL              │
│ Tedarikçi: [Apimed]                 │
│ Son Kullanma: [2027-12] 📅          │
│ Depo Konumu: [Ana Depo / Araç]      │
│ Barkod: [📷 Tara] [8691234567890]   │
│                                     │
│ Not: [Buhar makinesi için]          │
│                                     │
│ [İptal]          [Kaydet]           │
└─────────────────────────────────────┘
```

### 10.4 Akış: Stok Hareketi (Giriş/Çıkış)

```
[Envanter Öğesi] ──▶ [Hareket Ekle] (Swipe veya Detay)
  │
  ▼
┌─────────────────────────────────────┐
│ STOK HAREKETİ                       │
│                                     │
│ Tür: [Giriş (Alım)] [Çıkış (Kullanım)]▼│
│                                     │
│ Miktar: [5]                         │
│ Birim Maliyet: [15] TL (Girişse)    │
│                                     │
│ İlgili Kovan/Üss: [Seçili] ▼        │
│ İlgili İşlem: [Tedavi] [Besleme]    │
│          [Bakım] [Diğer] ▼          │
│                                     │
│ Tarih: [Bugün] 📅                   │
│ Fatura/Not: [________________________]│
│                                     │
│ [İptal]          [Kaydet]           │
└─────────────────────────────────────┘
  │
  ▼
STOK GÜNCELLENİR → Minimum altına düşerse → BİLDİRİM
```

---

## 11. Analitik ve Raporlar (Analytics & Reports Flow)

### 11.1 Kullanıcı Hikayesi
> "Sezon sonunda kooperifte/vergide rapor vermem gerekiyor. Aylık verim, kovan başına maliyet, kar/zarar, hangi üs ne kadarı — hepsi PDF/Excel olarak hazır olsun."

### 11.2 Analitik Dashboard Akışı

```
[Analitik Sekmesi]
  │
  ├─ ZAMAN ARALIĞI: [Bu Ay] [Bu Sezon] [Bu Yıl] [Özel] ▼
  │
  ├─ KPI KARTLARI (4'lü grid)
  │   ├─ Toplam Hasat: 1,245 kg
  │   ├─ Ort. Kovan Verimi: 28.5 kg
  │   ├─ Toplam Maliyet: 45,000 TL
  │   └─ Net Kar: 125,000 TL
  │
  ├─ GRAFİKLER (Sekmeli)
  │   ├─ [Verim Trendi] — Aylık çizgi grafiği
  │   ├─ [Kovan Gücü Dağılımı] — Histogram
  │   ├─ [Varroa Trendi] — Çizgi + eşik çizgisi
  │   ├─ [Maliyet/Gelir] — Yığın çubuk
  │   ├─ [Flora Etkisi] — Bal tipi vs verim scatter
  │   └─ [Bölge Karşılaştırma] — Eğil vs Diğer
  │
  └─ FİLTRELER: Arı Üssü, İrk, Kutu Tipi
```

### 11.3 Rapor Oluşturma Akışı

```
[Analitik] ──▶ [Rapor Oluştur] (Header action)
  │
  ▼
┌─────────────────────────────────────┐
│ RAPOR SİHİRBAZI                     │
│                                     │
│ ADIM 1: Şablon Seç                  │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Sezon Özeti │ │ Vergi/      │     │
│ │ (Kendi)     │ │ Kooperatif  │     │
│ └─────────────┘ └─────────────┘     │
│ ┌─────────────┐ ┌─────────────┐     │
│ │ Kovan       │ │ Özel        │     │
│ │ Performans  │ │ (Şablonlu)  │     │
│ └─────────────┘ └─────────────┘     │
│                                     │
│ ADIM 2: Kapsam                      │
│ Arı Üssü: [Tümü / Seçili] ▼         │
│ Dönem: [Bu Sezon] [Özel Tarih] ▼    │
│ Kovanlar: [Tümü] [Aktif] [Satılan]  │
│                                     │
│ ADIM 3: Format                      │
│ [PDF] [Excel] [CSV] [JSON]          │
│                                     │
│ ADIM 4: İçerik Seçenekleri          │
☑ Hasat Özeti        ☑ Maliyet Analizi
☑ Varroa Raporu      ☑ Besleme Özeti
☑ Ana Arı Değişimleri ☑ Envanter Özeti
☑ AI Özetleri        ☑ Grafikler
                                     │
│ [Önizleme]          [Oluştur]       │
└─────────────────────────────────────┘
  │
  ▼
RAPOR HAZIR → İndir / Paylaş (WhatsApp, Email, Drive)
  │
  ▼
[Rapor Geçmişi] — Liste, yeniden indir, sil
```

---

## 12. Ayarlar ve Profil (Settings Flow)

### 12.1 Ayarlar Yapısı

```
[Ayarlar] (Alt nav "Daha Fazla" → Ayarlar)
  │
  ├─ PROFİL
  │   ├─ İsim, Avatar, Telefon, Email
  │   ├─ Şifre Değiştir
  │   └─ Hesabı Sil
  │
  ├─ UYGULAMA
  │   ├─ Tema: [Koyu] [Açık] [Sistem] (Default: Koyu)
  │   ├─ Dil: [Türkçe] [English]
  │   ├─ Yazı Boyutu: [Küçük] [Normal] [Büyük] [Çok Büyük]
  │   ├─ Sesli Giriş Dili: [Türkçe] [English]
  │   └─ Haptic Feedback: [Açık] [Kapalı]
  │
  ├─ VERİ VE GİZLİLİK
  │   ├─ Senkronizasyon: [Otomatik] [Sadece Wi-Fi] [Manuel]
  │   ├─ Veri Yedekle: [Dışa Aktar (JSON/CSV)] [Google Drive]
  │   ├─ Veri İçe Aktar: [Dosya Seç] [Diğer Uygulamadan]
  │   ├─ Tüm Verileri Sil (Tehlikeli)
  │   ├─ Analitik Paylaş: [Açık] [Kapalı] (Anonim)
  │   └─ KVKK / Gizlilik Politikası (Link)
  │
  ├─ BİLDİRİMLER
  │   ├─ Push: [Açık] [Kapalı]
  │   ├─ Varroa Uyarıları: [Kritik] [Tümü] [Kapalı]
  │   ├─ Ana Arı Uyarıları: [Açık] [Kapalı]
  │   ├─ Hava Uyarıları: [Açık] [Kapalı]
  │   ├─ Besleme Hatırlatmaları: [Açık] [Kapalı]
  │   ├─ Forum/Yorum: [Açık] [Kapalı]
  │   └─ Haftalık Özet: [Pazartesi 09:00] [Kapalı]
  │
  ├─ YAPIYLANDIRMA
  │   ├─ Varsayılan Arı Üssü: [Seç] ▼
  │   ├─ Varsayılan Kutu Tipi: [Langstroth] [Dadant] [Layens] ▼
  │   ├─ Çerçeve Sayısı Default: [10] 🔢
  │   ├─ Varroa Eşiği: [Alkol: 3] [Şeker: 3] [Çöp: 10] 🔢
  │   ├─ Birimler: [Metrik] [İmparatorluk]
  │   └─ Para Birimi: [TL] [USD] [EUR]
  │
  ├─ AI VE MODELLER
  │   ├─ AI Analiz: [Yerel + Bulut] [Sadece Yerel] [Kapalı]
  │   ├─ Model Boyutu: [Küçük (Hızlı)] [Orta] [Büyük (Akıllı)]
  │   ├─ Veri Paylaş AI İçin: [Anonimleştirilmiş] [Kapalı]
  │   └─ Model Güncelle: [Şimdi] [Otomatik] [Manuel]
  │
  ├─ HESAP VE ABONELİK
  │   ├─ Plan: [Free] [Pro] [Enterprise]
  │   ├─ Faturalandırma Geçmişi
  │   ├─ Aboneliği Yönet (Store link)
  │   └─ Kod Uygula (Promosyon)
  │
  ├─ YARDIM VE DESTEK
  │   ├─ Kullanım Kılavuzu (Link)
  │   ├─ Video Eğitimler (Link)
  │   ├─ SSS (Link)
  │   ├─ Hata Bildir (Form)
  │   ├─ Özellik İste (Form)
  │   ├─ Topluluk Forumu (Link)
  │   └─ Sürüm: v1.0.0 (Build: 2026.07.19)
  │
  └─ GELİŞMİŞ (Geliştirici Modu Açıkken)
      ├─ IndexedDB Görüntüle
      ├─ Sync Queue Görüntüle
      ├─ AI Debug Paneli
      ├─ Log Dosyaları
      └─ Test Verisi Yükle
```

---

## 13. Offline ve Senkronizasyon Akışları

### 13.1 Offline Mod Girişi

```
İNTERNET KESİLDİ
  │
  ▼
SERVICE WORKER → NetworkFirst başarısız
  │
  ▼
UI GÜNCELLENİR:
  ├─ Header: "Çevrimdışı" badge (Kırmızı wifi ikonu)
  ├─ Alt nav: Senkron ikonu → "Bekleyen: 3"
  ├─ Tüm veriler IndexedDB'den okunur
  ├─ Yazma işlemleri: Kuyruğa alınır (Yeşil "Kuyrukta" badge)
  └─ AI: Local model (Hermes) çalışır
  │
  ▼
KULLANICI ÇALIŞMAYA DEVAM EDER
```

### 13.2 Senkronizasyon (Online Olduğunda)

```
İNTERNET GELDİ
  │
  ▼
BACKGROUND SYNC TETİKLENİR
  │
  ▼
┌─────────────────────────────────────┐
│ SENKRON İLERLEMESİ (Toast/Progress) │
│                                     │
│ 1. Kimlik Doğrulama (Token yenile)  │
│ 2. Push: Yerel → Sunucu (Batch 50)  │
│    ├─ Oluşturulan kayıtlar          │
│    ├─ Güncellenen kayıtlar          │
│    └─ Silinen kayıtlar              │
│ 3. Çakışma Kontrolü                 │
│    └─ Varsa: Çakışma Çözücü UI      │
│ 4. Pull: Sunucu → Yerel (Değişiklikler)│
│ 5. Medya Dosyaları (Foto/Ses)       │
│ 6. AI Analiz Sonuçları (Remote)     │
│ 7. Tamamlandı → Badge temizlenir    │
└─────────────────────────────────────┘
  │
  ▼
BAŞARILI → "Senkronizasyon tamamlandı. 12 kayıt güncellendi."
HATALI → "Bazı kayıtlar senkronize edilemedi. Tekrar denenecek."
```

### 13.3 Çakışma Çözücü UI

```
┌─────────────────────────────────────┐
│ ⚠ VERİ ÇAKIŞMASI                    │
│                                     │
│ "Kovan-12" için iki farklı muayene  │
│ kaydedilmiş. Hangi versiyonu tutalım?│
│                                     │
│ ┌─────────────────┐ ┌─────────────┐ │
│ │ CİHAZ BU (10:30)│ │ SUNUCU (11:00)│ │
│ │ Güç: Orta       │ │ Güç: Güçlü  │ │
│ │ Varroa: 5       │ │ Varroa: 3   │ │
│ │ Not: "Zayıfladı"│ │ Not: "İyi"  │ │
│ └─────────────────┘ └─────────────┘ │
│                                     │
│ [Bu Cihazı Tut] [Sunucuyu Tut]      │
│ [İkisini de Tut (Farklı ID)]        │
│ [Birleştir (AI Önerisi)]            │
└─────────────────────────────────────┘
```

---

## 14. Hata ve Kenar Durumları (Error & Edge Cases)

### 14.1 Genel Hata Mesajları

| Hata Kodu | Kullanıcı Mesajı | Aksiyon |
|-----------|------------------|---------|
| `OFFLINE` | "İnternet bağlantısı yok. Değişiklikleriniz kaydedildi, bağlantı gelince senkronize edilecek." | Kuyruğa al, offline UI |
| `SYNC_CONFLICT` | "Bu kayıt başka bir cihazda da değişmiş. Hangisini tutmak istersiniz?" | Çakışma çözücü |
| `STORAGE_FULL` | "Cihaz depolama alanı dolu. Eski medya dosyalarını temizleyin." | Ayarlar → Depolama |
| `AUTH_EXPIRED` | "Oturumunuz süresi doldu. Tekrar giriş yapın." | Login sayfasına yönlendir |
| `VALIDATION_ERROR` | "Lütfen hatalı alanları düzeltin." | Form alanları vurgulanır |
| `AI_UNAVAILABLE` | "AI analizi şu anda kullanılamıyor. Yerel analiz yapıldı." | Local model fallback |
| `NFC_ERROR` | "NFC etiketi okunamadı. Tekrar deneyin veya manuel seçin." | Yeniden dene / Manuel |
| `CAMERA_ERROR` | "Kamera erişilemiyor. İzinleri kontrol edin." | Ayarlar rehberi |
| `LOCATION_ERROR` | "Konum alınamadı. Manuel pin bırakın." | Harita fallback |

### 14.2 Kritik Kenar Senaryoları

| Senaryo | Sistem Davranışı |
|---------|------------------|
| Kullanıcı 6 ay uygulamayı açmamış | "Hoş geldiniz! Son 6 ayda neler değişti?" özet modalı |
| IndexedDB bozuldu | Temizleme + Sunucudan full pull (kullanıcı onayıyla) |
| Supabase downtime | Local-first devam, "Bulut geçici olarak erişilemez" banner |
| Model dosyası silindi | İndirme başlatılır, interim: rule-based analiz |
| Kullanıcı hesap silmek istiyor | 30 gün iptal süresi, veri anonimleştirilir (yasal tutunda kalınır) |
| Çoklu cihazda aynı anda muayene | Event sourcing + timestamp bazlı merge, çakışma UI |

---

## 15. Erişilebilirlik Akışları (Accessibility Flows)

### 15.1 Ekran Okuyucu (TalkBack / VoiceOver) Desteği

| Ekran | Odak Sırası | ARIA Etiketleri | Sesli Komut Desteği |
|-------|-------------|-----------------|---------------------|
| Dashboard | Header → Özet kartlar → Uyarılar → Aksiyonlar → Son muayeneler | `role="region" aria-label="Özet"` | "Muayene başlat", "Kovan 12 detay" |
| Muayene Sihirbazı | Adım indicator → Form alanları → AI sonuçları → Kaydet | `aria-live="polite"` for AI results | "Sonraki adım", "Kaydet" |
| Kovan Detay | Header → Sekmeler → Çerçeve ızgara (grid nav) → Aksiyonlar | `role="grid" aria-label="Çerçeve haritası"` | "Çerçeve 3 bal olarak işaretle" |