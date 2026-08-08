# BeeMaster AI — Arıcılık Bilimi, Yapay Zeka ile Buluşuyor

> **Türkiye'nin ve çevresel coğrafyanın en kapsamlı, offline-first, AI-first arıcılık platformu.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg)](https://reactjs.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8.svg)](https://web.dev/progressive-web-apps/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg)](https://supabase.com/)

---

## 🎯 Vizyon

> **"Türkiye'nin ve çevresel coğrafyanın her arıcısının cebinde, offline çalışan, yapay zeka destekli, bilimsel doğrulukta bir danışmanı olsun. Arıcılık sezgisinden veri odaklı yönetime, kovan kaybından sürdürülebilir verime geçişi sağlasın."**

---

## 🚀 Özellikler

### 📱 **Mobil-First PWA (Progressive Web App)**
- **Offline-First:** İntegral olmadan %100 çalışır, bağlantı gelince senkronize olur
- **Native Hissi:** iOS/Android/Desktop tek kod tabanında
- **Performans:** < 3s TTI (4G), < 120KB initial bundle (gzipped)
- **Erişilebilirlik:** WCAG AA, ekran okuyucu desteği, sesli komut

### 🤖 **Hibrit AI Mimarisi (BeeMind)**
| Katman | Teknoloji | Kullanım |
|--------|-----------|----------|
| **Local (On-Device)** | Hermes (GGUF), Whisper.cpp, YOLOv8n | Muayene analizi, STT, Varroa sayımı, Offline çalışma |
| **Remote (Cloud)** | Claude/GPT via MCP | Karmaşık planlama, Tahmin, Literatür sentеzi |
| **Rule Engine** | TypeScript | Şeffaf kararlar, Eşikler, Güvenlik kontrolleri |

### 🐝 **Alan Özel Modüller**
| Modül | Açıklama |
|-------|----------|
| **Muayene Sihirbazı** | Ses/Form/Foto → 60 sn'de yapılandırılmış veri + AI anomali/öneri |
| **Petek Yaşam Döngüsü** | Her çerçeve: Doğum→Bal→Temizlik→Yeniden kullanım (Benzersiz!) |
| **Ana Arı Yönetimi** | Pedigree, Performans skoru, Değişim takvimi, İrk önerisi |
| **Varroa/Hastalık** | Sayım yöntemleri, Risk skoru, Tedavi protokolü, Etkinlik takibi |
| **Bal Verimi** | Hasat, Nem, Flora, Fiyat, Bölgesel benchmark |
| **Besleme Planlayıcı** | Şekerli su/Paté/Protein, Stok entegrasyonu, Maliyet takibi |
| **Envanter + Barkod** | Malzeme/İlaç/Besin, Min stok uyarısı, NFC/QR |

### 🌍 **Bölge Odaklı (Anadolu/Anadolu Arısı)**
- **Flora Takvimi:** Geven (Nisan), Kekik (Haziran), Ada çayı (Eylül) — Eğil/Diyarbakır verisi
- **İklim Normalleri:** Aylık ortalama sıcaklık, yağış, nem
- **Varroa Prevalansı:** Bölgesel istatistikler, Eşik değerleri
- **Yerli İrk:** Anadolu arısı (Apis mellifera anatoliaca) için optimize edilmiş modeller

### 🔒 **Veri Sahipliği & Güvenlik**
- **Local-First:** Veri önce cihazda (IndexedDB), sonra bulutta (Supabase)
- **KVKK/GDPR:** Silme, dışa aktarma, taşıma hakkı, onay tabanlı paylaşım
- **RLS (Row Level Security):** Her tablo `user_id` ile izole
- **Şeffaf AI:** Her önerinin "neden"i açıklanabilir (Kanıt + Referans)

---

## 📁 Proje Yapısı

```
BeeMaster-AI/
├── README.md                           # Bu dosya
├── docs/
│   ├── 01_Master_Prompt.md             # Tek kaynak gerçeği (30-50 sayfa)
│   ├── 02_Product_Vision.md            # Ürün vizyonu, hedef kitle, pazar girişi
│   ├── 03_UI_UX_Design_System.md       # Honeycomb UI tasarım sistemi
│   ├── 04_User_Flows.md                # Tüm kullanıcı akışları (15+ akış)
│   ├── 05_Modules/                     # 12 modül detay spec'i
│   │   ├── Dashboard.md
│   │   ├── Apiaries.md
│   │   ├── Hives.md
│   │   ├── Hive_Inspections.md
│   │   ├── Frames.md
│   │   ├── Queens.md
│   │   ├── Honey.md
│   │   ├── Feeding.md
│   │   ├── Diseases.md
│   │   ├── Inventory.md
│   │   ├── Reports.md
│   │   └── Analytics.md
│   ├── 06_AI_Brain.md                  # BeeMind mimarisi, bellek, MCP, öğrenme
│   ├── 07_AI_Agents.md                 # 6 uzman ajan detaylı spec
│   ├── 08_Database_Architecture.md     # PostgreSQL şema, RLS, Materialized Views
│   ├── 09_API_Architecture.md          # REST + GraphQL + Realtime + Sync
│   ├── 10_Mobile_First.md              # PWA, Offline, Native bridge
│   ├── 11_Offline_Mode.md              # IndexedDB, Sync engine, Conflict resolution
│   ├── 12_Analytics.md                 # Genel analitik, Benchmarking, Tahmin
│   ├── 13_Security.md                  # KVKK/GDPR, Auth, Şifreleme, Incident response
│   ├── 14_Coding_Standards.md          # TS strict, React patterns, Test stratejisi
│   ├── 15_Roadmap.md                   # v1.0 → v3.0 yol haritası
│   └── 16_Future_Features.md           # IoT, AR, Drone, Federated Learning, vb.
├── src/                                # Uygulama kodu (Geliştirme aşamasında)
│   ├── components/                     # UI bileşenleri (Design System)
│   ├── pages/                          # Route bileşenleri
│   ├── hooks/                          # Custom React hooks
│   ├── store/                          # Zustand + TanStack Query
│   ├── lib/                            # Utilities, API client, Crypto
│   ├── db/                             # Dexie.js IndexedDB wrapper
│   ├── agents/                         # AI Agent implementations
│   ├── mcp/                            # MCP client/servers
│   └── styles/                         # Tailwind + CSS variables
├── public/                             # Static assets, manifest, sw.js
├── supabase/                           # Migrations, Edge Functions, Seed data
├── tests/                              # Vitest + Playwright
├── .github/workflows/                  # CI/CD pipelines
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── eslint.config.js
```

---

## 🛠 Teknoloji Yığını

| Katman | Seçim | Gerekçe |
|--------|-------|---------|
| **Frontend** | React 18 + TypeScript + Vite | Modern, hızlı, type-safe |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first, Dark-first, Design token sync |
| **State** | Zustand (UI) + TanStack Query (Server) | Ayrım net, cache/invalidation otomatik |
| **Database** | Supabase (PostgreSQL) + IndexedDB (Dexie) | RLS, Realtime, Offline-first sync |
| **Auth** | Supabase Auth (Email/Magic Link/OAuth) | MFA ready, Row-level security entegrasyonu |
| **AI Local** | Hermes (GGUF), Whisper.cpp, YOLOv8n (ONNX) | Offline, Gizlilik, Hız |
| **AI Remote** | MCP (Model Context Protocol) + Claude/GPT | Standartlaştırılmış tool/resource/prompt |
| **PWA** | Workbox (Service Worker) | NetworkFirst (API), StaleWhileRevalidate (Assets) |
| **Testing** | Vitest (Unit) + Playwright (E2E) | Hızlı, güvenilir, CI entegre |
| **CI/CD** | GitHub Actions → Vercel/Netlify | Preview deploy, Automated testing |
| **Monitoring** | Sentry (Error) + Plausible (Analytics) | Privacy-first, Performans |

---

## 🚀 Hızlı Başlangıç (Geliştirme)

### Ön Koşullar
- Node.js 20+ (LTS)
- pnpm 9+ (veya npm/yarn)
- Supabase CLI (`brew install supabase/tap/supabase`)
- Git

### Kurulum

```bash
# 1. Repository klonla
git clone https://github.com/your-org/BeeMaster-AI.git
cd BeeMaster-AI

# 2. Bağımlılıkları yükle
pnpm install

# 3. Supabase local başlat
supabase start

# 4. Environment variables
cp .env.example .env.local
# .env.local dosyasını düzenle (SUPABASE_URL, ANON_KEY, etc.)

# 5. Geliştirme sunucusunu başlat
pnpm dev

# 6. Tarayıcıda aç
open http://localhost:5173
```

### Kullanışlı Komutlar

```bash
# TypeScript type check
pnpm typecheck

# Lint + Format
pnpm lint
pnpm format

# Testler
pnpm test           # Unit (Vitest)
pnpm test:e2e       # E2E (Playwright)
pnpm test:coverage  # Coverage raporu

# Build
pnpm build          # Production build
pnpm preview        # Build önizleme

# Supabase
supabase db reset   # Migration'ları yeniden çalıştır
supabase functions serve  # Edge functions local
```

---

## 📚 Dokümantasyon

Bu repodaki **`docs/`** klasörü, BeeMaster AI'nin **tam ürün dokümantasyonudur**. GitHub'a doğrudan yüklenebilir, wiki'ye dönüştürülebilir veya statik site (VitePress/Docusaurus) olarak yayınlanabilir.

| Doküman | Amaç | Hedef Kitle |
|---------|------|-------------|
| **01_Master_Prompt** | Tek kaynak gerçeği, tüm mimari kararlar | Tüm ekip |
| **02_Product_Vision** | Vizyon, hedef kitle, pazar stratejisi | PM, Founder, Yatırımcı |
| **03_UI_UX_Design_System** | Tokenlar, Bileşenler, Animasyonlar, A11y | Tasarımcılar, Frontend |
| **04_User_Flows** | 15+ kullanıcı akışı, Kenar senaryolar | PM, Tasarım, QA |
| **05_Modules/** | 12 modülün detaylı fonksiyonel spec | Geliştiriciler, QA |
| **06_AI_Brain** | BeeMind mimarisi, Bellek, MCP, Öğrenme | AI/ML Engineer |
| **07_AI_Agents** | 6 uzman ajan (Inspection, Queen, Disease, Honey, Feeding, Forecast) | AI Engineer |
| **08_Database_Architecture** | Şema, RLS, Index, Materialized Views, Event Store | Backend, DBA |
| **09_API_Architecture** | REST + GraphQL + Realtime + Sync endpoints | Full-stack, Mobile |
| **10_Mobile_First** | PWA, Offline, Native bridge, Performans | Frontend, Mobile |
| **11_Offline_Mode** | IndexedDB, Sync Engine, Conflict Resolution | Full-stack |
| **12_Analytics** | Genel analitik, Benchmarking, Tahmin modelleri | Data, PM |
| **13_Security** | KVKK/GDPR, Auth, Şifreleme, Incident Response | Security, Legal |
| **14_Coding_Standards** | TS Strict, React Patterns, Test Stratejisi | Tüm geliştiriciler |
| **15_Roadmap** | v1.0 → v3.0 milestones, Bağımlılıklar, Bütçe | Liderlik, PM |
| **16_Future_Features** | IoT, AR, Drone, Federated Learning, Web3 | R&D, Strateji |

---

## 🗺 Yol Haritası Özeti

| Sürüm | Dönem | Tema | Ana Teslimatlar |
|-------|-------|------|-----------------|
| **v1.0** | Q3 2026 | **"İlk Bal"** | Core modüller, Offline-first, Local AI, PWA, Beta lansman |
| **v1.5** | Q4 2026 | **"Akıllı Arıcı"** | Remote AI (MCP), Forecast, Forum, Mentor, Push |
| **v2.0** | H1 2027 | **"AI-First Platform"** | BeeMind Core, Marketplace, Kooperatif/Enterprise, IoT başlangıç |
| **v3.0** | 2028+ | **"Global Ağ"** | Çoklu dil, Global flora, Akademik API, Sürdürülebilirlik |

---

## 🤝 Katkıda Bulunma

1. **Issue açın** — Hata bildirimi, öneri, soru
2. **Forklayın** — Kendi dalınızda çalışın
3. **Standartlara uyun** — `pnpm lint && pnpm typecheck` geçmeli
4. **Test yazın** — Yeni özellik için unit + e2e test
5. **PR açın** — Açıklayıcı başlık, ilişki issue numarası

### Kod Standartları (Özet)
- **TypeScript Strict** — `any` yasak, interface > type
- **Named Exports** — Default export yok
- **Colocation** — Bileşene özel hook/test aynı klasörde
- **Barrel Exports** — `index.ts` ile `import { A, B } from '@/components/ui'`
- **Conventional Commits** — `feat:`, `fix:`, `docs:`, `refactor:`, `test:`

---

## 📄 Lisans

**MIT License** — Açık kaynak çekirdek, ticari modüller (Enterprise) ayrı lisans.

```
MIT License

Copyright (c) 2026 BeeMaster AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 İletişim ve Destek

- **GitHub Issues:** [Hata bildirimi, Özellik isteği](https://github.com/your-org/BeeMaster-AI/issues)
- **Discussions:** [Topluluk soruları, Showcase](https://github.com/your-org/BeeMaster-AI/discussions)
- **Email:** hello@beemaster.ai
- **Website:** https://beemaster.ai (Yakında)

---

## 🙏 Teşekkürler

- **Anadolu Arısı (Apis mellifera anatoliaca)** — Bu projeye ilham veren, Türkiye'nin hazinesi
- **TÜBİTAK, ÇOMÜ, Ondokuz Mayıs Üniversitesi** — Arıcılık bilimi verileri ve protokoller
- **COLOSS, Apimondia** — Uluslararası standartlar ve en iyi uygulamalar
- **Açık Kaynak Topluluğu** — React, Tailwind, Supabase, Dexie, Workbox, Hermes, Whisper.cpp, YOLO ve binlerce başka proje

---

> **"Arıcılık bilimi, yapay zeka ile buluşuyor. Her kovan, bir veri noktası. Her arıcı, bir bilim insanı."** 🐝

**BeeMaster AI — Sürdürülebilir arıcılık için akıllı ortak.**