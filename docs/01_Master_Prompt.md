# BeeMaster AI — Master Prompt v1.0

> **Amaç:** Bu doküman, BeeMaster AI projesinin tüm yönlerini (vizyon, mimari, kod standartları, AI mimarisi, yol haritası) tek bir "kaynak gerçeği" (single source of truth) altında birleştirir. Geliştirme ekipleri (insan + AI ajanları), tasarımcılar, ürün yöneticileri ve QA bu dosyayı referans alarak tutarlı, ölçeklenebilir ve sürdürülebilir bir ürün inşa eder.

---

## 1. Proje Kimliği

| Alan | Değer |
|------|-------|
| **Proje Adı** | BeeMaster AI |
| **Slogan** | "Arıcılık Bilimi, Yapay Zeka ile Buluşuyor" |
| **Versiyon** | 1.0.0 (MVP) → 2.0 (AI-First Platform) |
| **Hedef Kitle** | Profesyonel arıcılar, hobi arıcıları, arıcılık kooperatifleri, tarım mühendisleri, akademik araştırmacılar |
| **Bölge** | Türkiye (Diyarbakır / Anadolu odaklı) → Global genişleme |
| **Dil** | Türkçe (birincil), İngilizce (ikincil) |
| **Platform** | PWA (Progressive Web App) — iOS, Android, Desktop, Offline-first |
| **Teknoloji Yığını** | React 18 + TypeScript + Vite + Tailwind CSS + IndexedDB + Service Worker + Supabase/PostgreSQL |
| **AI Altyapı** | Hermes Agent (local) + Claude Code / Codex (remote) + MCP (Model Context Protocol) |
| **Lisans** | MIT (açık kaynak çekirdek) + Ticari lisans (Enterprise modülleri) |

---

## 2. Çekirdek Felsefe (Core Principles)

### 2.1 Arıcı Önce (Beekeeper First)
Her özellik, her API, her UI kararı **"Bu arıcının işini kolaylaştırır mı, yoksa karmaşıklık mı ekler?"** sorusuyla değerlendirilir. Arıcı petek başında, eldeki çamur, duman, zaman baskısı altındadır. Arayüz parmakla, eldivenle, güneş ışığında, offline çalışmalıdır.

### 2.2 Veri Sahipliği (Data Sovereignty)
Arıcının verisi arıcına aittir. Yerel-first (local-first) mimari: veri önce cihazda, sonra bulutta. Kullanıcı verisini silme, dışa aktarma, taşıma hakkına her an sahiptir. Hiçbir telemetri izinsiz toplanmaz.

### 2.3 Bilimsel Doğruluk (Scientific Rigor)
Tavsiyeler, uyarılar, analitikler **kanıta dayalı** (evidence-based) olmalıdır. "Anadolu arısı için Ekim'de varroa tedavisi" gibi öneriler peer-review literatür, Türkiye Arıcılık Araştırma Enstitüleri verileri ve kullanıcının kendi geçmiş verisiyle doğrulanır.

### 2.4 AI Şeffaflığı (AI Transparency)
Her AI önerisinin **neden** yapıldığı açıklanabilir olmalı: "Bu uyarı, son 3 muayenede varroa sayısı 2→5→12 arttığı için, literaturoe göre %95 güvenle eşik aşıldığını gösteriyor." Kara kutu yok.

### 2.5 Topluluk Odaklı (Community-Centric)
Arıcılık bireysel bir iş değil, komşuluk, mentorluk, bölge paylaşımı işidir. Forum, mentor eşleştirme, bölge uyarıları, paylaşılan flora takvimi ürünün DNA'sındadır.

---

## 3. Ürün Vizyonu (Product Vision)

> **3 Yıl İçinde:** Türkiye'nin ve Orta Doğu'nun en çok kullanılan, en güvenilen, en akıllı arıcılık platformu olmak. 50.000+ aktif arıcı, 200.000+ kovan, günde 10.000+ muayene, AI ile %40 daha az kovan kaybı, %25 daha fazla bal verimi.

### 3.1 Ana Değer Önerileri (Value Props)

| Değer | Açıklama | Ölçüm (KPI) |
|-------|----------|-------------|
| **Akıllı Muayene** | Ses/Not → Yapılandırılmış veri, anomali tespiti, eylem önerisi | Muayene süresi %60 azalması, anomali yakalama %90+ |
| **Petek Yaşam Döngüsü** | Her çerçevenin doğum→bal→temizleme→yeniden kullanım takibi | Çerçeve ömrü %30 uzama, maliyet %20 düşüş |
| **Bölge Bazlı Flora & Hava** | Konuma özel çiçeklenme takvimi, hava durumu entegrasyonu | Bal dönemi tahmin hatası < 7 gün |
| **AI Danışman (BeeMind)** | Kovan bazlı, mevsim bazlı, veri odaklı tavsiyeler | Kovan kaybı %40 azalması (yıl içinde) |
| **Offline-First PWA** | İnternet olmasa da çalışır, senkronize olur | %100 offline kullanılabilirlik |
| **Topluluk & Mentorluk** | Deneyimli arıcılarla eşleşme, bölge uyarıları | Kullanıcı tutunma (retention) > %80 (yıllık) |

---

## 4. Mimari Genel Bakış (Architecture Overview)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BeeMaster AI PWA                         │
├─────────────────────────────────────────────────────────────────┤
│  Presentation Layer (React + Tailwind + Lucide Icons)           │
│  ├─ Views: Dashboard, Apiaries, Hives, Inspections, Reports... │
│  ├─ Components: Cards, Modals, Forms, Charts, BottomNav        │
│  └─ State: Zustand (UI) + TanStack Query (Server)              │
├─────────────────────────────────────────────────────────────────┤
│  Intelligence Layer (AI Brain + Agents)                         │
│  ├─ BeeMind Core: Reasoning, Memory, Planning                  │
│  ├─ Agents: Inspection, Queen, Disease, Honey, Feeding, Forecast│
│  ├─ MCP Bridge: Tools, Resources, Prompts                      │
│  └─ Local LLM: Hermes (quantized GGUF) / Remote: Claude/GPT    │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer (Local-First Sync)                                  │
│  ├─ IndexedDB (Dexie.js) — Primary storage                     │
│  ├─ Service Worker (Workbox) — Offline, Background Sync        │
│  ├─ Supabase/PostgreSQL — Cloud sync, multi-device, backup     │
│  └─ Event Store — Audit trail, time-travel, replay             │
├─────────────────────────────────────────────────────────────────┤
│  Infrastructure                                                  │
│  ├─ CI/CD: GitHub Actions → Vercel/Netlify                     │
│  ├─ Monitoring: Sentry, Plausible (privacy-first analytics)    │
│  ├─ Auth: Supabase Auth (Email/OAuth/Magic Link)               │
│  └─ File Storage: Supabase Storage (photos, audio, models)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. AI Mimarisi (AI Architecture) — "BeeMind"

### 5.1 Çok Katmanlı AI Yaklaşımı

```
┌────────────────────────────────────────────┐
│           Kullanıcı Arayüzü                 │
├────────────────────────────────────────────┤
│         Orchestration Agent (BeeMind)       │  ← Merkezi beyin, planlama, routing
├────────────────────────────────────────────┤
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌─────┐  │
│  │Inspection│ │ Queen  │ │Disease │ │Honey│  │  ← Domain Agents (uzman ajanlar)
│  │ Agent   │ │ Agent  │ │ Agent  │ │Agent│  │
│  └─────────┘ └────────┘ └────────┘ └─────┘  │
├────────────────────────────────────────────┤
│         Memory & Knowledge Layer            │  ← Episodic + Semantic + Procedural
│  ├─ User Memory (kovana özgü geçmiş)        │
│  ├─ Regional Knowledge (bölge flora, iklim) │
│  ├─ Scientific Corpus (literatür, RAG)      │
│  └─ Community Wisdom (anonimleştirilmiş)    │
├────────────────────────────────────────────┤
│           MCP (Model Context Protocol)      │  ← Tool/Resource/Prompt standardizasyonu
├────────────────────────────────────────────┤
│     Local LLM (Hermes) ↔ Remote LLMs        │  ← Hybrid inference
└────────────────────────────────────────────┘
```

### 5.2 Agent Sorumluluk Matrisi

| Agent | Alan | Girdi | Çıktı | Araçlar (MCP) |
|-------|------|-------|-------|---------------|
| **InspectionAgent** | Muayene analizi | Ses metni, foto, form verisi | Yapılandırılmış muayene, anomali listesi, aksiyon planı | `analyze_inspection`, `detect_anomalies`, `suggest_actions` |
| **QueenAgent** | Ana arı yönetimi | Yaş, ırk, performans, satış/alım | Değişim takvimi, performans skoru, ırk önerisi | `track_queen`, `predict_supersedure`, `recommend_strain` |
| **DiseaseAgent** | Hastalık/Parazit | Varroa sayısı, görsel bulgular, semptomlar | Risk skoru, tedavi protokolü, ilaç dozajı | `assess_varroa`, `diagnose_visual`, `prescribe_treatment` |
| **HoneyAgent** | Bal üretimi | Petek sayısı, ağırlık, çiçeklenme, hava | Tahmini verim, hasat zamanı, fiyat önerisi | `forecast_yield`, `optimize_harvest`, `market_price` |
| **FeedingAgent** | Besleme | Stok, mevsim, kovan gücü, hava | Şekerli su/paté programı, miktar, zamanlama | `calculate_feed`, `schedule_feeding`, `monitor_consumption` |
| **ForecastAgent** | Öngörü | Tüm veriler + hava + flora | Mevsim planı, risk haritası, kaynak tahsisi | `seasonal_plan`, `risk_map`, `resource_allocation` |

### 5.3 Bellek Mimarisi (Memory Architecture)

```typescript
// Episodic Memory — Kullanıcının yaşadığı olaylar (kovana özgü)
interface EpisodicMemory {
  hiveId: string;
  events: Episode[]; // inspection, treatment, harvest, queen_change, feeding
  embedding: Vector; // Semantic search için
  lastUpdated: Date;
}

// Semantic Memory — Bilgi tabanı (bölge, ırk, hastalık, flora)
interface SemanticMemory {
  region: string; // "Diyarbakır-Eğil"
  floraCalendar: FloraEvent[];
  climateNormals: MonthlyClimate[];
  diseasePrevalence: DiseaseStats[];
  bestPractices: Practice[];
}

// Procedural Memory — Nasıl yapılır (prosedürler)
interface ProceduralMemory {
  procedures: Procedure[]; // "Varroa tedavisi nasıl yapılır", "Ana arı değiştirme"
  versions: Map<string, ProcedureVersion>; // Güncellemeler
}

// Working Memory — Aktif bağlam (o anki muayene, sohbet)
interface WorkingMemory {
  context: InspectionContext | null;
  activeHive: Hive | null;
  recentActions: Action[];
  userIntent: Intent;
}
```

### 5.4 MCP Entegrasyon Planı

BeeMaster AI, **Model Context Protocol (MCP)** standartlarını kullanarak AI ajanlarına araç, kaynak ve şablon sağlar.

#### 5.4.1 MCP Sunucuları (MCP Servers)

| Sunucu | Açıklama | Araçlar (Tools) | Kaynaklar (Resources) |
|--------|----------|-----------------|----------------------|
| `beemaster-data` | Kovan/Apiary CRUD | `create_hive`, `update_hive`, `list_inspections` | `hive://{id}`, `apiary://{id}` |
| `beemaster-analysis` | Analitik motoru | `calculate_varroa_rate`, `forecast_honey`, `detect_trends` | `analysis://varroa/{hiveId}` |
| `beemaster-knowledge` | Bilgi tabanı RAG | `search_literature`, `get_treatment_protocol`, `get_flora_calendar` | `knowledge://disease/varroa`, `knowledge://flora/{region}` |
| `beemaster-external` | Dış servisler | `get_weather`, `get_market_price`, `send_notification` | `weather://{lat},{lon}`, `market://honey/{region}` |

#### 5.4.2 MCP İstemci (Client) Yapılandırması

```json
{
  "mcpServers": {
    "beemaster-data": {
      "command": "node",
      "args": ["dist/mcp/data-server.js"],
      "env": { "DATABASE_URL": "..." }
    },
    "beemaster-analysis": {
      "command": "python",
      "args": ["-m", "mcp.analysis_server"],
      "env": { "MODEL_PATH": "models/beemind-embedding.gguf" }
    },
    "beemaster-knowledge": {
      "command": "node",
      "args": ["dist/mcp/knowledge-server.js"],
      "env": { "VECTOR_DB": "chroma", "CORPUS_PATH": "data/corpus" }
    }
  }
}
```

---

## 6. Veritabanı Mimarisi (Database Architecture)

### 6.1 Temel Prensipler

- **UUIDv7** (timestamp-ordered) birincil anahtarlar
- **Soft delete** (deleted_at) — veri asla silinmez
- **Row Level Security (RLS)** — Supabase ile çok kiracılı (multi-tenant) güvenlik
- **Event Sourcing** — Her mutasyon bir event'tir, tam denetim izi (audit trail)
- **Çoklu şema** — `public` (core), `analytics` (OLAP), `ai` (embeddings, agent state)

### 6.2 Ana Tablo Şeması (Conceptual)

```sql
-- Apiaries (Arı Üssü)
CREATE TABLE apiaries (
  id UUIDv7 PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  location GEOGRAPHY(POINT) NOT NULL,
  address TEXT,
  elevation_m INT,
  microclimate JSONB, -- {aspect, slope, wind_exposure, water_distance}
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Hives (Kovanlar)
CREATE TABLE hives (
  id UUIDv7 PRIMARY KEY,
  apiary_id UUID REFERENCES apiaries(id),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL, -- "Kovan-01", "Anadolu-3"
  status hive_status DEFAULT 'active', -- active, weak, dead, sold, merged
  strain bee_strain, -- anatolian, caucasian, carniolan, italian, hybrid
  queen_id UUID REFERENCES queens(id),
  box_type box_type, -- langstroth, dadant, layens, flow, top_bar
  frame_count INT DEFAULT 10,
  position_in_apiary INT, -- sıralama
  nfc_tag TEXT UNIQUE, -- NFC/QR etiket
  installed_at DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Frames (Çerçeveler) — Petek yaşam döngüsü
CREATE TABLE frames (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  position INT NOT NULL, -- 1-10 (kovan içi sıra)
  frame_type frame_type, -- brood, honey, pollen, foundation, empty
  foundation_type foundation_type, -- wax, plastic, foundationless
  status frame_status, -- in_use, extracted, cleaning, stored, retired
  cycles_completed INT DEFAULT 0, -- kaç kez bal alınıp yeniden kullanıldı
  last_extracted_at DATE,
  wax_age_months INT, -- petek yaşı (ay)
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Inspections (Muayeneler)
CREATE TABLE inspections (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  user_id UUID REFERENCES auth.users(id),
  inspected_at TIMESTAMPTZ NOT NULL,
  duration_seconds INT,
  weather_snapshot JSONB, -- {temp, humidity, wind, condition}
  
  -- Kovan durumu
  strength colony_strength, -- very_weak, weak, moderate, strong, very_strong
  temperament temperament, -- calm, moderate, defensive, aggressive
  queen_status queen_status, -- seen, not_seen, cells_present, virgin, missing
  
  -- Petek durumu (yüzde)
  brood_pattern_score INT, -- 1-10
  brood_area_pct INT, -- 0-100
  honey_area_pct INT,
  pollen_area_pct INT,
  drone_area_pct INT,
  empty_area_pct INT,
  
  -- Hastalık / Parazit
  varroa_count INT, -- alkol yıkama / pudra şekeri sayımı
  varroa_method varroa_method, -- alcohol_wash, sugar_shake, sticky_board, visual
  disease_signs disease_sign[], -- AFB, EFB, chalkbrood, nosema, etc.
  
  -- Notlar / AI
  voice_transcript TEXT,
  ai_summary TEXT,
  ai_anomalies JSONB, -- [{type, severity, confidence, evidence}]
  ai_recommendations JSONB, -- [{action, priority, reasoning, due_date}]
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Queens (Ana Arılar)
CREATE TABLE queens (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  strain bee_strain,
  birth_date DATE,
  source queen_source, -- bred, purchased, swarm, supersedure, emergency
  supplier TEXT,
  cost_try DECIMAL(10,2),
  marked_color marking_color, -- white, yellow, red, green, blue (yıl renk kodu)
  status queen_status, -- active, superseded, dead, sold, missing
  performance_score DECIMAL(3,2), -- 0.00-1.00 AI hesaplamalı
  superseded_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Honey Harvests (Bal Hasatları)
CREATE TABLE honey_harvests (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  apiary_id UUID REFERENCES apiaries(id),
  user_id UUID REFERENCES auth.users(id),
  harvested_at DATE NOT NULL,
  frames_harvested INT,
  weight_kg DECIMAL(6,2) NOT NULL,
  moisture_pct DECIMAL(4,2), -- bal nemi %
  honey_type honey_type, -- flower, pine, chestnut, thyme, mixed, monofloral
  flora_source TEXT[], -- dominant flora from calendar/analysis
  price_per_kg_try DECIMAL(10,2),
  sold_amount_kg DECIMAL(6,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feeding Records (Besleme Kayıtları)
CREATE TABLE feedings (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  user_id UUID REFERENCES auth.users(id),
  fed_at TIMESTAMPTZ NOT NULL,
  feed_type feed_type, -- sugar_syrup_1_1, sugar_syrup_2_1, fondant, pollen_patty, protein_powder, honey
  amount_kg DECIMAL(5,2) NOT NULL,
  method feeding_method, -- top_feeder, frame_feeder, entrance_feeder, dribble
  reason feeding_reason, -- winter_prep, spring_build, dearth, queen_rearing, stimulation
  consumed_kg DECIMAL(5,2),
  cost_try DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Treatments (Tedaviler)
CREATE TABLE treatments (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID REFERENCES hives(id),
  user_id UUID REFERENCES auth.users(id),
  started_at DATE NOT NULL,
  ended_at DATE,
  treatment_type treatment_type, -- varroa_oxalic_vapor, varroa_oxalic_dribble, varroa_formic, varroa_apivar, varroa_apistan, nosema_fumagillin, afb_shake, other
  product_name TEXT,
  active_ingredient TEXT,
  dosage TEXT, -- "2g/kovan", "15ml/litre", "1 strip/5 frames"
  application_method TEXT,
  pre_treatment_varroa INT,
  post_treatment_varroa INT,
  efficacy_pct DECIMAL(5,2), -- hesaplanan etkinlik
  cost_try DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Inventory (Envanter)
CREATE TABLE inventory_items (
  id UUIDv7 PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category inventory_category, -- equipment, consumable, medication, feed, tool, protective, extraction, packaging
  unit unit_type, -- piece, kg, liter, meter, box, pack
  current_stock DECIMAL(10,2) DEFAULT 0,
  min_stock DECIMAL(10,2) DEFAULT 0,
  unit_cost_try DECIMAL(10,2),
  supplier TEXT,
  expiry_date DATE,
  location TEXT, -- depo, araç, apiary adı
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Community / Forum
CREATE TABLE forum_posts (
  id UUIDv7 PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  region_id UUID REFERENCES regions(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  post_type forum_post_type, -- question, observation, alert, harvest_report, technique, marketplace
  tags TEXT[],
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Regions (Bölgeler — Flora/Hava/Topluluk)
CREATE TABLE regions (
  id UUIDv7 PRIMARY KEY,
  name TEXT NOT NULL, -- "Diyarbakır - Eğil"
  parent_id UUID REFERENCES regions(id), -- hiyerarşi: ülke > il > ilçe > mahalle
  level region_level, -- country, province, district, neighborhood
  polygon GEOGRAPHY(POLYGON),
  centroid GEOGRAPHY(POINT),
  flora_calendar JSONB, -- ay bazlı çiçeklenme verisi
  climate_normals JSONB, -- aylık ortalama sıcaklık, yağış, nem
  varroa_prevalence JSONB, -- bölgesel varroa istatistikleri
  active_beekeepers INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI Agent State (Agent Durumları)
CREATE TABLE ai_agent_states (
  id UUIDv7 PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  hive_id UUID REFERENCES hives(id),
  agent_type agent_type, -- inspection, queen, disease, honey, feeding, forecast
  state JSONB NOT NULL, -- agent'ın working memory'si
  embedding VECTOR(1536), -- semantic search için
  version INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Event Store (Denetim İzı / Replay)
CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  aggregate_id UUID NOT NULL, -- hive_id, apiary_id, user_id
  aggregate_type TEXT NOT NULL, -- 'hive', 'apiary', 'inspection', 'queen'
  event_type TEXT NOT NULL, -- 'HiveCreated', 'InspectionRecorded', 'QueenReplaced'
  payload JSONB NOT NULL,
  metadata JSONB, -- {userAgent, ip, correlationId, causationId}
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_events_aggregate ON events(aggregate_id, aggregate_type);
CREATE INDEX idx_events_created ON events(created_at DESC);
```

### 6.3 İndeksleme ve Performans Stratejisi

| Tablo | Critcal Indexes | Neden |
|-------|-----------------|-------|
| `inspections` | `(hive_id, inspected_at DESC)`, `(user_id, inspected_at DESC)` | Kovan/ kullanıcı geçmişi sorguları |
| `hives` | `(apiary_id, position_in_apiary)`, `(user_id, status)` | Apiary listeleme, filtreleme |
| `frames` | `(hive_id, position)`, `(hive_id, status)` | Kovan içi çerçeve haritası |
| `honey_harvests` | `(apiary_id, harvested_at DESC)`, `(user_id, harvested_at DESC)` | Verim raporları |
| `ai_agent_states` | `(hive_id, agent_type)`, `(user_id, agent_type)` | Agent state yükleme |
| `events` | `(aggregate_id, aggregate_type, created_at DESC)` | Event replay, audit |

### 6.4 Vektör Veritabanı (Embeddings)

- **ChromaDB** (local) / **pgvector** (Supabase) — 1536 boyut (OpenAI text-embedding-3-small) veya 1024 (BGE-M3)
- İçerik: Muayene notları, literatür özetleri, forum gönderileri, AI özetleri
- Kullanım: RAG (Retrieval-Augmented Generation) için bağlamsal arama

---

## 7. API Mimarisi (API Architecture)

### 7.1 REST + GraphQL Hibrit

| Katman | Teknoloji | Kullanım Alanı |
|--------|-----------|----------------|
| **REST** | Supabase Auto-REST + Custom Edge Functions | CRUD, Auth, Realtime, Storage |
| **GraphQL** | Apollo Server (Edge) | Karmaşık sorgular, AI bağlam toplama, mobil optimize |
| **WebSocket** | Supabase Realtime | Canlı muayene paylaşımı, mentor bildirimleri, topluluk |
| **gRPC** | Internal (Agent ↔ Agent) | Yüksek performanslı agent iletişimi |

### 7.2 API Versiyonlama

- URL tabanlı: `/api/v1/`, `/api/v2/`
- Geriye uyumluluk: Minimum 18 ay
- Deprecation header: `Sunset`, `Deprecation`, `Link`

### 7.3 Temel Endpoint'ler (v1)

```
# Apiaries
GET    /api/v1/apiaries                    # Liste (sayfalı, filtreli)
POST   /api/v1/apiaries                    # Oluştur
GET    /api/v1/apiaries/:id                # Detay
PATCH  /api/v1/apiaries/:id                # Güncelle
DELETE /api/v1/apiaries/:id                # Soft delete

# Hives
GET    /api/v1/apiaries/:apiaryId/hives
POST   /api/v1/apiaries/:apiaryId/hives
GET    /api/v1/hives/:id
PATCH  /api/v1/hives/:id
POST   /api/v1/hives/:id/frames            # Çerçeve ekle/güncelle
GET    /api/v1/hives/:id/frames

# Inspections
GET    /api/v1/hives/:hiveId/inspections
POST   /api/v1/hives/:hiveId/inspections
GET    /api/v1/inspections/:id
PATCH  /api/v1/inspections/:id
POST   /api/v1/inspections/:id/analyze     # AI analizi tetikle
GET    /api/v1/inspections/:id/analysis    # AI analiz sonucu

# Queens
GET    /api/v1/hives/:hiveId/queens
POST   /api/v1/hives/:hiveId/queens
PATCH  /api/v1/queens/:id

# Honey
GET    /api/v1/apiaries/:apiaryId/harvests
POST   /api/v1/apiaries/:apiaryId/harvests
GET    /api/v1/hives/:hiveId/harvests

# Feeding
GET    /api/v1/hives/:hiveId/feedings
POST   /api/v1/hives/:hiveId/feedings

# Treatments
GET    /api/v1/hives/:hiveId/treatments
POST   /api/v1/hives/:hiveId/treatments

# Inventory
GET    /api/v1/inventory
POST   /api/v1/inventory
PATCH  /api/v1/inventory/:id

# AI / Agents
POST   /api/v1/ai/inspection/analyze       # InspectionAgent
POST   /api/v1/ai/queen/advise             # QueenAgent
POST   /api/v1/ai/disease/assess           # DiseaseAgent
POST   /api/v1/ai/honey/forecast           # HoneyAgent
POST   /api/v1/ai/feeding/plan             # FeedingAgent
POST   /api/v1/ai/forecast/seasonal        # ForecastAgent
GET    /api/v1/ai/memory/:hiveId           # Agent state getir

# Community
GET    /api/v1/forum/posts
POST   /api/v1/forum/posts
GET    /api/v1/regions/:id/flora-calendar
GET    /api/v1/regions/:id/climate
GET    /api/v1/regions/:id/alerts

# Sync / Offline
POST   /api/v1/sync/push                   # Client → Server
GET    /api/v1/sync/pull?since=:timestamp  # Server → Client
GET    /api/v1/sync/conflicts              # Çakışma listesi
```

### 7.4 Hata Formatı (RFC 9457 / Problem Details)

```json
{
  "type": "https://api.beemaster.ai/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Inspection data validation failed",
  "instance": "/api/v1/inspections/abc-123",
  "errors": [
    { "field": "varroa_count", "code": "min_value", "message": "Varroa sayısı negatif olamaz" },
    { "field": "inspected_at", "code": "future_date", "message": "Muayene tarihi gelecekte olamaz" }
  ]
}
```

### 7.5 Rate Limiting & Quotas

| Tier | Requests/dakika | Requests/gün | AI Çağrıları/gün |
|------|-----------------|--------------|------------------|
| Free | 60 | 1,000 | 10 |
| Pro | 300 | 50,000 | 200 |
| Enterprise | 1,000 | Unlimited | 2,000 |

---

## 8. Mobil-First & Offline-First Mimarisi

### 8.1 PWA Gereksinimleri

| Özellik | Durum | Detay |
|---------|-------|-------|
| **Web App Manifest** | ✅ Zorunlu | `manifest.json` — name, icons, start_url, display: standalone |
| **Service Worker** | ✅ Zorunlu | Workbox — NetworkFirst (API), StaleWhileRevalidate (assets) |
| **Offline Sayfası** | ✅ Zorunlu | `/offline.html` — cached shell + IndexedDB verisi |
| **Background Sync** | ✅ Zorunlu | Mutation queue → online olduğunda flush |
| **Push Notifications** | 🔄 Planlı | VAPID + Supabase Edge Functions |
| **Install Prompt** | ✅ Zorunlu | Custom install banner (iOS Safari workaround) |

### 8.2 Service Worker Stratejisi

```javascript
// sw.js — Workbox yapılandırması
const CACHE_NAME = 'beemaster-v1.0.0';

// NetworkFirst — API çağrıları (veri her zaman güncel olmalı)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 24 * 60 * 60 }),
      new BackgroundSyncPlugin('api-mutations', { maxRetentionTime: 24 * 60 })
    ]
  })
);

// StaleWhileRevalidate — Static assets (JS, CSS, images, fonts)
registerRoute(
  ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })]
  })
);

// CacheFirst — Model dosyaları (GGUF, embeddings)
registerRoute(
  ({ url }) => url.pathname.startsWith('/models/'),
  new CacheFirst({
    cacheName: 'models-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 })]
  })
);

// Offline fallback
setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});
```

### 8.3 IndexedDB Şeması (Dexie.js)

```typescript
// db.ts
import { Dexie } from 'dexie';

export class BeeMasterDB extends Dexie {
  apiaries!: Dexie.Table<Apiary, string>;
  hives!: Dexie.Table<Hive, string>;
  frames!: Dexie.Table<Frame, string>;
  inspections!: Dexie.Table<Inspection, string>;
  queens!: Dexie.Table<Queen, string>;
  harvests!: Dexie.Table<HoneyHarvest, string>;
  feedings!: Dexie.Table<Feeding, string>;
  treatments!: Dexie.Table<Treatment, string>;
  inventory!: Dexie.Table<InventoryItem, string>;
  forumPosts!: Dexie.Table<ForumPost, string>;
  regions!: Dexie.Table<Region, string>;
  aiAgentStates!: Dexie.Table<AIAgentState, string>;
  syncQueue!: Dexie.Table<SyncOperation, string>; // Offline mutasyon kuyruğu
  media!: Dexie.Table<MediaFile, string>; // Fotoğraf, ses blob'ları

  constructor() {
    super('BeeMasterDB');
    this.version(1).stores({
      apiaries: 'id, user_id, name, location, created_at',
      hives: 'id, apiary_id, user_id, name, status, queen_id, nfc_tag, created_at',
      frames: 'id, hive_id, position, frame_type, status, cycles_completed',
      inspections: 'id, hive_id, user_id, inspected_at, created_at, synced',
      queens: 'id, hive_id, strain, birth_date, status, created_at',
      harvests: 'id, hive_id, apiary_id, user_id, harvested_at, weight_kg',
      feedings: 'id, hive_id, user_id, fed_at, feed_type, amount_kg',
      treatments: 'id, hive_id, user_id, started_at, treatment_type',
      inventory: 'id, user_id, name, category, current_stock',
      forumPosts: 'id, user_id, region_id, post_type, created_at',
      regions: 'id, name, level, parent_id',
      aiAgentStates: 'id, user_id, hive_id, agent_type, updated_at',
      syncQueue: 'id, table, operation, payload, timestamp, retry_count',
      media: 'id, entity_type, entity_id, mime_type, created_at'
    });
  }
}

export const db = new BeeMasterDB();
```

### 8.4 Senkronizasyon Motoru (Sync Engine)

```typescript
// sync-engine.ts
interface SyncOperation {
  id: string;
  table: string;
  operation: 'create' | 'update' | 'delete';
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
  serverId?: string; // Sunucudan dönen ID (create sonrası)
}

class SyncEngine {
  private db: BeeMasterDB;
  private isOnline: boolean = navigator.onLine;
  private syncInProgress: boolean = false;

  constructor(db: BeeMasterDB) {
    this.db = db;
    this.setupListeners();
  }

  private setupListeners() {
    window.addEventListener('online', () => this.flushQueue());
    window.addEventListener('offline', () => { this.isOnline = false; });
    
    // Periyodik senkronizasyon (her 5 dakikada bir online ise)
    setInterval(() => { if (this.isOnline) this.flushQueue(); }, 5 * 60 * 1000);
  }

  async queueOperation(op: Omit<SyncOperation, 'id' | 'retryCount'>) {
    const id = crypto.randomUUID();
    await this.db.syncQueue.add({ ...op, id, retryCount: 0, timestamp: Date.now() });
    if (this.isOnline) this.flushQueue();
  }

  async flushQueue() {
    if (this.syncInProgress || !this.isOnline) return;
    this.syncInProgress = true;

    const pending = await this.db.syncQueue
      .orderBy('timestamp')
      .limit(50)
      .toArray();

    for (const op of pending) {
      try {
        await this.executeOperation(op);
        await this.db.syncQueue.delete(op.id);
      } catch (err) {
        if (op.retryCount >= 5) {
          // Dead letter queue'a taşı, kullanıcıya bildir
          await this.moveToDeadLetter(op, err);
        } else {
          await this.db.syncQueue.update(op.id, { retryCount: op.retryCount + 1 });
        }
      }
    }

    // Pull: Sunucudan değişiklikleri çek
    await this.pullChanges();
    
    this.syncInProgress = false;
  }

  private async executeOperation(op: SyncOperation) {
    const endpoint = `/api/v1/sync/push`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${await this.getToken()}` },
      body: JSON.stringify([op])
    });
    if (!res.ok) throw new Error(`Sync failed: ${res.status}`);
    const result = await res.json();
    if (op.operation === 'create' && result.serverId) {
      // Local ID'yi Server ID ile eşleştir (referansları güncelle)
      await this.remapLocalIds(op.table, op.payload.id, result.serverId);
    }
  }

  private async pullChanges() {
    const lastSync = await this.getLastSyncTimestamp();
    const res = await fetch(`/api/v1/sync/pull?since=${lastSync}`, {
      headers: { 'Authorization': `Bearer ${await this.getToken()}` }
    });
    const { changes, serverTime } = await res.json();
    
    for (const change of changes) {
      await this.applyServerChange(change);
    }
    await this.setLastSyncTimestamp(serverTime);
  }
}
```

### 8.5 Çakışma Çözümleme (Conflict Resolution)

| Senaryo | Strateji |
|---------|----------|
| Aynı alan, farklı cihazlarda güncellendi | **Last-Writer-Wins** (timestamp bazlı) + kullanıcı bildirimi |
| Aynı kovan için çakışan muayene | **Merge** — her iki muayene de ayrı kayıt olarak tutulur, AI birleştirir |
| Silinen kayıt güncellendi | **Resurrect** — silme işlemi iptal, güncelleme uygulanır |
| Çakışma çözülemiyor | **Manual** — kullanıcıya "Çakışma Çözücü" UI'sı sunulur |

---

## 9. Tasarım Sistemi (Design System) — "Honeycomb UI"

### 9.1 Renk Paleti (Dark-First, WCAG AA)

```css
:root {
  /* Brand — Bal Sarısı */
  --color-honey-50:  #fffbeb;
  --color-honey-100: #fef3c7;
  --color-honey-200: #fde68a;
  --color-honey-300: #fcd34d;
  --color-honey-400: #fbbf24;  /* Primary Brand */
  --color-honey-500: #f59e0b;  /* Hover */
  --color-honey-600: #d97706;
  --color-honey-700: #b45309;
  --color-honey-800: #92400e;
  --color-honey-900: #78350f;
  --color-honey-950: #451a03;

  /* Neutral — Koyu Arka Plan (Dark Default) */
  --color-neutral-0:   #ffffff;
  --color-neutral-50:  #fafafa;
  --color-neutral-100: #f5f5f5;
  --color-neutral-200: #e5e5e5;
  --color-neutral-300: #d4d4d4;
  --color-neutral-400: #a3a3a3;
  --color-neutral-500: #737373;
  --color-neutral-600: #525252;
  --color-neutral-700: #404040;
  --color-neutral-800: #262626;
  --color-neutral-900: #171717;
  --color-neutral-950: #0a0a0a;

  /* Semantic */
  --color-bg-primary:      var(--color-neutral-950);
  --color-bg-secondary:    var(--color-neutral-900);
  --color-bg-tertiary:     var(--color-neutral-800);
  --color-bg-card:         var(--color-neutral-900);
  --color-bg-card-hover:   var(--color-neutral-800);
  --color-bg-input:        var(--color-neutral-800);
  --color-border-primary:  var(--color-neutral-700);
  --color-border-focus:    var(--color-honey-400);
  --color-text-primary:    var(--color-neutral-50);
  --color-text-secondary:  var(--color-neutral-400);
  --color-text-muted:      var(--color-neutral-500);
  --color-text-inverse:    var(--color-neutral-950);
  --color-brand-primary:   var(--color-honey-400);
  --color-brand-hover:     var(--color-honey-300);
  --color-brand-active:    var(--color-honey-500);
  --color-success:         #22c55e;
  --color-warning:         #f59e0b;
  --color-error:           #ef4444;
  --color-info:            #3b82f6;

  /* Glassmorphism */
  --glass-bg: rgba(23, 23, 23, 0.7);
  --glass-border: rgba(255, 255, 255, 0.08);
  --glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  /* Spacing — 8px Base */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;  --space-4: 16px;
  --space-5: 20px;  --space-6: 24px;  --space-7: 28px;  --space-8: 32px;
  --space-10: 40px; --space-12: 48px; --space-16: 64px; --space-20: 80px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --text-xs: 0.75rem;    --text-sm: 0.875rem;  --text-base: 1rem;
  --text-lg: 1.125rem;   --text-xl: 1.25rem;   --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;  --text-4xl: 2.25rem;  --text-5xl: 3rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 12px 28px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 24px rgba(251, 191, 36, 0.3);

  /* Transitions */
  --transition-fast: 120ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;

  /* Z-Index */
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-modal: 300;
  --z-popover: 400;
  --z-toast: 500;
  --z-tooltip: 600;
}
```

### 9.2 Tipografi

| Kullanım | Font | Boyut | Weight | Line Height |
|----------|------|-------|--------|-------------|
| Display / Hero | Inter | 3rem / 2.25rem | 700 | 1.1 |
| H1 (Sayfa Başlığı) | Inter | 1.875rem | 700 | 1.2 |
| H2 (Bölüm) | Inter | 1.5rem | 600 | 1.3 |
| H3 (Kart Başlığı) | Inter | 1.25rem | 600 | 1.3 |
| Body Large | Inter | 1.125rem | 400 | 1.6 |
| Body (Varsayılan) | Inter | 1rem | 400 | 1.6 |
| Body Small | Inter | 0.875rem | 400 | 1.5 |
| Caption / Label | Inter | 0.75rem | 500 | 1.4 |
| Code / Data | JetBrains Mono | 0.875rem | 400 | 1.5 |

### 9.3 İkon Sistemi — Lucide React

- **Paket:** `lucide-react` (tree-shakable, 300+ ikon)
- **Boyut:** 16px (inline), 20px (buton), 24px (nav), 32px (boş durum)
- **Stroke Width:** 2 (consistent)
- **Kullanım:** `<HiveIcon className="w-5 h-5 text-honey-400" />`

### 9.4 Bileşen Kütüphanesi (Component Library)

| Bileşen | Dosya | Varyantlar | Durum |
|---------|-------|------------|-------|
| `Button` | `components/ui/Button.tsx` | primary, secondary, ghost, danger, outline | ✅ |
| `Card` | `components/ui/Card.tsx` | default, bordered, glass, interactive | ✅ |
| `Modal` | `components/ui/Modal.tsx` | default, fullscreen, bottom-sheet | ✅ |
| `BottomNav` | `components/ui/BottomNav.tsx` | 4-5 item, badge support | ✅ |
| `InspectionCard` | `components/domain/InspectionCard.tsx` | compact, detailed | ✅ |
| `HiveCard` | `components/domain/HiveCard.tsx` | grid, list, map-pin | ✅ |
| `FrameCounter` | `components/domain/FrameCounter.tsx` | inline chips (muayene modalında) | ✅ |
| `VarroaBadge` | `components/domain/VarroaBadge.tsx` | green/yellow/red, count, trend | ✅ |
| `FloraCalendar` | `components/domain/FloraCalendar.tsx` | monthly, weekly, list | 🔄 |
| `ChartCard` | `components/ui/ChartCard.tsx` | line, bar, area, donut (Recharts) | ✅ |
| `DataTable` | `components/ui/DataTable.tsx` | sortable, filterable, virtualized | 🔄 |
| `FormField` | `components/ui/FormField.tsx` | input, select, textarea, date, photo, voice | ✅ |
| `Toast` | `components/ui/Toast.tsx` | success, error, warning, info, action | ✅ |
| `Tooltip` | `components/ui/Tooltip.tsx` | top, bottom, left, right, delay | ✅ |
| `Dropdown` | `components/ui/Dropdown.tsx` | single, multi, searchable | ✅ |
| `Tabs` | `components/ui/Tabs.tsx` | horizontal, vertical, animated | ✅ |
| `Accordion` | `components/ui/Accordion.tsx` | single, multiple, animated | ✅ |
| `Avatar` | `components/ui/Avatar.tsx` | image, initials, status ring | ✅ |
| `Badge` | `components/ui/Badge.tsx` | default, dot, count, removable | ✅ |
| `Progress` | `components/ui/Progress.tsx` | linear, circular, indeterminate | ✅ |
| `Skeleton` | `components/ui/Skeleton.tsx` | text, card, table, chart | ✅ |

### 9.5 Animasyon & Mikro Etkileşimler

```css
/* Genel geçişler */
* { transition: color var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast); }

/* Kart hover */
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-brand-primary);
}

/* Buton basılma */
.btn:active { transform: scale(0.98); }

/* Bottom nav öğe aktivasyon */
.nav-item.active::before {
  content: '';
  position: absolute;
  top: -2px; left: 50%; transform: translateX(-50%);
  width: 24px; height: 3px;
  background: var(--color-brand-primary);
  border-radius: var(--radius-full);
  animation: slideIn 200ms ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-50%) scaleX(0.5); }
  to { opacity: 1; transform: translateX(-50%) scaleX(1); }
}

/* Toast gir/çık */
@keyframes toastIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastOut { to { opacity: 0; transform: translateY(-20px); } }

.toast-enter { animation: toastIn 300ms ease-out; }
.toast-exit { animation: toastOut 200ms ease-in; }

/* Skeleton shimmer */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton { background: linear-gradient(90deg, var(--color-neutral-800) 25%, var(--color-neutral-700) 50%, var(--color-neutral-800) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
```

---

## 10. Modül Detayları (Module Specifications)

> Her modül `docs/05_Modules/` altında ayrı dosyada detaylandırılmıştır. Burada özet matris:

| Modül | Dosya | Temel Sorumluluk | Ana Ekranlar |
|-------|-------|------------------|--------------|
| **Dashboard** | `Dashboard.md` | Genel bakış, uyarılar, hızlı aksiyonlar, mevsim özeti | Ana sayfa, Özet kartları, Hava/Flofa widget'ı |
| **Apiaries** | `Apiaries.md` | Arı üssü CRUD, harita, mikroiklim, taşıma planı | Liste, Harita, Detay, Yeni üs wizard |
| **Hives** | `Hives.md` | Kovan yaşam döngüsü, NFC/QR, kutu tipi, konum | Grid/Liste, Detay, Çerçeve haritası, Geçmiş |
| **Inspections** | `Hive_Inspections.md` | Muayene girişi (ses/form/foto), AI analizi, anomali | Yeni muayene wizard, Geçmiş, Karşılaştır |
| **Frames** | `Frames.md` | Petek döngüsü, yaş, temizleme, depolama, NFC | Kovan içi çerçeve haritası, Döngü takibi |
| **Queens** | `Queens.md` | Ana arı pedigrisi, performans, değişim takvimi, ırk | Liste, Detay, Değişim planlayıcı, Satın alma |
| **Honey** | `Honey.md` | Hasat, nem, tip, fiyat, satış, stok, paketleme | Hasat girişi, Verim raporu, Pazar entegrasyonu |
| **Feeding** | `Feeding.md` | Şekerli su/paté programı, stok, maliyet, tüketim | Takvim, Planlayıcı, Envanter bağlantılı |
| **Diseases** | `Diseases.md` | Varroa/nosema/AFB takibi, tedavi protokolleri, ilaç | Risk haritası, Tedavi girişi, Etkinlik analizi |
| **Inventory** | `Inventory.md` | Malzeme, ilaç, besin, ambalaj — stok, uyarı, barkod | Liste, Düşük stok, Harcama analizi, Tedarikçi |
| **Reports** | `Reports.md` | PDF/Excel raporlar, sezon özeti, vergi/kooperatif | Şablonlar, Zamanlanmış, Paylaşım |
| **Analytics** | `Analytics.md` | Trendler, tahminler, karşılaştırma, benchmark | Dashboard analitik, Kovan bazlı, Bölge bazlı |

---

## 11. Güvenlik ve Gizlilik (Security & Privacy)

### 11.1 Veri Koruma

- **KVKK / GDPR Uyumlu** — Veri işleyici sözleşmesi, kullanıcı onayı, silme hakkı
- **Şifreleme** — TLS 1.3 (transfer), AES-256 (rest, Supabase yönetir)
- **RLS (Row Level Security)** — Her tablo `user_id` ile izole, `auth.uid()` politikası
- **API Keys** — Hashed storage, scoping (read/write/admin), rotation

### 11.2 Kimlik Doğrulama

| Yöntem | Durum | Detay |
|--------|-------|-------|
| Email + Şifre | ✅ | bcrypt, rate limit, breach check (HaveIBeenPwned) |
| Magic Link | ✅ | 15 dk geçerli, tek kullanımlık |
| OAuth (Google, Apple) | ✅ | Supabase Auth |
| 2FA (TOTP) | 🔄 Planlı | Authenticator app, backup codes |
| Biometric (WebAuthn) | 🔄 Planlı | Passkeys, device-bound |

### 11.3 AI Güvenliği

- **Prompt Injection Koruması** — System prompt sabit, user input sanitize, delimiter escaping
- **Veri Sızıntısı Önleme** — PII (kişisel veri) AI'a gönderilmeden maskelenir (kovana özgü ID → hash)
- **Model İzolasyonu** — Local LLM (Hermes) hassas veriyi cihazdan çıkmaz; remote sadece anonimleştirilmiş özet alır
- **Audit Log** — Her AI çağrısı `events` tablosuna kaydedilir

---

## 12. Kodlama Standartları (Coding Standards)

### 12.1 Genel Prensipler

| Kural | Açıklama |
|-------|----------|
| **TypeScript Strict** | `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true` |
| **ESLint + Prettier** | `eslint.config.js` (flat config), `prettier.config.js` — CI'da `lint` ve `format` kontrolü |
| **Path Aliases** | `@/` → `src/`, `@/components`, `@/hooks`, `@/lib`, `@/types`, `@/db` |
| **Barrel Exports** | `index.ts` dosyaları ile `import { Button, Card } from '@/components/ui'` |
| **Colocation** | Bileşene özel hook/util/test aynı klasörde (`Button.tsx`, `Button.test.tsx`, `useButton.ts`) |
| **Named Exports** | Default export YOK — her zaman `export function/const/type` |
| **Interfaces over Types** | Object shape'ler için `interface`, union/primitive için `type` |

### 12.2 React / Frontend Kuralları

```typescript
// ✅ DOĞRU — Functional, TypeScript, named export
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-honey-400 text-neutral-950 hover:bg-honey-300 active:bg-honey-500',
    secondary: 'bg-neutral-800 text-neutral-50 hover:bg-neutral-700',
    ghost: 'bg-transparent hover:bg-neutral-800',
    danger: 'bg-error-500 text-neutral-50 hover:bg-error-600',
    outline: 'border border-neutral-600 hover:bg-neutral-800',
  }[variant];

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2.5',
  }[size];

  return (
    <button
      className={cn(baseClasses, variantClasses, sizeClasses, className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {!loading && leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}

// ❌ YANLIŞ — default export, any, inline styles, className string concat
export default function Button(props: any) {
  return <button style={{background: 'yellow'}} className="btn " + props.className>{props.children}</button>
}
```

### 12.3 State Management

| Katman | Kütüphane | Kullanım |
|--------|-----------|----------|
| **UI State** | Zustand | Modal açık/kapalı, sidebar, theme, form taslakları |
| **Server State** | TanStack Query (React Query) | Tüm API verisi, cache, invalidation, optimistic updates |
| **Form State** | React Hook Form + Zod | Validation, submit, dirty tracking |
| **Local DB** | Dexie.js (IndexedDB) | Offline veri, media, sync queue |
| **AI State** | Custom Context + useReducer | Agent working memory, streaming responses |

### 12.4 Test Stratejisi

| Test Türü | Araç | Hedef Coverage | Ne Zaman |
|-----------|------|----------------|----------|
| **Unit** | Vitest | %80+ (utils, hooks, pure functions) | Her PR |
| **Component** | Vitest + React Testing Library | %70+ (UI bileşenleri) | Her PR |
| **Integration** | Vitest + MSW | API entegrasyonları, sync motoru | Nightly |
| **E2E** | Playwright | Critical paths (muayene, hasat, sync) | Release öncesi |
| **Visual** | Playwright + Pixelmatch | Design system bileşenleri | Release öncesi |
| **A11y** | axe-core | WCAG AA — her sayfa | CI'da |

---

## 13. Yol Haritası (Roadmap)

### 13.1 v1.0 — MVP (Q3 2026) — "İlk Bal"

| Hafta | Odak | Teslimat |
|-------|------|----------|
| 1-2 | Proje kurulumu, CI/CD, Design System | Vite + React + TS + Tailwind + ESLint + Prettier + Storybook |
| 3-4 | Auth, Database (Supabase), RLS | Kayıt/giriş, apiary/hive CRUD, offline DB (Dexie) |
| 5-6 | Inspection Modülü (Core) | Form + Ses + Foto, IndexedDB kaydet, Service Worker |
| 7-8 | Hive + Frame + Queen Modülleri | Kovan detayı, çerçeve haritası (inline chips), ana arı takibi |
| 9-10 | Honey + Feeding + Disease | Hasat girişi, besleme takvimi, varroa sayımı + tedavi |
| 11-12 | Sync Engine + Conflict Resolution | Push/Pull, background sync, çakışma UI |
| 13-14 | AI Brain v1 (Local) | InspectionAgent (on-device), Varroa risk, basit öneriler |
| 15-16 | Dashboard + Reports + PWA Polish | Özet ekran, PDF rapor, install prompt, offline sayfası |
| 17-18 | Beta Test + Bug Fix + Perf | 50 arıcı beta, Sentry, performans (< 3s TTI), erişilebilirlik |
| 19-20 | **Launch v1.0** | Production deploy, dokümantasyon, topluluk lansmanı |

### 13.2 v1.5 — "Akıllı Arıcı" (Q4 2026)

- Remote AI entegrasyonu (Claude/GPT via MCP) — karmaşık analizler için
- ForecastAgent — mevsim planı, bal tahmini, risk haritası
- Community Forum + Bölge uyarıları + Mentor eşleştirme
- Gelişmiş Analytics — trendler, benchmark, karşılaştırma
- Push bildirimler (tedavi hatırlatması, hava uyarısı, forum cevabı)

### 13.3 v2.0 — "AI-First Platform" (H1 2027)

- **BeeMind Core** — Tam otonom planlama, çok ajanlı orkestrasyon
- **Multi-modal AI ile öğrenme** — Kullanıcı geri bildirimleriyle model iyileştirme (RLHF-lite)
- **Marketplace** — Bal satışı, kovan/arı alım-satım, ekipman pazarı
- **Kooperatif/Enterprise** — Çoklu kullanıcı, rol tabanlı erişim, API erişimi
- **IoT Entegrasyonu** — Kovan altındaki sensörler (ağırlık, sıcaklık, nem, ses) → Real-time veri

### 13.4 v3.0 — "Global Arıcı Ağı" (2028+)

- Çoklu dil (İngilizce, Arapça, Farsça, Rusça, İspanyolca)
- Uluslararası flora/iklim veritabanları entegrasyonu
- Akademik araştırma ortaklığı (veri paylaşımı, anonimleştirilmiş)
- Arı sağlığı erken uyarı sistemi (bölgesel epidemiyoloji)
- Karbon ayak izi / sürdürülebilirlik raporlaması

---

## 14. Gelecek Özellikler (Future Features — Backlog)

| Özellik | Öncelik | Karmaşıklık | Bağımlılık |
|---------|---------|-------------|------------|
| **IoT Kovan Sensörleri** (Weight, Temp, Humidity, Sound) | Yüksek | Çok Yüksek | Donanım seçimi, MQTT/LoRaWAN, edge computing |
| **Drone / UAV Entegrasyonu** (Arı üssü haritalama, flora analizi) | Orta | Yüksek | DJI SDK, görüntü işleme, GIS |
| **AR Muayene** (Petek üzerindeki yumurta/larva/bebek arı sayımı) | Düşük | Çok Yüksek | WebXR, on-device CV modeli (YOLO/RT-DETR) |
| **Ses Analizi** (Arı sesinden kovan sağlığı — queenless, swarming, stress) | Orta | Yüksek | Audio classification modeli (AST, BEATs) |
| **Genetik / ırk analizi** (Fotoğraftan ırk tanıma, hibrit oranı) | Düşük | Yüksek | CNN classifier, büyük etiketli veri seti |
| **Otomatik Varroa Sayımı** (Fotoğraftan pudra şekeri/alkol yıkama sayımı) | Yüksek | Yüksek | Object detection (YOLOv8/11), segmentasyon |
| **Akıllı Besleme Makinesi Entegrasyonu** (Otomatik dozaj, takip) | Düşük | Orta | MQTT, protokol standardizasyonu |
| **Blockchain / Web3** (Bal izlenebilirliği, NFT petek sahipliği) | Düşük | Orta | IPFS, smart contracts, cüzdan entegrasyonu |
| **Sesli Asistan** (Hey BeeMaster, "Kovan 3 nasıl?") | Orta | Yüksek | Wake word, STT, TTS, on-device (Whisper.cpp + Piper) |
| **Çoklu Kovan Toplu İşlem** (100 kovan için tek seferde tedavi/besleme planı) | Yüksek | Orta | Batch API, background jobs