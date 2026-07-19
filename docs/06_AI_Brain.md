# BeeMaster AI — AI Brain (BeeMind) Mimarisi v1.0

> **Amaç:** BeeMaster AI'nin zekâ çekirdeğini tanımlar. Çok ajanlı (multi-agent) orkestrasyon, bellek mimarisi, öğrenme döngüleri, şeffaflık ve güvenlik mekanizmaları.

---

## 1. Genel Bakış

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BEE MIND CORE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐    ┌──────────┐  │
│  │ Orchestrator │◄───│  Planner     │◄───│  Reasoner    │◄───│  Memory  │  │
│  │  (Merkez)    │    │  (Planlama)  │    │  (Mantık)    │    │  (Hafıza)│  │
│  └──────────────┘    └──────────────┘    └──────────────┘    └──────────┘  │
│         │                   │                   │                   │       │
│         ▼                   ▼                   ▼                   ▼       │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    AGENT REGISTRY (Ajan Kayıt Defteri)               │   │
│  │  InspectionAgent │ QueenAgent │ DiseaseAgent │ HoneyAgent │ ...      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      MCP BRIDGE (Model Context Protocol)             │   │
│  │  Tools │ Resources │ Prompts │ Sampling │ Roots │ Logging            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│           ┌────────────────────────┼────────────────────────┐              │
│           ▼                        ▼                        ▼              │
│  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐   │
│  │ Local LLM     │         │ Remote LLM    │         │ Vector DB     │   │
│  │ (Hermes/GGUF) │         │ (Claude/GPT)  │         │ (Chroma/pgv)  │   │
│  └───────────────┘         └───────────────┘         └───────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Temel Prensipler

| Prensip | Açıklama |
|---------|----------|
| **Modüler Ajanlar** | Her alan (muayene, ana arı, hastalık, bal, besleme) kendi uzman ajanıyla yönetilir |
| **Hibrit Çıkarım** | Local-first (gizlilik, offline, hız) + Remote (karmaşık reasoning, geniş bilgi) |
| **Şeffaf Mantık** | Her karar "neden" ile açıklanabilir: Kanıt, güven, referans |
| **Sürekli Öğrenme** | Kullanıcı geri bildirimi + veri → Model iyileştirme (RLHF-lite) |
| **Gizlilik Tasarımı** | PII (kişisel veri) AI'a gitmeden maskelenir / lokal işlenir |

---

## 2. Bellek Mimarisi (Memory Architecture)

### 2.1 Bellek Türleri

```typescript
// core/memory/types.ts

// Episodic Memory — Yaşanan olaylar (Kovan bazlı, zaman serisi)
interface EpisodicMemory {
  hiveId: string;
  episodes: Episode[]; // inspection, treatment, harvest, queen_change, feeding
  embeddings: Float32Array; // Semantic search için
  lastConsolidated: Date;
  version: number;
}

interface Episode {
  id: string;
  type: 'inspection' | 'treatment' | 'harvest' | 'queen_change' | 'feeding' | 'observation';
  timestamp: Date;
  summary: string; // AI üretilmiş özet
  keyFacts: Fact[]; // Çıkarılan gerçekler: "Varroa 12", "Ana arı yok"
  emotionalValence: -1 | 0 | 1; // Olumsuz/Nötr/Olumlu
  links: string[]; // İlgili episode ID'leri
}

// Semantic Memory — Bilgi tabanı (Bölge, İrk, Hastalık, Flora, Literatür)
interface SemanticMemory {
  regions: RegionKnowledge[]; // "Diyarbakır-Eğil: Geven+Nisan, Kekik+Haziran"
  strains: StrainKnowledge[]; // "Anadolu arısı: Dayanıklı, sürgünsüz, kış geçirimi iyi"
  diseases: DiseaseKnowledge[]; // Varroa protokolleri, AFB/EFB ayrımı
  flora: FloraKnowledge[]; // Çiçeklenme takvimleri, nektar/polen potansiyeli
  literature: LiteratureEntry[]; // RAG için: Makale özetleri, DOI, yıl
  bestPractices: Practice[]; // "Kış öncesi 15-20 kg bal bırak"
}

// Procedural Memory — Nasıl yapılır (Prosedürler)
interface ProceduralMemory {
  procedures: Procedure[]; // "Varroa buhar tedavisi adım adım"
  versions: Map<string, ProcedureVersion>; // Güncellemeler, A/B test
  validations: ValidationRule[]; // "Sıcaklık 10-25°C olmalı"
}

// Working Memory — Aktif bağlam (Mevcut muayene, sohbet, plan)
interface WorkingMemory {
  context: InspectionContext | null;
  activeHive: Hive | null;
  recentActions: Action[]; // Son 10 aksiyon
  userIntent: Intent; // "Varroa tedavisi planla"
  scratchpad: Map<string, any>; // Geçici hesaplamalar
}
```

### 2.2 Bellek İşlemleri

| İşlem | Açıklama | Sıklık |
|-------|----------|--------|
| **Encode** | Yeni deneyim → Embedding + Episodic store | Her muayene/tedavi/hasat |
| **Retrieve** | Semantic search (vector) + Temporal query | Her AI çağrısında |
| **Consolidate** | Gece: Episodic → Semantic (özetleme, pattern extraction) | Günlük (cron) |
| **Replay** | Eğitim için: Episode replay → RLHF-lite | Haftalık |
| **Forget** | Eski/az ilgili bellekler → Özetle veya sil (RLS) | Aylık |

### 2.3 Vektör Veritabanı Şeması

```sql
-- pgvector / ChromaDB Collections

-- episodic_memories (her kovan için)
CREATE TABLE episodic_memories (
  id UUIDv7 PRIMARY KEY,
  hive_id UUID NOT NULL,
  user_id UUID NOT NULL,
  episode_type TEXT NOT NULL,
  content TEXT NOT NULL,           -- Ham metin / özet
  embedding VECTOR(1536),          -- text-embedding-3-small / BGE-M3
  key_facts JSONB,                 -- [{fact: "varroa=12", confidence: 0.9}]
  emotional_valence SMALLINT,      -- -1, 0, 1
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_episodic_hive_time ON episodic_memories (hive_id, timestamp DESC);
CREATE INDEX idx_episodic_embedding ON episodic_memories USING hnsw (embedding vector_cosine_ops);

-- semantic_knowledge (bölge, ırk, hastalık, flora)
CREATE TABLE semantic_knowledge (
  id UUIDv7 PRIMARY KEY,
  category TEXT NOT NULL,          -- 'region', 'strain', 'disease', 'flora', 'literature'
  key TEXT NOT NULL,               -- 'Diyarbakır-Eğil', 'anatolian', 'varroa_treatment'
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  source TEXT,                     -- 'literature', 'user_verified', 'community'
  confidence DECIMAL(3,2),         -- 0.00-1.00
  metadata JSONB,                  -- {region: 'Diyarbakır', month: 4, flora: ['Geven']}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_semantic_cat_key ON semantic_knowledge (category, key);
CREATE INDEX idx_semantic_embedding ON semantic_knowledge USING hnsw (embedding vector_cosine_ops);

-- procedural_memory (prosedürler)
CREATE TABLE procedural_memory (
  id UUIDv7 PRIMARY KEY,
  name TEXT NOT NULL,              -- 'oxalic_vapor_treatment'
  version INT DEFAULT 1,
  steps JSONB NOT NULL,            -- [{step: 1, action: 'Hazırla', params: {...}, validation: 'temp>10'}]
  preconditions JSONB,             -- {temperature: {min: 10, max: 25}, brood_present: false}
  safety_warnings TEXT[],
  references TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Ajan Mimarisi (Agent Architecture)

### 3.1 Ajan Temel Sınıfı

```typescript
// core/agents/BaseAgent.ts
abstract class BaseAgent {
  protected memory: MemoryManager;
  protected mcp: MCPClient;
  protected config: AgentConfig;
  
  abstract readonly type: AgentType;
  abstract readonly capabilities: Capability[];
  
  // Ana giriş noktası
  async process(input: AgentInput, context: WorkingMemory): Promise<AgentOutput> {
    // 1. Bağlam yükle (Episodic + Semantic)
    const relevantMemory = await this.gatherContext(input, context);
    
    // 2. Plan yap (Planner ile)
    const plan = await this.planner.plan(input, relevantMemory);
    
    // 3. Çalıştır (Reasoner + Tools)
    const result = await this.execute(plan, relevantMemory);
    
    // 4. Belleğe yaz (Episodic)
    await this.memory.storeEpisode({
      agentType: this.type,
      input,
      plan,
      result,
      timestamp: new Date(),
    });
    
    // 5. Çıktı formatla
    return this.formatOutput(result);
  }
  
  // Araç kullanımı (MCP üzerinden)
  protected async useTool(tool: string, params: any): Promise<any> {
    return this.mcp.callTool(tool, params);
  }
  
  // Bilgi arama (RAG)
  protected async searchKnowledge(query: string, category?: string): Promise<KnowledgeResult[]> {
    return this.mcp.callTool('search_knowledge', { query, category, limit: 5 });
  }
}
```

### 3.2 Uzman Ajanlar

| Ajan | Sorumluluk | Girdi | Çıktı | MCP Araçları |
|------|------------|-------|-------|--------------|
| **InspectionAgent** | Muayene analizi, anomali tespiti, öneri | Ses/Metin/Foto/Form | Yapılandırılmış muayene, anomali listesi, aksiyon planı | `analyze_inspection`, `detect_anomalies`, `suggest_actions` |
| **QueenAgent** | Ana arı pedigree, performans, değişim takvimi | Yaş, ırk, performans, geçmiş | Değişim önerisi, ırk önerisi, performans skoru | `track_queen`, `predict_supersedure`, `recommend_strain` |
| **DiseaseAgent** | Hastalık/parazit riski, tanı, tedavi protokolü | Varroa sayımı, görsel bulgular, semptomlar | Risk skoru, tedavi protokolü, ilaç dozajı | `assess_varroa`, `diagnose_visual`, `prescribe_treatment` |
| **HoneyAgent** | Bal tahmini, hasat optimizasyonu, fiyat | Petek sayısı, ağırlık, flora, hava | Tahmini verim, hasat zamanı, pazar fiyatı | `forecast_yield`, `optimize_harvest`, `market_price` |
| **FeedingAgent** | Besleme programı, stok, maliyet | Stok, mevsim, kovan gücü, hava | Şekerli su/paté programı, miktar, zamanlama | `calculate_feed`, `schedule_feeding`, `monitor_consumption` |
| **ForecastAgent** | Mevsim planı, risk haritası, kaynak tahsisi | Tüm veriler + hava + flora | Mevsim planı, risk haritası, kaynak tahsisi | `seasonal_plan`, `risk_map`, `resource_allocation` |

### 3.3 Ajan Koordinasyonu (Orchestrator)

```typescript
// core/agents/Orchestrator.ts
class Orchestrator {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private planner: Planner;
  private reasoner: Reasoner;
  
  async handleRequest(userInput: string, context: WorkingMemory): Promise<OrchestratorResponse> {
    // 1. Niyet sınıflandırma
    const intent = await this.classifyIntent(userInput, context);
    
    // 2. Gerekli ajanları belirle
    const requiredAgents = this.selectAgents(intent, context);
    
    // 3. Paralel/Seri çalıştırma planı
    const executionPlan = this.planner.createExecutionPlan(requiredAgents, intent);
    
    // 4. Çalıştır
    const results = await this.executePlan(executionPlan, context);
    
    // 5. Sonuçları birleştir (Reasoner)
    const synthesized = await this.reasoner.synthesize(results, intent);
    
    // 6. Kullanıcıya sun
    return this.formatResponse(synthesized);
  }
  
  private async executePlan(plan: ExecutionPlan, context: WorkingMemory): Promise<AgentResult[]> {
    const results: AgentResult[] = [];
    
    for (const step of plan.steps) {
      if (step.parallel) {
        // Paralel: Bağımsız ajanlar aynı anda
        const parallelResults = await Promise.all(
          step.agents.map(a => this.agents.get(a)!.process(step.input, context))
        );
        results.push(...parallelResults);
      } else {
        // Seri: Bir önceki sonucu bir sonrakiya ver
        const input = step.input || results[results.length - 1]?.output;
        const result = await this.agents.get(step.agent)!.process(input, context);
        results.push(result);
      }
    }
    
    return results;
  }
}
```

---

## 4. MCP (Model Context Protocol) Entegrasyonu

### 4.1 MCP Sunucuları

```json
{
  "mcpServers": {
    "beemaster-data": {
      "command": "node",
      "args": ["dist/mcp/data-server.js"],
      "env": { "DATABASE_URL": "postgresql://..." },
      "description": "Kovan/Üs CRUD, muayene/hasat/tedavi erişimi"
    },
    "beemaster-analysis": {
      "command": "python",
      "args": ["-m", "mcp.analysis_server"],
      "env": { "MODEL_PATH": "models/beemind-embedding.gguf" },
      "description": "Analitik motor: Varroa riski, verim tahmini, trend analizi"
    },
    "beemaster-knowledge": {
      "command": "node",
      "args": ["dist/mcp/knowledge-server.js"],
      "env": { "VECTOR_DB": "chroma", "CORPUS_PATH": "data/corpus" },
      "description": "Bilgi tabanı RAG: Literatür, protokoller, flora takvimi"
    },
    "beemaster-external": {
      "command": "node",
      "args": ["dist/mcp/external-server.js"],
      "env": { "WEATHER_API_KEY": "...", "MARKET_API_KEY": "..." },
      "description": "Dış servisler: Hava, pazar fiyatı, bildirim gönderimi"
    }
  }
}
```

### 4.2 MCP Araçları (Tools)

| Sunucu | Araç | Açıklama | Parametreler |
|--------|------|----------|--------------|
| `beemaster-data` | `get_hive` | Kovan detayı | `{ hive_id }` |
| `beemaster-data` | `list_inspections` | Muayene geçmişi | `{ hive_id, limit, since }` |
| `beemaster-data` | `create_inspection` | Muayene kaydet | `InspectionInput` |
| `beemaster-analysis` | `calculate_varroa_risk` | Varvoa risk skoru | `{ hive_id, method, count, history }` |
| `beemaster-analysis` | `forecast_honey_yield` | Bal verim tahmini | `{ apiary_id, horizon }` |
| `beemaster-knowledge` | `search_literature` | Literatür arama | `{ query, category, limit }` |
| `beemaster-knowledge` | `get_treatment_protocol` | Tedavi protokolü | `{ disease, region, season }` |
| `beemaster-external` | `get_weather_forecast` | Hava tahmini | `{ lat, lon, days }` |
| `beemaster-external` | `get_market_price` | Bölgesel bal fiyatı | `{ region, honey_type }` |

### 4.3 MCP Kaynakları (Resources)

```
hive://{hive_id}              → Kovan tam durumu (JSON)
apiary://{apiary_id}          → Üs özeti
inspection://{inspection_id}  → Muayene detayı
knowledge://disease/varroa    → Varroa bilgi kartı
knowledge://flora/{region}    → Bölge flora takvimi
weather://{lat},{lon}         → Güncel hava
market://honey/{region}       → Pazar fiyatları
```

---

## 5. Hibrit Çıkarım Stratejisi (Hybrid Inference)

```typescript
// core/inference/HybridInference.ts
class HybridInference {
  private localLLM: LocalLLM;      // Hermes/GGUF (quantized)
  private remoteLLM: RemoteLLM;    // Claude/GPT via API
  private router: TaskRouter;
  
  async infer(task: InferenceTask): Promise<InferenceResult> {
    const route = this.router.route(task);
    
    switch (route) {
      case 'local_only':
        return this.localLLM.generate(task.prompt, task.options);
      
      case 'local_then_remote':
        // Önce local (hızlı, gizli), sonra remote (doğrulama/genişletme)
        const localResult = await this.localLLM.generate(task.prompt, { 
          maxTokens: 512,
          temperature: 0.3 
        });
        
        if (this.needsRemoteEnhancement(localResult, task)) {
          return this.remoteLLM.generate(this.enhancePrompt(task.prompt, localResult), task.options);
        }
        return localResult;
      
      case 'remote_only':
        // Karmaşık reasoning, geniş bilgi, kod üretimi
        return this.remoteLLM.generate(task.prompt, task.options);
      
      case 'ensemble':
        // Her iki modelden de al, birleştir
        const [local, remote] = await Promise.all([
          this.localLLM.generate(task.prompt, { ...task.options, temperature: 0.2 }),
          this.remoteLLM.generate(task.prompt, { ...task.options, temperature: 0.7 })
        ]);
        return this.ensembleMerge(local, remote, task);
    }
  }
  
  private needsRemoteEnhancement(localResult: string, task: InferenceTask): boolean {
    // Düşük güven, karmaşık soru, eksik bilgi, güvenlik kritik
    return (
      this.extractConfidence(localResult) < 0.7 ||
      task.complexity > 0.8 ||
      task.requiresUpToDateKnowledge ||
      task.isSafetyCritical
    );
  }
}
```

### 5.1 Görev Yönlendirme Kuralları

| Görev Türü | Yol | Gerekçe |
|------------|-----|---------|
| Muayene özeti (TR) | Local | Hız, gizlilik, yerel dil |
| Anomali tespiti (Rule-based) | Local | Deterministik, şeffaf |
| Tedavi protokolü arama | Local (RAG) | Vektör arama yeterli |
| Karmaşık planlama (Mevsim) | Remote | Çok adımlı reasoning |
| Kod/Script üretimi | Remote | Local yetenek dışı |
| Literatür sentезi | Remote | Geniş bağlam penceresi |
| Kullanıcı sohbeti (Genel) | Local_then_Remote | İlk cevap hızlı, derinlemesine remote |

---

## 6. Şeffaflık ve Açıklanabilirlik (Explainability)

### 6.1 Açıklama Formatı

```typescript
interface Explanation {
  decision: string;           // "Okzalik asidi buhar tedavisi önerildi"
  reasoning: ReasoningStep[]; // Adım adım mantık
  evidence: Evidence[];       // Kanıtlar: Veri, literatür, kural
  confidence: number;         // 0.0-1.0
  alternatives: Alternative[]; // Diğer seçenekler ve neden reddedildi
  references: Reference[];    // Kaynaklar: DOI, URL, kitap sayfa
}

interface ReasoningStep {
  step: number;
  type: 'observation' | 'rule' | 'calculation' | 'retrieval' | 'inference';
  description: string;
  input: any;
  output: any;
  source: 'local_model' | 'remote_model' | 'rule_engine' | 'knowledge_base' | 'user_data';
}

interface Evidence {
  type: 'measurement' | 'literature' | 'guideline' | 'historical' | 'expert_opinion';
  content: string;
  strength: 'strong' | 'moderate' | 'weak';
  citation?: string;
}
```

### 6.2 Örnek Çıktı

```json
{
  "decision": "Okzalik asidi buhar tedavisi (2g/kovan, 3 seans, 5 gün arayla) önerilir",
  "reasoning": [
    { "step": 1, "type": "observation", "description": "Son muayenede alkol yıkamada 12 varroa/100 arı tespit edildi", "source": "user_data" },
    { "step": 2, "type": "rule", "description": "Eşik: >3 varroa/100 = tedavi gerekli (COLOSS 2022)", "source": "rule_engine" },
    { "step": 3, "type": "calculation", "description": "Trend: 2 → 5 → 12 (son 3 muayene), artış hızı %140/ay", "source": "local_model" },
    { "step": 4, "type": "retrieval", "description": "Bölgesel prevalans: %68 kovan enfekte, buhar en etkili (%95+)", "source": "knowledge_base" },
    { "step": 5, "type": "inference", "description": "Sıcaklık 18°C (uygun), yumurtalık az (operküllü az), buhar ideal", "source": "reasoner" }
  ],
  "evidence": [
    { "type": "measurement", "content": "Varroa: 12/100 (Alkol yıkama)", "strength": "strong" },
    { "type": "literature", "content": "TÜBİTAK 2023: Buhar etkinlik %95, bal kalıntı yok", "strength": "strong", "citation": "DOI:10.1234/..." },
    { "type": "guideline", "content": "COLOSS Varroa Control 2022: Buhar ilk tercih", "strength": "strong" }
  ],
  "confidence": 0.93,
  "alternatives": [
    { "option": "Okzalik asidi damlatma", "reason_rejected": "Etkinlik %85-90, yumurtalık hasarı riski" },
    { "option": "Formik asit", "reason_rejected": "Sıcaklık 18°C (alt sınır 10°C), riskli" }
  ],
  "references": [
    { "title": "TÜBİTAK Varroa Tedavi Rehberi 2023", "url": "https://...", "type": "guideline" },
    { "title": "COLOSS Varroa Monitoring Protocol", "url": "https://coloss.org/...", "type": "protocol" }
  ]
}
```

---

## 7. Öğrenme Döngüsü (Learning Loop)

### 7.1 RLHF-Lite (Reinforcement Learning from Human Feedback)

```typescript
// core/learning/FeedbackLoop.ts
class FeedbackLoop {
  async collectFeedback(interaction: AIInteraction): Promise<void> {
    // 1. Kullanıcı tepkisi: "Uygulandı" / "Reddedildi" / "Düzenlendi"
    const feedback = await this.getUserFeedback(interaction);
    
    // 2. Etiketli veri oluştur
    const labeledData = {
      input: interaction.input,
      modelOutput: interaction.output,
      userAction: feedback.action, // 'accepted' | 'rejected' | 'modified'
      userCorrection: feedback.correction,
      context: interaction.context,
      timestamp: new Date(),
    };
    
    // 3. Eğitim veri setine ekle (IndexedDB + Sync)
    await this.trainingDataset.add(labeledData);
    
    // 4. Model güncelleme tetikle (Haftalık batch)
    if (this.shouldTriggerRetrain()) {
      this.scheduleModelUpdate();
    }
  }
  
  async retrainLocalModel(): Promise<void> {
    // 1. Veri hazırla: Base + User corrections
    const dataset = await this.prepareDataset();
    
    // 2. LoRA fine-tuning (Hermes-7B/13B)
    const adapter = await this.loraTrainer.train({
      baseModel: 'models/hermes-7b.gguf',
      dataset,
      rank: 16,
      alpha: 32,
      epochs: 3,
      learningRate: 1e-4,
    });
    
    // 3. Doğrula (Hold-out set)
    const metrics = await this.evaluate(adapter);
    
    // 4. Deploy (A/B test ile)
    if (metrics.accuracy > currentModel.accuracy + 0.02) {
      await this.deployModel(adapter);
    }
  }
}
```

### 7.2 Öğrenme Kaynakları

| Kaynak | Açıklama | Sıklık |
|--------|----------|--------|
| **Kullanıcı Onayı** | "Bu öneriyi uyguladım" / "Yanlıştı" | Her etkileşim |
| **Düzenleme** | Kullanıcı AI çıktısını değiştirdi | Her düzenleme |
| **Sonuç Takibi** | Tedavi sonrası sayım → Etkinlik | 14 günde bir |
| **Topluluk Verisi** | Anonimleştirilmiş, opt-in veri | Haftalık batch |
| **Literatür Güncelleme** | Yeni makale/protokol → Bilgi tabanı | Aylık |

---

## 8. Güvenlik ve Gizlilik (Security & Privacy)

### 8.1 Veri Koruma Katmanları

| Katman | Önlem |
|--------|-------|
| **Girdi Temizleme** | PII (isim, telefon, konum) → Hash/Tokenize etmeden AI'a gitmez |
| **Local-First** | Hassas veriler (konum, finansal) sadece local modelde işlenir |
| **Remote Masking** | Remote API'ye giden veride: `hive_id` → `hive_hash`, `apiary_name` → `region_code` |
| **Audit Log** | Her AI çağrısı `events` tablosuna: `{model, input_hash, output_hash, user_id, timestamp}` |
| **Erişim Kontrolü** | MCP tool'ları: `require_auth`, `scope: read|write|admin` |

### 8.2 Yasaklı / Kısıtlı İşlemler

| İşlem | Durum | Alternatif |
|-------|-------|------------|
| Ham GPS koordinatı remote'a gönderme | ❌ Yasak | Bölge kodu (il/ilçe) yeterli |
| Kullanıcı adı/telefonu prompt'a ekleme | ❌ Yasak | Anonim ID kullan |
| Çocuk/şifreli veri işleme | ❌ Yasak | Local modelのみ |
| Model çıkışını doğrudan kod çalıştırma | ❌ Yasak | Sandbox / doğrulama |

---

## 9. Model Yönetimi (Model Management)

### 9.1 Model Envanteri

| Model | Boyut | Kullanım | Quantization | Güncelleme |
|-------|-------|----------|--------------|------------|
| **Hermes-3-7B** | 4.2 GB | Local chat, summary, extraction | Q4_K_M | Aylık (Ollama) |
| **Hermes-3-13B** | 7.8 GB | Complex reasoning, planning | Q4_K_M | Aylık |
| **BGE-M3** | 1.2 GB | Embeddings (TR/EN) | FP16 | 6 aylık |
| **Whisper.cpp-tiny** | 75 MB | STT (Ses→Metin) | INT8 | 6 aylık |
| **Piper-TTS** | 50 MB | TTS (Metin→Ses) | INT8 | 6 aylık |

### 9.2 Model Dağıtım Stratejisi

```yaml
# models/manifest.yaml
models:
  - name: hermes-3-7b
    version: "2024.12"
    url: "https://huggingface.co/NousResearch/Hermes-3-7B-GGUF/resolve/main/Hermes-3-7B-Q4_K_M.gguf"
    sha256: "abc123..."
    size_mb: 4200
    quantization: "Q4_K_M"
    context_window: 8192
    required_ram_mb: 6000
    fallback: hermes-3-3b
    
  - name: bge-m3
    version: "2024.06"
    url: "https://huggingface.co/BAAI/bge-m3/resolve/main/onnx/model.onnx"
    sha256: "def456..."
    size_mb: 1200
    quantization: "FP16"
    
update_policy:
  check_interval_days: 30
  auto_download: wifi_only
  notify_user: true
  rollback_on_failure: true
```

---

## 10. Test ve Doğrulama

| Test Türü | Aracı | Sıklık | Kriter |
|-----------|-------|--------|--------|
| **Unit** | Vitest | Her PR | Coverage > 80% |
| **Integration** | Vitest + MSW | Nightly | MCP tool çağrıları başarılı |
| **Accuracy** | Custom eval set | Haftalık | F1 > 0.85 (anomali tespiti) |
| **Hallucination** | TruthfulQA subset | Haftalık | Yanlış bilgi < 5% |
| **Latency** | Local benchmark | Her release | p95 < 3s (local), < 8s (remote) |
| **Safety** | Red team prompts | Her release | Yasaklı içerik 0% |
| **Privacy** | PII leakage scan | Her release | PII sızması 0 |

---

## 11. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Multi-Modal BeeMind** | Görsel (petek fotoğrafı) + Ses (arı buzması) + Metin → Birleşik reasoning |
| **Federated Learning** | Cihazlarda local eğitim → Gradyan paylaşımı → Global model (veri asla çıkmaz) |
| **Neural-Symbolic** | Rule engine + Neural net hibrit: Kurallar sağlıklı, neural esnek |
| **Continual Learning** | Catastrophic forgetting önleme: EWC, Replay buffer |
| **Agentic Workflows** | "Kış hazırlığı yap" → 5 ajan koordineli → 20 adım otomatik plan + onay |
| **Personalized Models** | Her arıcı için micro-adapter: "Ahmet'in kovanları daha agresif" → Model bunu öğrenir |