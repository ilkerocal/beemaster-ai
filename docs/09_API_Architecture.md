# BeeMaster AI — API Mimarisi (API Architecture) v1.0

> **Amaç:** REST + GraphQL hibrit API tasarımı, versioning, hata standartları, rate limiting, authentication, realtime, offline sync endpoints.

---

## 1. API Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BEEMASTER AI API                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │
│  │   REST      │  │  GraphQL    │  │  WebSocket  │  │   gRPC      │       │
│  │  (Supabase) │  │  (Apollo)   │  │ (Realtime)  │  │  (Internal) │       │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘       │
│         │                │                │                │              │
│         └────────────────┼────────────────┼────────────────┘              │
│                          ▼                ▼                               │
│                 ┌─────────────────────┐                                  │
│                 │   API Gateway       │                                  │
│                 │   (Kong/Envoy)      │                                  │
│                 │   - Auth            │                                  │
│                 │   - Rate Limit      │                                  │
│                 │   - Logging         │                                  │
│                 │   - Transform       │                                  │
│                 └──────────┬──────────┘                                  │
│                            ▼                                             │
│                 ┌─────────────────────┐                                  │
│                 │  Supabase Platform  │                                  │
│                 │  - PostgREST        │                                  │
│                 │  - Auth             │                                  │
│                 │  - Realtime         │                                  │
│                 │  - Storage          │                                  │
│                 │  - Edge Functions   │                                  │
│                 └─────────────────────┘                                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Teknoloji Seçimleri

| Katman | Teknoloji | Gerekçe |
|--------|-----------|---------|
| **REST** | Supabase Auto-REST (PostgREST) | Sıfır kod CRUD, RLS entegrasyonu, anlık şema yansıması |
| **GraphQL** | Apollo Server (Edge Functions) | Karmaşık sorgular, mobil optimize, AI context fetching |
| **Realtime** | Supabase Realtime (PostgreSQL WAL) | Canlı muayene paylaşımı, mentor bildirimleri, topluluk |
| **gRPC** | Internal (Agent ↔ Agent) | Yüksek performanslı ajan iletişimi, streaming |
| **Auth** | Supabase Auth (JWT + RLS) | Email/Magic Link/OAuth, MFA, row-level security |
| **Gateway** | Kong / Envoy | Rate limiting, logging, transformation, canary deploy |

---

## 2. REST API (v1)

### 2.1 Base URL & Versioning

```
Base URL: https://api.beemaster.ai/v1
Alternative: https://<project-ref>.supabase.co/rest/v1 (Direct PostgREST)

Versioning: URL path (/v1/, /v2/)
Deprecation: Sunset header, 18 ay minimum notice
```

### 2.2 Authentication

```
Authorization: Bearer <JWT_TOKEN>
Apikey: <SUPABASE_ANON_KEY> (Public endpoints için)

Token claims:
{
  "sub": "user-uuid",
  "role": "authenticated",
  "email": "user@example.com",
  "app_metadata": { "plan": "pro", "plan_expires": "2026-12-31" }
}
```

### 2.3 Temel Endpoint'ler

#### Apiaries (Arı Üssleri)
```
GET    /api/v1/apiaries                    # Liste (sayfalı, filtreli)
POST   /api/v1/apiaries                    # Oluştur
GET    /api/v1/apiaries/:id                # Detay
PATCH  /api/v1/apiaries/:id                # Güncelle
DELETE /api/v1/apiaries/:id                # Soft delete

GET    /api/v1/apiaries/:id/hives          # Üstteki kovanlar
GET    /api/v1/apiaries/:id/harvests       # Üstteki hasatlar
GET    /api/v1/apiaries/:id/inspections    # Üstteki muayeneler
GET    /api/v1/apiaries/:id/analytics      # Üstteki analitik özet
POST   /api/v1/apiaries/:id/move-plan      # Taşıma planı oluştur
```

#### Hives (Kovanlar)
```
GET    /api/v1/hives                       # Liste (filtre: apiary_id, status, strain)
POST   /api/v1/hives                       # Oluştur
GET    /api/v1/hives/:id                   # Detay
PATCH  /api/v1/hives/:id                   # Güncelle
DELETE /api/v1/hives/:id                   # Soft delete

POST   /api/v1/hives/:id/frames            # Çerçeve ekle/güncelle
GET    /api/v1/hives/:id/frames            # Çerçeve haritası
GET    /api/v1/hives/:id/queen             # Ana arı detayı
POST   /api/v1/hives/:id/queen             # Ana arı değiştir/ekle
GET    /api/v1/hives/:id/inspections       # Muayene geçmişi
GET    /api/v1/hives/:id/harvests          # Hasat geçmişi
GET    /api/v1/hives/:id/feedings          # Besleme geçmişi
GET    /api/v1/hives/:id/treatments        # Tedavi geçmişi
GET    /api/v1/hives/:id/analytics         # Kovan analitiği
```

#### Inspections (Muayeneler)
```
GET    /api/v1/inspections                 # Liste (filtre: hive_id, date_range, status)
POST   /api/v1/inspections                 # Oluştur (form/data)
GET    /api/v1/inspections/:id             # Detay
PATCH  /api/v1/inspections/:id             # Güncelle
DELETE /api/v1/inspections/:id             # Soft delete

POST   /api/v1/inspections/:id/analyze     # AI analizi tetikle
GET    /api/v1/inspections/:id/analysis    # AI analiz sonucu
POST   /api/v1/inspections/:id/voice       # Ses yükle (multipart)
POST   /api/v1/inspections/:id/photos      # Foto yükle (multipart)
```

#### Queens (Ana Arılar)
```
GET    /api/v1/queens                      # Liste
POST   /api/v1/queens                      # Oluştur
GET    /api/v1/queens/:id                  # Detay (pedigree, performans)
PATCH  /api/v1/queens/:id                  # Güncelle
POST   /api/v1/queens/:id/replace          # Değiştirme kaydı
GET    /api/v1/queens/:id/offspring        # Yavruları
```

#### Honey Harvests (Bal Hasatları)
```
GET    /api/v1/harvests                    # Liste (filtre: apiary_id, hive_id, date_range)
POST   /api/v1/harvests                    # Oluştur
GET    /api/v1/harvests/:id                # Detay
PATCH  /api/v1/harvests/:id                # Güncelle
DELETE /api/v1/harvests/:id                # Soft delete
```

#### Feedings (Beslemeler)
```
GET    /api/v1/feedings                    # Liste
POST   /api/v1/feedings                    # Oluştur (tek/planlı)
GET    /api/v1/feedings/:id                # Detay
PATCH  /api/v1/feedings/:id                # Güncelle (tüketim girişi)
GET    /api/v1/feedings/calendar           # Takvim görünümü
POST   /api/v1/feedings/plan               # Besleme planı oluştur
```

#### Treatments (Tedaviler)
```
GET    /api/v1/treatments                  # Liste
POST   /api/v1/treatments                  # Oluştur
GET    /api/v1/treatments/:id              # Detay
PATCH  /api/v1/treatments/:id              # Güncelle (seans tamamlama, sayım)
POST   /api/v1/treatments/:id/efficacy     # Etkinlik hesapla
GET    /api/v1/treatments/protocols        # Onaylı protokoller listesi
```

#### Inventory (Envanter)
```
GET    /api/v1/inventory                   # Liste (filtre: category, stock_status)
POST   /api/v1/inventory                   # Oluştur
GET    /api/v1/inventory/:id               # Detay
PATCH  /api/v1/inventory/:id               # Güncelle
POST   /api/v1/inventory/:id/movement      # Stok hareketi (giriş/çıkış)
GET    /api/v1/inventory/low-stock         # Düşük stok uyarıları
GET    /api/v1/inventory/expiring          # Son kullanma tarihi yaklaşıyor
```

#### Analytics & Reports
```
GET    /api/v1/analytics/dashboard         # Dashboard KPI'ları
GET    /api/v1/analytics/yield             # Verim analitiği
GET    /api/v1/analytics/health            # Sağlık analitiği
GET    /api/v1/analytics/financial         # Maliyet/gelir
GET    /api/v1/analytics/regional          # Bölgesel benchmark

POST   /api/v1/reports/generate            # Rapor oluştur (async job)
GET    /api/v1/reports/:id                 # Rapor durumu/sonucu
GET    /api/v1/reports/:id/download        # Dosya indir
GET    /api/v1/reports/templates           # Şablon listesi
```

#### AI / Agents
```
POST   /api/v1/ai/inspection/analyze       # InspectionAgent
POST   /api/v1/ai/queen/advise             # QueenAgent
POST   /api/v1/ai/disease/assess           # DiseaseAgent
POST   /api/v1/ai/honey/forecast           # HoneyAgent
POST   /api/v1/ai/feeding/plan             # FeedingAgent
POST   /api/v1/ai/forecast/seasonal        # ForecastAgent
GET    /api/v1/ai/memory/:hiveId           # Ajan durumu getir
```

#### Community & Region
```
GET    /api/v1/forum/posts                 # Forum listesi
POST   /api/v1/forum/posts                 # Gönderi oluştur
GET    /api/v1/regions/:id/flora-calendar  # Flora takvimi
GET    /api/v1/regions/:id/climate         # İklim normalleri
GET    /api/v1/regions/:id/alerts          # Bölgesel uyarılar
```

#### Sync & Offline
```
POST   /api/v1/sync/push                   # Client → Server (batch)
GET    /api/v1/sync/pull?since=:timestamp  # Server → Client (delta)
GET    /api/v1/sync/conflicts              # Çakışma listesi
POST   /api/v1/sync/resolve                # Çakışma çöz
```

### 2.4 Sorgu Parametreleri (PostgREST Standartları)

| Parametre | Açıklama | Örnek |
|-----------|----------|-------|
| `select` | Dönüş alanları | `select=id,name,apiary:apiaries(name)` |
| `filter` | Filtreleme | `status=eq.active&apiary_id=eq.uuid` |
| `order` | Sıralama | `order=inspected_at.desc` |
| `limit` | Sayfa boyutu | `limit=20` |
| `offset` | Sayfa atlama | `offset=40` |
| `range` | Range header | `Range: 0-19` (Content-Range döner) |

**Filtre Operatörleri:** `eq`, `neq`, `gt`, `gte`, `lt`, `lte`, `like`, `ilike`, `is`, `in`, `cs` (contains), `cd` (contained by), `ov` (overlaps), `sl` (starts with), `sr` (ends with)

---

## 3. GraphQL API

### 3.1 Schema Özeti

```graphql
# schema.graphql
type Query {
  # Node interface (Relay uyumlu)
  node(id: ID!): Node
  
  # Viewer (Mevcut kullanıcı)
  viewer: User
  
  # Apiaries
  apiaries(filter: ApiaryFilter, pagination: Pagination): ApiaryConnection!
  apiary(id: ID!): Apiary
  
  # Hives
  hives(filter: HiveFilter, pagination: Pagination): HiveConnection!
  hive(id: ID!): Hive
  
  # Inspections
  inspections(filter: InspectionFilter, pagination: Pagination): InspectionConnection!
  inspection(id: ID!): Inspection
  
  # Analytics (Aggregated)
  analytics(scope: AnalyticsScope!): AnalyticsDashboard!
  yieldAnalytics(scope: AnalyticsScope!): YieldAnalytics!
  healthAnalytics(scope: AnalyticsScope!): HealthAnalytics!
  financialAnalytics(scope: AnalyticsScope!): FinancialAnalytics!
  
  # AI
  aiInspectionAnalysis(input: InspectionAnalysisInput!): InspectionAnalysis!
  aiQueenAdvice(input: QueenAdviceInput!): QueenAdvice!
  aiDiseaseAssessment(input: DiseaseAssessmentInput!): DiseaseAssessment!
  aiHoneyForecast(input: HoneyForecastInput!): HoneyForecast!
  aiFeedingPlan(input: FeedingPlanInput!): FeedingPlan!
  aiSeasonalForecast(input: SeasonalForecastInput!): SeasonalForecast!
  
  # Reports
  reports(filter: ReportFilter): ReportConnection!
  report(id: ID!): Report
  
  # Community
  forumPosts(filter: ForumFilter, pagination: Pagination): ForumPostConnection!
  region(id: ID!): Region
}

type Mutation {
  # Auth (Supabase Auth ile yönetilir, burada sadece profile)
  updateProfile(input: UpdateProfileInput!): Profile!
  
  # Apiaries
  createApiary(input: CreateApiaryInput!): Apiary!
  updateApiary(id: ID!, input: UpdateApiaryInput!): Apiary!
  deleteApiary(id: ID!): DeletionResult!
  
  # Hives
  createHive(input: CreateHiveInput!): Hive!
  updateHive(id: ID!, input: UpdateHiveInput!): Hive!
  deleteHive(id: ID!): DeletionResult!
  moveHives(input: MoveHivesInput!): MoveHivesResult!
  
  # Inspections
  createInspection(input: CreateInspectionInput!): Inspection!
  updateInspection(id: ID!, input: UpdateInspectionInput!): Inspection!
  analyzeInspection(id: ID!): InspectionAnalysis!
  
  # Queens
  createQueen(input: CreateQueenInput!): Queen!
  replaceQueen(hiveId: ID!, input: ReplaceQueenInput!): Queen!
  
  # Harvests/Feedings/Treatments
  createHarvest(input: CreateHarvestInput!): Harvest!
  createFeeding(input: CreateFeedingInput!): Feeding!
  createTreatment(input: CreateTreatmentInput!): Treatment!
  completeTreatmentSession(treatmentId: ID!, input: CompleteSessionInput!): Treatment!
  
  # Inventory
  createInventoryItem(input: CreateInventoryItemInput!): InventoryItem!
  addInventoryMovement(input: AddMovementInput!): InventoryMovement!
  
  # Reports
  generateReport(input: GenerateReportInput!): ReportJob!
  
  # Sync
  pushSync(operations: [SyncOperationInput!]!): SyncPushResult!
  resolveConflict(input: ResolveConflictInput!): SyncResolution!
}

type Subscription {
  # Realtime updates
  apiaryUpdated(apiaryId: ID!): Apiary!
  hiveUpdated(hiveId: ID!): Hive!
  inspectionCreated(apiaryId: ID): Inspection!
  treatmentSessionCompleted(treatmentId: ID!): Treatment!
  notificationReceived: Notification!
  syncStatusChanged: SyncStatus!
}
```

### 3.2 Örnek GraphQL Sorguları

```graphql
# Dashboard için optimize edilmiş tek sorgu
query Dashboard($apiaryId: ID) {
  viewer {
    id
    displayName
    plan
  }
  analytics(scope: { apiaryId: $apiaryId, period: "current_season" }) {
    kpis {
      totalHives
      activeAlerts { critical warning }
      monthlyHoneyKg
      monthlyTreatments
    }
    criticalAlerts(limit: 3) {
      type
      message
      hive { id name }
      action { label url }
    }
    weatherFlora {
      current { temp humidity condition }
      weeklyFlora { date name intensity }
    }
    recentInspections(limit: 5) {
      id
      inspectedAt
      hive { id name }
      strength
      anomalies { type severity }
    }
  }
}

# Kovan detayı + çerçeve haritası + son muayeneler
query HiveDetail($id: ID!) {
  hive(id: $id) {
    id
    name
    status
    strain
    boxType
    frameCount
    queen { id strain birthDate status performanceScore }
    frames {
      position
      frameType
      cyclesCompleted
      waxAgeMonths
      foundationType
      status
    }
    inspections(limit: 10) {
      id
      inspectedAt
      strength
      queenStatus
      varroaCount
      varroaMethod
      aiSummary
      anomalies { type severity confidence }
    }
    analytics {
      yieldTrend { month kg }
      varroaTrend { month count }
      costRevenue { month cost revenue }
    }
  }
}

# AI Muayene Analizi Mutation
mutation AnalyzeInspection($input: InspectionAnalysisInput!) {
  aiInspectionAnalysis(input: $input) {
    summary
    anomalies { type severity confidence evidence threshold current }
    recommendations { action priority reasoning dueDate references }
    riskScores { varroa queenFailure starvation swarming }
  }
}
```

---

## 4. Hata Formatı (RFC 9457 - Problem Details)

```json
{
  "type": "https://api.beemaster.ai/errors/validation-failed",
  "title": "Validation Failed",
  "status": 422,
  "detail": "Inspection data validation failed",
  "instance": "/api/v1/inspections/abc-123",
  "errors": [
    { "field": "varroa_count", "code": "min_value", "message": "Varroa sayısı negatif olamaz" },
    { "field": "inspected_at", "code": "future_date", "message": "Muayene tarihi gelecekte olamaz" },
    { "field": "brood_area_pct", "code": "sum_exceeds", "message": "Petek alanları toplamı 100% aşamaz" }
  ]
}
```

### 4.1 Standart Hata Türleri

| Type URI | HTTP Status | Açıklama |
|----------|-------------|----------|
| `.../errors/validation-failed` | 422 | Girdi doğrulama hatası |
| `.../errors/unauthorized` | 401 | Token geçersiz/süresi dolmuş |
| `.../errors/forbidden` | 403 | RLS politikası reddetti |
| `.../errors/not-found` | 404 | Kaynak bulunamadı |
| `.../errors/conflict` | 409 | Çakışma (optimistic lock) |
| `.../errors/rate-limited` | 429 | Rate limit aşıldı |
| `.../errors/ai-unavailable` | 503 | AI servisi erişilemez |
| `.../errors/sync-conflict` | 409 | Offline senkron çakışması |
| `.../errors/storage-full` | 507 | Depolama kotası doldu |

---

## 5. Rate Limiting & Quotas

### 5.1 Katmanlar (Tiers)

| Plan | Req/min | Req/gün | AI Çağrı/gün | WebSocket | Storage |
|------|---------|---------|--------------|-----------|---------|
| **Free** | 60 | 1,000 | 10 | 1 bağlantı | 100 MB |
| **Pro** | 300 | 50,000 | 200 | 5 bağlantı | 5 GB |
| **Enterprise** | 1,000 | Sınırsız | 2,000 | 20 bağlantı | 50 GB |

### 5.2 Header'lar

```
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 287
X-RateLimit-Reset: 1703123400
Retry-After: 45 (eğer limit aşıldıysa)
```

### 5.3 AI Rate Limiting (Özel)

```
X-AI-RateLimit-Limit: 200
X-AI-RateLimit-Remaining: 195
X-AI-RateLimit-Reset: 1703123400
```

---

## 6. Realtime (WebSocket)

### 6.1 Bağlantı

```
wss://api.beemaster.ai/realtime/v1?apikey=<ANON_KEY>&authorization=Bearer<JWT>
```

### 6.2 Kanallar (Channels)

| Kanal | Olaylar | Filtre |
|-------|---------|--------|
| `apiary:{id}` | `INSERT`, `UPDATE`, `DELETE` | `user_id=eq.<uid>` |
| `hive:{id}` | `INSERT`, `UPDATE`, `DELETE` | `user_id=eq.<uid>` |
| `inspection:{apiary_id}` | `INSERT` | `user_id=eq.<uid>` |
| `treatment:{id}` | `UPDATE` (session complete) | `user_id=eq.<uid>` |
| `notification:{user_id}` | `INSERT` | `user_id=eq.<uid>` |
| `sync:{user_id}` | `SYNC_PROGRESS`, `SYNC_COMPLETE`, `SYNC_CONFLICT` | `user_id=eq.<uid>` |

### 6.3 Mesaj Formatı

```json
{
  "event": "INSERT",
  "channel": "hive:uuid-123",
  "payload": {
    "new": { "id": "uuid-123", "name": "Kovan-12", "strength": "strong" },
    "old": null
  },
  "timestamp": "2026-07-19T14:30:00Z"
}
```

---

## 7. Offline Sync API

### 7.1 Push (Client → Server)

```http
POST /api/v1/sync/push
Content-Type: application/json
Authorization: Bearer <token>

[
  {
    "id": "op-uuid-1",
    "table": "inspections",
    "operation": "create",
    "payload": { "hive_id": "...", "inspected_at": "...", "strength": "moderate", ... },
    "timestamp": 1703123400000,
    "retryCount": 0
  },
  {
    "id": "op-uuid-2",
    "table": "hives",
    "operation": "update",
    "payload": { "id": "hive-uuid", "name": "Yeni İsim" },
    "timestamp": 1703123500000,
    "retryCount": 0
  }
]
```

**Yanıt:**
```json
{
  "results": [
    { "id": "op-uuid-1", "status": "success", "serverId": "inspection-server-uuid" },
    { "id": "op-uuid-2", "status": "success", "serverId": "hive-uuid" }
  ],
  "serverTime": "2026-07-19T14:30:00Z"
}
```

### 7.2 Pull (Server → Client)

```http
GET /api/v1/sync/pull?since=1703123400000
Authorization: Bearer <token>
```

**Yanıt:**
```json
{
  "changes": [
    { "table": "hives", "operation": "update", "record": { "id": "...", "name": "Güncel İsim", "updated_at": "..." } },
    { "table": "inspections", "operation": "create", "record": { "id": "...", "hive_id": "...", ... } }
  ],
  "serverTime": 1703123600000,
  "conflicts": []
}
```

### 7.3 Çakışma Çözümleme

```http
POST /api/v1/sync/resolve
Content-Type: application/json

{
  "conflicts": [
    {
      "table": "inspections",
      "localRecord": { "id": "local-uuid", "varroa_count": 5, "updated_at": "..." },
      "serverRecord": { "id": "server-uuid", "varroa_count": 3, "updated_at": "..." },
      "resolution": "merge", // "local" | "server" | "merge" | "manual"
      "mergedRecord": { "id": "server-uuid", "varroa_count": 5, "notes": "Merged: local varroa preferred" }
    }
  ]
}
```

---

## 8. Dosya Yükleme (Storage)

### 8.1 Bucket'lar

| Bucket | Amaç | Max Boyut | Süre |
|--------|------|-----------|------|
| `inspection-photos` | Muayene fotoğrafları | 5 MB | 1 yıl |
| `inspection-audio` | Ses kayıtları | 10 MB | 6 ay |
| `harvest-photos` | Hasat/kalo fotoğrafları | 5 MB | 1 yıl |
| `inventory-photos` | Envanter/barkod fotoğrafları | 2 MB | 1 yıl |
| `reports` | PDF/Excel raporları | 20 MB | 2 yıl |
| `models` | AI modelleri (GGUF/ONNX) | 500 MB | Kalıcı |
| `user-avatars` | Profil fotoğrafları | 1 MB | Kalıcı |

### 8.2 Yükleme (Signed URL)

```http
POST /api/v1/storage/upload-url
Authorization: Bearer <token>
Content-Type: application/json

{ "bucket": "inspection-photos", "path": "hive-123/2026-07-19/photo-1.jpg", "contentType": "image/jpeg" }
```

**Yanıt:**
```json
{ "uploadUrl": "https://...signed-url...", "publicUrl": "https://...public-url...", "expiresIn": 3600 }
```

---

## 9. Edge Functions (Serverless)

| Fonksiyon | Tetikleyici | Açıklama |
|-----------|-------------|----------|
| `ai-analyze-inspection` | HTTP POST / Queue | InspectionAgent çalıştırma |
| `ai-queen-advice` | HTTP POST | QueenAgent |
| `ai-disease-assess` | HTTP POST | DiseaseAgent |
| `generate-report` | HTTP POST / Cron | Rapor oluşturma (PDF/Excel) |
| `scheduled-reports` | Cron (0 9 * * 1) | Haftalık özet raporları |
| `sync-notifications` | DB Trigger (sync_operations) | Push bildirimi gönderme |
| `weather-flora-sync` | Cron (0 */6 * * *) | Hava/Flora verisi güncelleme |
| `model-updater` | Cron (0 3 * * 0) | AI model kontrolü/indirme |
| `cleanup-expired-media` | Cron (0 4 * * *) | Eski medya temizleme |

---

## 10. Güvenlik

### 10.1 CORS & CSP

```
Access-Control-Allow-Origin: https://app.beemaster.ai, https://*.beemaster.ai
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Apikey, X-Client-Version
Access-Control-Max-Age: 86400
```

### 10.2 Güvenlik Header'ları

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' wss://api.beemaster.ai https://*.supabase.co
```

### 10.3 API Güvenliği

- **Input Validation:** Zod schema validation (Edge Function'da)
- **SQL Injection:** PostgREST parametrize edilmiş sorgular
- **RLS:** Her tablo `auth.uid() = user_id` politikası
- **Secrets:** Supabase Vault (API keys, encryption keys)
- **Audit:** `events` tablosuna her mutasyon loglanır

---

## 11. SDK'lar ve İstemci Kütüphaneleri

| Platform | Kütüphane | Kurulum |
|----------|-----------|---------|
| **Web (React/Next.js)** | `@beemaster/sdk` | `npm i @beemaster/sdk` |
| **React Native** | `@beemaster/sdk-react-native` | `npm i @beemaster/sdk-react-native` |
| **Flutter** | `beemaster_dart` | `flutter pub add beemaster_dart` |
| **Python** | `beemaster-py` | `pip install beemaster-py` |
| **TypeScript Types** | `@beemaster/types` | Otomatik üretilir (GraphQL Codegen) |

---

## 12. Test ve Geliştirme

### 12.1 Local Development

```bash
# Supabase Local
supabase start
supabase db reset
supabase functions serve

# API Base URL
export API_URL=http://localhost:54321/rest/v1
export REALTIME_URL=ws://localhost:54321/realtime/v1
```

### 12.2 Contract Testing (Pact)

```yaml
# pacts/inspection-consumer-provider.json
{
  "consumer": "BeeMaster-Web",
  "provider": "BeeMaster-API",
  "interactions": [
    {
      "description": "Create inspection with valid data",
      "request": { "method": "POST", "path": "/inspections", "body": { ... } },
      "response": { "status": 201, "body": { "id": "uuid", ... } }
    }
  ]
}
```

### 12.3 API Dokümantasyonu

- **OpenAPI 3.1:** `/docs/openapi.yaml` (Supabase'den otomatik)
- **GraphQL Schema:** `/docs/schema.graphql` (Apollo Rover)
- **Postman Collection:** `/docs/postman_collection.json`
- **Interactive Docs:** `https://api.beemaster.ai/docs` (Scalar/Redoc)

---

## 13. İzleme ve Gözlemlenebilirlik

| Metrik | Araç | Alarm Eşiği |
|--------|------|-------------|
| **Latency (p95)** | Datadog/Grafana | > 500ms |
| **Error Rate** | Sentry | > 1% |
| **Rate Limit Hits** | Kong Metrics | > 10% trafiği |
| **Sync Failure Rate** | Custom | > 0.5% |
| **AI Latency (p95)** | Custom | > 8s (remote), > 3s (local) |
| **Storage Usage** | Supabase Dashboard | > 80% quota |

---

## 14. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **GraphQL Federation** | Mikro servisler için federated schema |
| **gRPC-Gateway** | External gRPC erişimi (Partner API) |
| **Async API (Webhooks)** | `POST /webhooks` - Olay bildirimleri (Muayene, Tedavi, Uyarı) |
| **API Versioning v2** | Breaking changes: `deleted_at` → `archived_at`, yeni alanlar |
| **Private Link** | AWS PrivateLink / Azure Private Endpoint (Enterprise) |
| **Custom Domain SSL** | `api.custom-domain.com` yönetimi |