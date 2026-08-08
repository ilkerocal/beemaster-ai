# BeeMaster AI — Yol Haritası (Roadmap) v1.0

> **Amaç:** Ürün geliştirme aşamalarını, milestone'ları, teslimatlar ve bağımlılıkları tanımlamak. Tüm ekip (geliştirme, tasarım, ürün, QA) bu haritaya göre planlama yapar.

---

## 1. Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BEEMASTER AI ROADMAP                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  v1.0 (Q3 2026)          v1.5 (Q4 2026)          v2.0 (H1 2027)          │
│  "İlk Bal"               "Akıllı Arıcı"           "AI-First Platform"      │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐      │
│  │ Core Modüller   │     │ Remote AI + MCP │     │ BeeMind Core    │      │
│  │ Offline-First   │     │ Forecast Agent  │     │ Multi-Agent     │      │
│  │ Local AI        │     │ Forum + Mentor  │     │ Marketplace     │      │
│  │ PWA + Sync      │     │ Push Notifs     │     │ Kooperatif/Ent. │      │
│  └─────────────────┘     └─────────────────┘     └─────────────────┘      │
│         │                       │                       │                  │
│         ▼                       ▼                       ▼                  │
│  5K Kovan / 500 Arıcı      50K Kovan / 5K Arıcı      200K Kovan / 25K Arıcı│
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Sürüm Detayları

### 2.1 v1.0 — "İlk Bal" (Q3 2026) — MVP

**Tema:** Temel ürün, offline-first, local AI, stabil senkronizasyon

| Hafta | Sprint | Odak | Teslimatlar |
|-------|--------|------|-------------|
| 1-2 | Sprint 0 | Kurulum & Altyapı | Vite + React + TS + Tailwind + ESLint + Prettier + Storybook + Supabase projesi |
| 3-4 | Sprint 1 | Kimlik & Veri | Auth (Email/Magic Link/OAuth), RLS, Apiary/Hive CRUD, IndexedDB (Dexie) |
| 5-6 | Sprint 2 | Muayene Çekirdeği | Muayene Sihirbazı (Ses/Form/Foto), STT (Whisper.cpp), AI Analiz (Local), Offline kaydet |
| 7-8 | Sprint 3 | Kovan + Çerçeve + Ana Arı | Kovan detayı, FrameGrid (Petek döngüsü), QueenCard, NFC/QR entegrasyonu |
| 9-10 | Sprint 4 | Hasat + Besleme + Hastalık | Hasat girişi, Besleme takvimi/planı, Varroa sayımı/tedavi, Envanter |
| 11-12 | Sprint 5 | Senkron & Çakışma | Push/Pull, Background Sync, Conflict Resolver UI, Media upload queue |
| 13-14 | Sprint 6 | AI v1 (Local) | InspectionAgent, DiseaseAgent (Rule-based), Risk skorları, Şeffaf açıklamalar |
| 15-16 | Sprint 7 | Dashboard & Raporlar | KPI kartlar, Uyarılar, Hızlı aksiyonlar, PDF rapor (Sezon özeti) |
| 17-18 | Sprint 8 | PWA Polish & Beta | Install prompt, Offline sayfası, Performance (<3s TTI), Accessibility (WCAG AA) |
| 19-20 | Sprint 9 | Beta Test & Launch | 50 arıcı beta (Diyarbakır/Şanlıurfa/Mardin), Bug fix, Sentry, Lansman |

**Başarı Kriterleri (Exit Criteria):**
- [ ] 50 beta arıcı, günde 10+ muayene
- [ ] Offline muayene %100 başarılı, senkron hata < %0.5
- [ ] AI analizi lokal < 3s, critical anomaly recall > %90
- [ ] Crash-free sessions > %99.5
- [ ] PWA install rate > %15 (beta kullanıcıları)

---

### 2.2 v1.5 — "Akıllı Arıcı" (Q4 2026)

**Tema:** Remote AI (MCP), Forecast, Topluluk, Push bildirimleri

| Sprint | Odak | Teslimatlar |
|--------|------|-------------|
| 1-2 | MCP Entegrasyonu | MCP Server'lar (Data, Analysis, Knowledge, External), Remote AI routing |
| 3-4 | ForecastAgent | Mevsim planı, Verim tahmini, Varvoa risk tahmini, Nakit akışı |
| 5-6 | Topluluk | Forum (CRUD, kategori, etiket), Bölge uyarıları, Mentor eşleştirme algoritması |
| 7-8 | Push & Bildirimler | VAPID + FCM, Haftalık özet, Acil uyarılar (Varroa, Hava, Besleme) |
| 9-10 | Gelişmiş Analitik | Benchmarking (Bölge/İrk/Kutu), Özel metrik editörü, Senaryo simülasyonu |
| 11-12 | Pro Features & Polish | Zamanlanmış raporlar, Özel şablonlar, API erişimi, Performance tuning |

**Yeni AI Yetenekleri:**
- HoneyAgent: Verim tahmini + Hasat zamanı optimizasyonu
- FeedingAgent: Protein/Şeker dengesi, Stok entegrasyonu
- QueenAgent: Supersedure tahmini, İrk önerisi

---

### 2.3 v2.0 — "AI-First Platform" (H1 2027)

**Tema:** BeeMind Core (Otonom ajanlar), Marketplace, Kooperatif/Enterprise, IoT başlangıcı

| Milestone | Teslimatlar |
|-----------|-------------|
| **M1: BeeMind Core** | Orchestrator + Planner + Reasoner, Multi-agent workflow, RLHF-lite learning loop |
| **M2: Marketplace** | Bal satışı (Kooperatif/Pazar), Kovan/Ana arı alım-satım, Ekipman pazarı, Escrow ödeme |
| **M3: Kooperatif/Enterprise** | Multi-tenant, RBAC (Owner/Admin/Manager/Worker), Özel rapor şablonları, SLA, API |
| **M4: IoT Entegrasyonu** | Kovan sensörleri (Ağırlık, Sıcaklık, Nem, Ses) → Real-time veri, MQTT/LoRaWAN |
| **M5: Gelişmiş AI** | AR Petek analizi, Ses analizi (Kraliçe yok/Sürgün), Fotoğraftan hastalık tanıma |

**Teknik Altyapı:**
- TimescaleDB (Zaman serisi verileri)
- Event-driven architecture (Kafka/CDC)
- Federated Learning (Cihazda eğitim, gradyan paylaşımı)
- GraphQL Federation (Mikro servisler)

---

### 2.4 v3.0 — "Global Arıcı Ağı" (2028+)

**Tema:** Uluslararası genişleme, Akademik ortaklık, Sürdürülebilirlik

| Özellik | Açıklama |
|---------|----------|
| **Çoklu Dil** | TR, EN, AR, FA, RU, ES (RTL desteği) |
| **Global Flora/İklim** | FAO/WorldClim verileri, Bölgesel takvimler |
| **Akademik API** | Anonimleştirilmiş veri setleri, Araştırmacılar için erişim |
| **Epidemiyoloji** | Bölgesel hastalık ısı haritası, Erken uyarı sistemi |
| **Sürdürülebilirlik** | Karbon ayak izi, Organik sertifikasyon desteği, Pollinator health index |
| **Policy Dashboard** | Tarım bakanlığı/kooperatifler için bölge yönetimi |

---

## 3. Bağımlılıklar ve Riskler

### 3.1 Kritik Bağımlılıklar

| Bağımlılık | Etkilenen Sürüm | Risk | Azaltma |
|------------|-----------------|------|---------|
| **Supabase Stabilitesi** | Tüm sürümler | Yüksek | Multi-region, PITR, Self-host option |
| **Whisper.cpp (STT)** | v1.0, v1.5 | Orta | Fallback: Manual form, Native Speech API |
| **MCP Standardizasyonu** | v1.5+ | Orta | Kendi protokol adaptörümüz |
| **AI Model Performansı** | v1.0+ | Yüksek | Rule-based fallback, Human-in-the-loop |
| **PWA iOS Desteği** | v1.0 | Orta | Native bridge (Capacitor) v1.5+ |

### 3.2 Teknik Borç Yönetimi

| Alan | Mevcut Durum | Plan |
|------|--------------|------|
| **Test Coverage** | %60 (hedef %80) | Her sprint %5 artır, Mutation testing |
| **Documentation** | Parçalı | Her feature PR'da docs zorunlu |
| **Design System** | v1.0 tamam | Storybook + Chromatic, Design token sync |
| **Error Handling** | Kısmi | Unified error boundary, Sentry entegrasyonu |
| **Logging** | Console | Structured logging (Datadog), Correlation IDs |

---

## 4. Kaynak Planlaması

### 4.1 Ekip Yapısı (v1.0 için)

| Rol | Sayısı | Sorumluluk |
|-----|--------|------------|
| **Product Lead** | 1 | Vizyon, öncelik, stakeholder management |
| **Tech Lead** | 1 | Mimari, code review, tech debt |
| **Full-Stack Dev** | 3 | Frontend + Edge Functions + DB |
| **Mobile/PWA Dev** | 1 | PWA, Capacitor, Native bridge |
| **AI/ML Engineer** | 1 | Local modeller, Rule engine, MCP |
| **UI/UX Designer** | 1 | Design system, Prototyping, Usability test |
| **QA Engineer** | 1 | Test automation, E2E, Accessibility |
| **DevOps** | 0.5 (paylaşlı) | CI/CD, Supabase, Monitoring |

### 4.2 Bütçe Tahmini (v1.0 - 6 ay)

| Kalem | Aylık (USD) | 6 Aylık | Not |
|-------|-------------|---------|-----|
| **Ekip (Maaş + Vergi)** | $25,000 | $150,000 | 7.5 FTE |
| **Supabase (Pro)** | $500 | $3,000 | DB, Auth, Edge, Storage |
| **Vercel/Netlify (Pro)** | $200 | $1,200 | Hosting, Edge, Analytics |
| **Cloudflare (CDN/WAF)** | $100 | $600 | DDoS, DNS, WAF |
| **AI Model Hosting** | $300 | $1,800 | GPU instances (fine-tuning) |
| **Monitoring (Sentry/Datadog)** | $200 | $1,200 | Error tracking, APM |
| **Domain/SSL/Tools** | $100 | $600 | Linear, Notion, Figma, GitHub |
| **Yedek/Contingency (%15)** | - | $23,800 | |
| **TOPLAM** | ~$26,400 | **~$182,000** | |

---

## 5. Ölçüm ve Başarı Metrikleri

### 5.1 Kuzey Yıldızı Metrikleri

| Metrik | v1.0 (6 ay) | v1.5 (12 ay) | v2.0 (24 ay) |
|--------|-------------|--------------|--------------|
| **Aktif Kovan** | 5,000 | 50,000 | 200,000 |
| **Haftalık Aktif Arıcı (WAU)** | 500 | 5,000 | 25,000 |
| **Ort. Muayene/Kovan/Yıl** | 8 | 12 | 16 |
| **Kovan Kaybı Azalması** | %15 | %30 | %40 |
| **Verim Artışı** | %10 | %20 | %25 |

### 5.2 Ürün Metrikleri

| Kategori | Metrik | Hedef |
|----------|--------|-------|
| **Aktivasyon** | Kayıt → 7 günde ilk muayene | > %60 |
| **Etkileşim** | Ortalama oturum süresi | > 8 dk |
| **Tutunma** | 1 ay retention (WAU/MAU) | > %45 |
| **Performans** | TTI (4G) | < 3s |
| **Kalite** | Crash-free sessions | > %99.5 |

---

## 6. İletişim ve Raporlama

| Ritüel | Sıklık | Katılımcılar | Çıktı |
|--------|--------|--------------|-------|
| **Daily Standup** | Günlük | Dev ekibi | Blocker'lar, günün odak |
| **Sprint Planning** | 2 haftada bir | Tüm ekip | Sprint backlog, capacity |
| **Sprint Review** | 2 haftada bir | Tüm ekip + Stakeholder | Demo, geri bildirim |
| **Retrospective** | 2 haftada bir | Dev ekibi | Action items (Start/Stop/Continue) |
| **Monthly Business Review** | Aylık | Lead'ler + Yönetim | Metrikler, bütçe, riskler |
| **Quarterly Planning** | 3 ayda bir | Tüm ekip | OKR güncelleme, yol haritası revizyonu |

---

## 7. Lansman Stratejisi (v1.0)

| Aşama | Süre | Hedef Kitle | Kanallar | KPI |
|-------|------|-------------|----------|-----|
| **Alpha** | 4 hafta | Core team + 5 mentor arıcı | Doğru erişim | Temel akış çalışıyor |
| **Beta (Kapalı)** | 8 hafta | 50 arıcı (Güneydoğu Anadolu) | WhatsApp grupları, Kooperatifler | PMF sinyalleri, NPS > 40 |
| **Soft Launch** | 4 hafta | 500 arıcı (Bölgesel) | Sosyal medya, Dernekler, YouTube | 1,000 aktif kovan |
| **Genel Lansman** | Sürekli | Türkiye geneli | SEO, İşbirkilikler, App Store, Etkinlikler | 5,000 aktif kovan (6 ay) |

---

## 8. Gelecek Revizyonlar

Bu yol haritası **canlı bir belgedir**. Aşağıdaki tetikleyicilerde revize edilir:

- [ ] Sprint Review çıktıları (2 haftada bir)
- [ ] Beta kullanıcı geri bildirimleri (haftalık)
- [ ] Teknik keşif sonuçları (AI model performansı, PWA sınırlamaları)
- [ ] Pazar değişimleri (Rakip lansmanı, Düzenleme değişiklikleri)
- [ ] Bütçe/ekip değişiklikleri

**Son Güncelleme:** 2026-07-19  
**Sahip:** Product Lead  
**Onaylayan:** Tech Lead + Yönetim