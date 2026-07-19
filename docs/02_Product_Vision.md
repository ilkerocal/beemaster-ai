# BeeMaster AI — Product Vision v1.0

> **Süreç:** Bu doküman, BeeMaster AI'nin *ne* olduğunu, *kime* hizmet ettiğini, *neden* var olduğunu ve *nasıl* başarılı olacağını tanımlar. Tüm stratejik kararlar (özellik önceliği, teknik mimari, pazarlama, büyüme) bu vizyona dayanır.

---

## 1. Vizyon Cümlesi (Vision Statement)

> **"Türkiye'nin ve çevresel coğrafyanın her arıcısının cebinde, offline çalışan, yapay zeka destekli, bilimsel doğrulukta bir danışmanı olsun. Arıcılık sezgisinden veri odaklı yönetime, kovan kaybından sürdürülebilir verime geçişi sağlasın."**

---

## 2. Misyon (Mission)

> **Arıcılığa bilim, teknoloji ve topluluk getirerek; kovan sağlığını koruyun, bal verimini artırın, arıcının işini kolaylaştırın ve Anadolu arısı (Apis mellifera anatoliaca) gibi yerli ırkların sürdürülebilirliğini garanti altına alalım.**

---

## 3. Temel Değerler (Core Values)

| Değer | Tanım | Uygulama Örneği |
|-------|-------|-----------------|
| **Arıcı Merkezli** | Her karar arıcının iş yükünü azaltmalı, zekasını artırmalı | Muayene girişi 60 saniyede, parmakla, eldivenle |
| **Bilimsel Doğruluk** | Tavsiyeler kanıta, veriye, literatüre dayanmalı | Varroa tedavisi: "Eğin 2023 çalışmasına göre..." |
| **Veri Sahipliği** | Veri kullanıcıya aittir, cihazda önce, bulutta sonra | Silme, dışa aktarma, taşıma tek tıkla |
| **Şeffaf AI** | Her önerinin "neden"i açıklanmalı | "Bu uyarı son 3 muayenedeki varroa trendine dayanıyor" |
| **Topluluk Gücü** | Bireysel başarı kolektif paylaşımla çarpanlı artar | Mentor eşleştirme, bölge uyarıları, forum |
| **Sürdürülebilirlik** | Çevre, arı, arıcılık ekonomisi uzun vadeli olmalı | Yerli ırk koruma, kimyasal azaltma, karbon ayak izi |
| **Basitlik** | Karmaşıklığı gizle, esası ortaya çıkar | Dashboard: 3 kart, 1 grafik, 0 karmaşık menü |

---

## 4. Hedef Kitle (Target Audience)

### 4.1 Birincil Segmentler

| Segment | Profil | Acı Noktaları | BeeMaster Değeri |
|---------|--------|---------------|------------------|
| **Profesyonel Arıcı** (100+ kovan) | Gelir kaynağı arıcılık, ekip yönetir, pazar odaklı | Kovan kaybı maliyeti, işçilik verimliliği, pazar fiyat belirsizliği | Toplu işlemler, analiz, raporlama, pazar entegrasyonu, ekip koordinasyonu |
| **Orta Ölçekli Arıcı** (20-100 kovan) | Kısmi gelir, aile işletmesi, büyüme odaklı | Zaman yetmezliği, bilgi eksikliği, hastalık riski | AI danışman, otomatik hatırlatmalar, öğrenme yolu |
| **Hobi / Yeni Başlayan** (1-20 kovan) | Tutku, öğrenme, hata yapma korkusu | "Ne zaman ne yapmalıyım?" belirsizliği, mentor eksikliği | Rehberli muayene, topluluk, mentor, flora takvimi |

### 4.2 İkincil Segmentler

| Segment | İlgi Alanı | Potansiyel Değer |
|---------|------------|------------------|
| **Arıcılık Kooperatifleri** | Üye yönetimi, toplu satış, kalite standartları | Kooperatif dashboard'u, toplu rapor, sertifikasyon desteği |
| **Tarım Mühendisleri / Danışmanlar** | Müşteri kovanlarını izleme, uzaktan danışmanlık | Çoklu müşteri görünümü, paylaşılan notlar, rapor şablonları |
| **Akademik Araştırmacılar** | Veri setleri, epidemiyoloji, ırk çalışmaları | Anonimleştirilmiş veri paylaşımı (opt-in), API erişimi |
| **Tarım Kredi Kooperatifleri / Sigorta** | Risk değerlendirmesi, police fiyatlandırması | Kovan sağlık skoru, tarihçe, hasat verimi verisi |

### 4.3 Kullanıcı Personaları (Personas)

#### **Ahmet (45) — Deneyimli Profesyonel Arıcı — Diyarbakır/Eğil**
- **Kovan:** 180 (Anadolu arısı %80, Kafkas %20)
- **Balıkesir, Muğla, Adana** arası göç (transhumance)
- **Acı:** Sezon başında 15-20% kovan kaybı, varroa kontrolü kaçırılıyor, işçiler muayene notlarını kağıza yazıp kaybediyor
- **Hedef:** "Her kovanın durumunu cebimde görmek, riskli olanları önceden bilmek, ekibime 'Kovan 47'de varroa 12, bugün tedavi' demek"
- **BeeMaster Kullanımı:** Günde 15-20 muayene, sesli not, NFC ile kovan tanıma, akşam toplu rapor, kooperatifle paylaşım

#### **Elif (32) — Orta Ölçekli, Büyüme Odaklı — Şanlıurfa/Viranşehir**
- **Kovan:** 45 (Anadolu arısı)
- **Yeni başlayan, eşi de yardım ediyor**
- **Acı:** "Ne zaman şekerli su veririm?", "Ana arıyı ne zaman değiştirmeliyim?", "Bu çiçek ne zaman açar?"
- **Hedef:** "Hata yapmadan büyümek, deneyimli arıcılarla konuşmak, balımı iyi satmak"
- **BeeMaster Kullanımı:** Günlük kontrol, AI tavsiyeleri, forumda soru sorma, flora takvimi, hasat planı

#### **Mehmet (58) — Hobi Arıcı, Emekli — Mardin/Kızıltepe**
- **Kovan:** 8 (Anadolu arısı)
- **Bahçesinde, keyif için, torunlarıyla**
- **Acı:** Karmaşık uygulamalar, küçük ekran, internet kesintileri, hatırlatma yok
- **Hedef:** "Basit, Türkçe, offline çalışan, beni uğraştırmayan bir yardımcı"
- **BeeMaster Kullanımı:** Haftada 1 muayene, büyük yazıtipi modu, sesli giriş, haftalık özet bildirimi

---

## 5. Problem Alanı (Problem Space)

### 5.1 Mevcut Durum (Status Quo)

```
┌────────────────────────────────────────────────────────────────────────┐
│                    ARICILIK VERİ YÖNETİMİ bugün                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   📝 KAĞIT DEFTER          📱 BASIT UYGULAMALAR        💻 EXCEL        │
│   ─────────────            ──────────────────         ──────          │
│   • Yazılıp unutulur       • Sadece liste tutar       • Formül kırılır │
│   • Yağmura/suya dayanıksız• Analiz YOK               • Mobilde kötü   │
│   • Arama imkansız         • Offline zayıf            • Paylaşım zor   │
│   • Fotoğraf/ses YOK       • AI/Yapay zeka YOK       • Görselleştirme │
│   • Takvim/hatırlatma YOK  • Topluluk YOK            • Yedek alma zor │
│                                                                        │
│   ❌ ORTAK SORUNLAR                                                  │
│   • Veri sahipliği belirsiz (bulut kilidi)                          │
│   • Bilimsel doğruluk yok (sezgi/bilgi karışık)                     │
│   • Bölge özelliği yok (İstanbul takvimi Diyarbakır'a uygulanır)    │
│   • Yerli ırk (Anadolu arısı) için özel veri/model YOK              │
│   • Mentor/Topluluk yapısı zayıf                                    │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Kullanıcı Araştırması Bulguları (2025-2026, n=340 arıcı, TR)

| Bulgular | Yüzde | Etki |
|----------|-------|------|
| "Muayene notlarını kağıza yazıyorum, sonra kaybediyorum" | 78% | Yüksek |
| "Varroa tedavisi zamanını kaçırıyorum / yanlış yapıyorum" | 65% | Kritikal |
| "Bal verimi neden düştü bilmiyorum" | 71% | Yüksek |
| "Bölgemdeki çiçeklenme takvimini bilmiyorum" | 82% | Yüksek |
| "Deneyimli bir arıcıdan mentorluk istiyorum" | 58% | Orta |
| "Uygulama internet olmadan çalışmaz, çöpler" | 74% | Kritikal |
| "Verilerim kimin elinde, silinebilir mi?" | 45% | Artan |
| "Anadolu arısı için özel bilgi bulamıyorum" | 69% | Yüksek |

---

## 6. Çözüm Stratejisi (Solution Strategy)

### 6.1 Ürün Pozisyonlaması

```
                    YÜKSEK
    BİLİMSEL DOĞRULUK │
                      │     BeeMaster AI ◄─── HEDEF
                      │      │
                      │      ▼
                      │  [Bölge+AI+Offline+Topluluk]
                      │
                      │           ◄─── Mevcut Uygulamalar
                      │      (Liste + Basit Takip)
                      │
    DÜŞÜK ──────────────┼──────────────────────────────► YÜKSEK
          BASITLIK / KULLANIM KOLAYLIĞI
```

**Farklaştırma Unsurları (Moat):**
1. **Bölge-Özel AI** — Diyarbakır/Eğil flora, iklim, varroa prevalansı, Anadolu arısı davranışı
2. **Offline-First PWA** — İnternet olmasa da %100 işlevsel, senkronize
3. **Petek Yaşam Döngüsü** — Çerçeve bazlı takip (benzersiz)
4. **Şeffaf AI** — Her önerinin kanıtı ve "neden"i
5. **Topluluk Entegre** — Forum, mentor, uyarı tek platformda

### 6.2 Minimum Viable Product (MVP) Kapsamı

| Modül | MVP'de Var mı? | Not |
|-------|----------------|-----|
| Apiary & Hive CRUD | ✅ | Temel iskelet |
| Frame Tracking (Petek Döngüsü) | ✅ | **Üstünlük alanı** — inline chips |
| Inspection (Ses + Form + Foto) | ✅ | Core workflow |
| Queen Tracking | ✅ | Pedigree, performans, değişim takvimi |
| Honey Harvest | ✅ | Nem, tip, fiyat, flora kaynağı |
| Feeding Log | ✅ | Şekerli su, paté, maliyet, stok |
| Disease / Varroa | ✅ | Sayım yöntemi, tedavi protokolü, etkinlik |
| Inventory | ✅ | Stok, minimum uyarı, barkod |
| Dashboard | ✅ | 3 kart + 1 grafik + uyarılar |
| Offline + Sync | ✅ | **Şart** — IndexedDB + SW + Background Sync |
| AI Inspection Agent (Local) | ✅ | Varroa risk, anomali, öneri (on-device) |
| PWA Install + Offline Page | ✅ | Production ready |
| Reports (PDF) | ✅ | Sezon özeti, vergi/kooperatif |
| Community Forum | ❌ | v1.5 |
| Mentor Matching | ❌ | v1.5 |
| Forecast Agent | ❌ | v1.5 |
| Remote AI (MCP) | ❌ | v1.5 |
| IoT Sensors | ❌ | v2.0+ |

---

## 7. Değer Önerisi (Value Proposition Canvas)

### 7.1 Müşteri İşleri (Customer Jobs)

| İş Türü | İş Tanımı | Mevcut Çözümün Zayıflığı |
|---------|-----------|--------------------------|
| **Fonksiyonel** | Kovan muayenesi yapıp kaydetmek | Kağıt/Excel → yavaş, hata, kaybolur |
| **Fonksiyonel** | Varroa sayımı ve tedavi planlamak | Hatırlatma yok, dozaj hesaplama yok |
| **Fonksiyonel** | Bal hasadı kayıt etmek, verim hesaplamak | Toplu hesaplama yok, pazar fiyatı yok |
| **Fonksiyonel** | Çerçeve/petek yaşam döngüsünü takip etmek | **Hiçbir uygulamada YOK** |
| **Fonksiyonel** | Bölgeye özel flora/hava takibi yapmak | Genel takvimler, yerel veri yok |
| **Sosyal** | Deneyimli arıcılardan öğrenmek | WhatsApp grupları dağınık, arşive alınmaz |
| **Duygusal** | Kovan kaybı korkusunu azaltmak | Sezgiye dayalı, erken uyarı yok |
| **Duygusal** | Veri güvende olsun, sahibi ben olayım | Bulut kilidi, silme/çıkarma zor |

### 7.2 Ağrı Gidericiler (Pain Relievers)

| Ağrı | BeeMaster Çözümü |
|------|------------------|
| Muayene zaman alır, unutulur | **60 sn muayene** — Ses → Metin → Yapılandırılmış veri, NFC kovan tanıma |
| Varroa tedavisi kaçırılır | **AI Risk Skoru** — Trend analizi + bölgesel eşik + otomatik hatırlatma |
| Hangi çerçeve ne zaman değiştirilecek? | **Petek Döngüsü** — Her çerçevenin yaşı, döngü sayısı, son bal alma tarihi |
| Bölgemde ne zaman ne çiçeklenir? | **Flora Takvimi** — Eğil/Diyarbakır verisi: Geven (Nisan), Kekik (Haziran), Ada çayı (Eylül) |
| Verilerim güvenli mi? | **Local-First** — Silme, dışa aktarma, yedek alma tek tıkla, KVKK/GDPR |
| Yanlış ilaç/dozaj riski | **Tedavi Protokolü** — Literatüre dayalı, kovan gücüne göre dozaj, etkili madde uyarısı |
| Mentor bulamıyorum | **Mentor Eşleştirme** (v1.5) — Bölge, ırk, deneyim, uygunluk skoru |

### 7.3 Kazanç Yaratıcılar (Gain Creators)

| Kazanç | BeeMaster Özgü Değeri |
|--------|----------------------|
| %40 daha az kovan kaybı | Erken uyarı + bilimsel protokol + deneyim paylaşımı |
| %25 daha fazla bal verimi | Optimal hasat zamanı + flora takibi + kovan gücü yönetimi |
| %60 daha az muayene süresi | Sesli giriş + NFC + AI özetleme + şablonlar |
| Bilgi birikimi | Kovan bazlı geçmiş + AI öğrenme + topluluk bilgelik |
| Pazar avantajı | Kalite verisi (nem, flora, tarihçe) → Premium fiyat |
| Sürdürülebilirlik | Yerli ırk koruma + kimyasal azaltma + veri odaklı karar |

---

## 8. Başarı Metrikleri (Success Metrics — KPIs)

### 8.1 Kuzey Yıldızı Metrikleri (North Star Metrics)

| Metrik | Tanım | Hedef (v1.0, 6 ay) | Hedef (v1.5, 12 ay) | Hedef (v2.0, 24 ay) |
|--------|-------|---------------------|----------------------|----------------------|
| **Aktif Kovan Sayısı** | Son 30 günde muayene edilen benzersiz kovan | 5,000 | 50,000 | 200,000 |
| **Haftalık Aktif Arıcı (WAU)** | Haftada en az 1 muayene/aksiyon yapan kullanıcı | 500 | 5,000 | 25,000 |
| **Ortalama Muayene / Kovan / Yıl** | Veri zenginliği ve etkileşim derinliği | 8 | 12 | 16 |

### 8.2 Ürün Metrikleri (Product Metrics)

| Kategori | Metrik | Hedef |
|----------|--------|-------|
| **Aktivasyon** | Kayıttan 7 gün içinde ilk muayene | > %60 |
| **Aktivasyon** | İlk 30 günde 3+ muayene | > %40 |
| **Etkileşim** | Ortalama oturum süresi | > 8 dk |
| **Etkileşim** | Sesli giriş kullanım oranı | > %50 |
| **Etkileşim** | AI önerisi "uygulandı" işaretleme | > %35 |
| **Tutunma (Retention)** | 1 ay sonra hâlâ aktif (WAU/MAU) | > %45 |
| **Tutunma** | 6 ay sonra hâlâ aktif | > %30 |
| **Tutunma** | Yıllık churn | < %20 |
| **Performans** | Time to Interactive (TTI) | < 3s (4G), < 5s (3G) |
| **Performans** | Offline muayene başarı oranı | %100 |
| **Performans** | Senkronizasyon hata oranı | < %0.5 |
| **Kalite** | Uygulama çökme oranı (Crash-free) | > %99.5 |
| **Kalite** | AI yanlış pozitif (varroa uyarısı) | < %10 |

### 8.3 İş Metrikleri (Business Metrics)

| Metrik | v1.0 | v1.5 | v2.0 |
|--------|------|------|------|
| **ARR (Yıllık Tekrarlayan Gelir)** | $0 (Free) | $50K | $500K |
| **Pro Dönüşüm Oranı** | N/A | %8 | %15 |
| **CAC (Müşteri Edinme Maliyeti)** | < $5 (organik/topuluk) | < $15 | < $30 |
| **LTV (Yaşam Boyu Değer)** | N/A | $120 | $400 |
| **LTV/CAC** | N/A | > 8x | > 13x |

---

## 9. Pazar Giriş Stratejisi (Go-to-Market)

### 9.1 Lansman Aşamaları

| Aşama | Süre | Hedef Kitle | Kanallar | Hedef |
|-------|------|-------------|----------|-------|
| **Alpha (İç)** | 4 hafta | Core team + 5 mentor arıcı | Doğru erişim | Temel akış çalışıyor |
| **Beta (Kapalı)** | 8 hafta | 50 arıcı (Diyarbakır, Şanlıurfa, Mardin, Batman) | WhatsApp grupları, yerli kooperatifler, mentor referans | PMF sinyalleri, hata düzeltme |
| **Soft Launch** | 4 hafta | 500 arıcı (Güneydoğu Anadolu) | Sosyal medya, arıcılık dernekleri, YouTube içerik | 1,000 aktif kovan |
| **Genel Lansman (v1.0)** | Sürekli | Türkiye geneli | SEO/İçerik, İşbirlikleri, App Store, Topluluk eventleri | 5,000 aktif kovan |

### 9.2 Büyüme Kanalları (Acquisition Channels)

| Kanal | Strateji | Ölçüm |
|-------|----------|-------|
| **Topluluk / Ağızdan Ağıza** | Mentor programı, "Arkadaş davet et" (Pro ay hediyesi), Yerel etkinlikler | Viral katsayı (k) > 0.3 |
| **İçerik / SEO** | "Diyarbakır arıcılığı takvimi", "Anadolu arısı varroa tedavisi", "Bal nemi nasıl ölçülür" blog yazıları | Organik trafik %60+ |
| **YouTube / Sosyal** | Kısa videolar: "60 saniyede muayene", "Petek döngüsü nasıl takip edilir" | Görüntüleme → Kayıt dönüşüm > %3 |
| **Dernek / Kooperatif İşbirlikleri** | Toplu lisans, eğitim seminerleri, veri paylaşımı protokolleri | Kurumsal hesaplar |
| **App Store / PWA** | "Arıcılık" "Kovan takip" "Bal üretimi" anahtar kelimeler | Store sıralama Top 10 |

### 9.3 Fiyatlandırma Stratejisi (Pricing)

| Plan | Özellikler | Fiyat (TL/Ay) | Fiyat (Yıllık) |
|------|------------|---------------|----------------|
| **Free (Her Zaman)** | Sınırsız kovan/apiary, Offline + Sync, Temel muayene, Petek döngüsü, Hasat/besleme/tedavi kayıtları, PDF rapor (aylık 3), Topluluk forum (salt okunur) | **Ücretsiz** | **Ücretsiz** |
| **Pro** | Free'in hepsi + AI Analiz (sınırsız), Gelişmiş Analytics, Tahmini verim, Öncelikli senkron, PDF rapor (sınırsız), Forum yazma/mentor, Veri dışa aktar (Excel/CSV), API erişimi (read-only) | 150 ₺ | 1.500 ₺ (%17 indirim) |
| **Enterprise** | Pro'nun hepsi + Çoklu kullanıcı (takım), Rol tabanlı erişim, Özel rapor şablonları, Öncelikli destek, SLA, Veri paylaşımı protokolü, Özel entegrasyon (IoT, ERP) | Özel teklif | Özel teklif |

> **Not:** Türkiye pazarı için TL fiyatlandırma, yurt dışı için PPP (Parite Satın Alma Gücü) düzeltmesi ile USD/EUR.

---

## 10. Rekabet Analizi (Competitive Landscape)

### 10.1 Doğrudan Rakipler

| Ürün | Güçlü Yönler | Zayıf Yönler | BeeMaster Farkı |
|------|--------------|--------------|-----------------|
| **Hive Tracks** (US) | Gelişmiş raporlar, ekibler, entegrasyonlar | Pahalı ($20+/ay), TR dil yok, offline zayıf, Türkiye flora/ıklim yok | Yerel, ücretsiz tier, offline-first, Anadolu arısı |
| **Apiary Book** (RO) | Mobil odaklı, basit | Analiz zayıf, AI yok, topluluk yok | AI + Bilim + Topluluk |
| **BeePlus / BeeSmart** (TR) | Türkçe, basit | Sadece liste, analiz yok, güncellenmiyor, veri kilidi | Modern stack, AI, açık veri |
| **Kooperatif Yazılımları** | Kurumsal | Kullanıcı deneyimi kötü, mobil yok, kapalı | Arıcı odaklı UX, PWA |

### 10.2 Dolaylı Rakipler (Substitutes)

- **WhatsApp + Not Defteri** — En yaygın, "ücretsiz", alışkanlık
- **Excel / Google Sheets** — Esnek, bilinen, ama mobilde kötü
- **Kağıt Defter** — Güvenilir, offline, ama arama/analiz yok

**BeeMaster Stratejisi:** Rakipleri "yok etme" yerine **kağıt/Excel/WhatsApp'tan geçişi en kolay yapan araç** olmak. Veri içe aktarma (CSV, fotoğraftan OCR), mentor desteği, öğrenme yolu.

---

## 11. Riskler ve Azaltma Stratejileri (Risks & Mitigation)

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| **Arıcılar dijital alışkanlık kazanamaz** | Orta | Yüksek | Çok basit UX, sesli giriş, mentor eşleştirme, eğitim videoları |
| **Offline senkronizasyon veri kaybına yol açar** | Düşük | Kritikal | Event sourcing, çakışma UI, test senaryoları (chaos engineering) |
| **AI yanlış tavsiye verir, kovan ölür** | Düşük | Kritikal | Şeffaf AI (kanıt göster), "Bu bir öneridir, karar size aittir" uyarısı, literatür referansı, lokal model öncelikli |
| **Veri gizliliği ihlali / KVKK cezası** | Düşük | Yüksek | RLS, şifreleme, veri minimumlaştırma, DPIA, yasal danışman |
| **Rakip (Hive Tracks) Türkiye'ye girer** | Orta | Orta | Yerel moat (flora, ırk, topluluk), hızlı iterasyon, ücretsiz tier |
| **Teknik borç birikir, geliştirme yavaşlar** | Yüksek | Yüksek | Strict TS, CI/CD, kod incelemesi, mimari karar kayıtları (ADR), refactoring sprintleri |
| **Para kazanma modeli işlemez** | Orta | Orta | Free tier her zaman kalır, Pro değer odaklı, Enterprise erken müşteri bulma |
| **Anadolu arısı verisi yetersiz kalır** | Orta | Orta | Akademik işbirlikleri, topluluk veri kampanyaları (opt-in), sentetik veri artırma |

---

## 12. Yol Haritası Özeti (Roadmap Summary)

| Sürüm | Dönem | Tema | Ana Teslimatlar |
|-------|-------|------|-----------------|
| **v1.0** | Q3 2026 | **"İlk Bal"** — Temel ürün, offline, AI v1 | Core modüller, PWA, Local AI, Sync, Beta lansman |
| **v1.5** | Q4 2026 | **"Akıllı Arıcı"** — AI + Topluluk | Remote AI (MCP), Forecast, Forum, Mentor, Push |
| **v2.0** | H1 2027 | **"AI-First Platform"** — Otonom ajanlar | BeeMind Core, Multi-agent, Marketplace, Kooperatif, IoT başlangıç |
| **v3.0** | 2028+ | **"Global Ağ"** — Uluslararası, Araştırma | Çoklu dil, Global flora, Akademik API, Sürdürülebilirlik raporu |

---

## 13. Stratejik Kararlar (Strategic Decisions — ADR Özeti)

| Karar | Seçim | Gerekçe |
|-------|-------|---------|
| **Platform** | PWA (Native app YOK) | Tek kod tabanı, app store onayı yok, offline-first, kolay dağıtım, iOS/Android/Desktop |
| **Veri Stratejisi** | Local-First (IndexedDB) + Cloud Sync (Supabase) | Veri sahipliği, offline, hız, maliyet kontrolü |
| **AI Stratejisi** | Hybrid: Local (Hermes/GGUF) + Remote (Claude/GPT via MCP) | Gizlilik + Güç dengesi, maliyet kontrolü, offline AI |
| **Backend** | Supabase (PostgreSQL + Auth + Realtime + Storage + Edge) | Hızlı geliştirme, RLS, ölçeklenebilirlik, açık kaynak alternatifi |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind + Zustand + TanStack Query | Modern ekosistem, performans, type safety, developer experience |
| **Mobil** | Responsive PWA + Bottom Nav (Mobile-first) | Native hissi, tek kod tabanı, install prompt |
| **Lisans** | MIT (Core) + Commercial (Enterprise) | Topluluk büyümesi + Sürdürülebilir iş modeli |
| **Dil** | Türkçe birincil, İngilizce ikincil | Hedef pazar Türkiye, global genişleme hazırlığı |

---

## 14. Öncelik Matrisi (Prioritization Framework — RICE)

| Özellik | Reach (Kaç kullanıcı) | Impact (Etki 1-5) | Confidence (Güven 1-5) | Effort (Hafta) | RICE Skoru | Öncelik |
|---------|----------------------|-------------------|------------------------|----------------|------------|---------|
| Offline + Sync | 5 (Tümü) | 5 | 5 | 4 | **31.25** | P0 |
| Inspection (Ses+Form) | 5 | 5 | 5 | 3 | **41.67** | P0 |
| Petek Döngüsü (Frame) | 4 | 5 | 4 | 2 | **40.00** | P0 |
| Varroa AI Risk | 4 | 5 | 4 | 3 | **26.67** | P0 |
| Dashboard + Uyarılar | 5 | 4 | 5 | 2 | **50.00** | P0 |
| Queen Tracking | 3 | 4 | 5 | 2 | **30.00** | P1 |
| Honey Harvest + Verim | 4 | 4 | 5 | 2 | **40.00** | P1 |
| Feeding + Stok | 3 | 3 | 5 | 2 | **22.50** | P1 |
| Inventory + Barkod | 2 | 3 | 4 | 3 | **10.67** | P2 |
| Forum + Topluluk | 3 | 4 | 3 | 4 | **9.00** | P2 (v1.5) |
| Forecast Agent | 3 | 5 | 3 | 5 | **9.00** | P2 (v1.5) |
| Mentor Eşleştirme | 2 | 4 | 3 | 4 | **6.00** | P3 (v1.5) |
| IoT Entegrasyon | 1 | 5 | 2 | 8 | **1.25** | P3 (v2.0+) |

---

## 15. Vizyonun Gerçekleşmesi İçin Gerekenler (Execution Requirements)

1. **Teknik Mükemmellik** — Offline-first senkronizasyon hatasız olmalı (kullanıcı güveninin temini)
2. **Bölge Verisi** — Diyarbakır/Anadolu flora, iklim, varroa verileri toplanmalı, doğrulanmalı
3. **Topluluk Bağı** — İlk 50 beta kullanıcısı "evangelist" olmalı, geribildirim döngüsü hızlı olmalı
4. **AI Güveni** — Yanlış uyarı sayısı minimumda tutulmalı, her öneri "neden" ile açıklanmalı
5. **Basitlik Disiplini** — Her yeni özellik "Bu 3 tıklamadan az mı?" testinden geçmeli
6. **Sürdürülebilir Büyüme** — Organik + topluluk kanallarıyle CAC düşük tutulmalı
7. **Veri Kalitesi** — Kullanıcı girdiği verinin kalitesini artırmak için şablonlar, doğrulama, AI yardımı

---

## 16. Kapanış: Neden BeeMaster AI, Neden Şimdi?

> **Arıcılık Türkiye'de hem kültürel miras hem de ekonomik aktivite.** Anadolu arısı (Apis mellifera anatoliaca) dünyanın en dayanıklı, verimli ve uyum sağlayan ırklarından biridir. Ancak modern tarım, iklim değişikliği, hastalıklar ve bilgi kırıntıları bu mirası tehdit ediyor.

> **BeeMaster AI**, teknolojiyi arıcının *hizmetine* koyarak — ona baskı yapmak yerine — bu dengenin korunmasına yardımcı olacak. **Bilim + Yerel Bilgelik + Yapay Zeka + Topluluk** bu dört direk üzerinde, Türkiye'den dünyaya örneği bir platform inşa edeceğiz.

> **Vizyon bu. Yol harita hazır. İş yapmaya başlıyoruz.** 🐝

---

*Bu doküman canlı bir belgedir. v1.0 lansmanından önce ve sonrası kullanıcı geri bildirimleri, pazar verileri ve teknik öğrenimlerle güncellenecektir. Tüm stratejik kararlar bu vizyona referans vererek alınmalıdır.*