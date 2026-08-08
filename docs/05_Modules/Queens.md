# BeeMaster AI — Queens (Ana Arılar) Modülü v1.0

> **Amaç:** Ana arı yaşam döngüsünün tam takibi: Pedigree, performans, değişim takvimi, ırk seçimi, satın alma/yetiştirme, işaretleme (renk kodu), yerel ırk (Anadolu arısı) koruma.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/hives/:hiveId/queen` (Kovan detayında), `/queens` (Global liste - Pro) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (queens), Supabase Sync |
| **Offline** | %100 |
| **Performans** | Liste < 500ms, Detay < 300ms |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| QU-01 | Kovan detayında ana arı kartını görmek: Yaş, ırk, işaret rengi, performans, kaynak | P0 |
| QU-02 | Ana arı değiştirmek: Eski kraliçeyi "Değiştirildi" yapıp, yenisi için pedigree girişi | P0 |
| QU-03 | Ana arı performans skorunu görmek (AI hesaplamalı: verim, huy, hastalık direnci) | P0 |
| QU-04 | Yıl renk koduna göre işaretleme takvimi: 2024=Yeşil, 2025=Beyaz, 2026=Sarı... | P1 |
| QU-05 | Kendi yetiştirdiğim vs satın aldığım ana arıları ayırmak, maliyet takibi | P1 |
| QU-06 | Ana arı ırk önerisi almak (Bölge + Mevsim + Hedef) | P1 |
| QU-07 | Supersedure (Doğal değiştirme) risk tahmini ve erken uyarı | P2 |
| QU-08 | Ana arı satış/transfer kaydı (Kooperatif/Pazar entegrasyonu) | P2 |

---

## 3. UI Yapısı

### 3.1 Kovan Detayında QueenCard (Zaten Hives.md'de detaylı)

```
QueenCard
├── Header: İkon + "Ana Arı" + İşaret Noktası (Renk) + Status Badge
├── Temel Bilgiler
│   ├── İrk: Anadolu Arısı
│   ├── Kaynak: Kendi Yetiştirme / Satın Alınan (Tedarikçi)
│   ├── Doğum: 15 Nisan 2024 (4 ay)
│   └── Maliyet: 150 TL
├── Performans
│   ├── Skor: 87/100 (AI)
│   ├── Verim Etkisi: +12%
│   ├── Huy: Sakin
│   └── Hastalık Direnci: Yüksek
├── Aksiyonlar
│   ├── [Düzenle] [Değiştir] [Geçmiş]
└── Notlar
```

### 3.2 Ana Arı Değiştirme Sihirbazı (Queen Replacement Wizard)

```
[Kovan Detay] → [Ana Arı Değiştir] → WIZARD

ADIM 1: Neden Değiştiriliyor?
┌─────────────────────────────────────┐
│  [Yaşlı] [Performans Düşük] [Hasta] │
│  [Kayıp] [Supersedure] [Kaçırma]    │
│  [Diğer: ___________]               │
└─────────────────────────────────────┘

ADIM 2: Yeni Ana Arı Kaynağı
┌─────────────────────────────────────┐
│  [Kendi Yetiştirme]                 │
│     └── Ana Arı Annesi: [Seç ▼]     │
│     └── Baba Arı Kaynağı: [Giriş]   │
│     └── Yetiştirme Yöntemi: [Doğal] │
│                                     │
│  [Satın Alınan]                     │
│     └── Tedarikçi: [Seç/ Yeni ▼]    │
│     └── İrk: [Anadolu ▼]            │
│     └── Maliyet: [150] TL           │
│     └── Garanti: [Evet/Hayır]       │
│                                     │
│  [Sürgünden Yakalama]               │
│     └── Tarih/Yer: [Giriş]          │
└─────────────────────────────────────┘

ADIM 3: Yeni Ana Arı Bilgileri
┌─────────────────────────────────────┐
│  Doğum Tarihi: [Bugün ▼]            │
│  İşaret Rengi: [●] 2025=Beyaz       │
│  İrk: [Anadolu ▼]                   │
│  Not: [_______________________]     │
└─────────────────────────────────────┘

ADIM 4: Eski Ana Arı Kapanışı
┌─────────────────────────────────────┐
│  Eski: "Kraliçe 2022-Yeşil"         │
│  Durum: [Değiştirildi] [Öldü]       │
│  Not: [_______________________]     │
└─────────────────────────────────────┘

[TAMAMLA] → Eski: status=superseded, Yeni: status=active, Kovan.queenId=Yeni
```

### 3.3 Global Ana Arı Listesi (/queens — Pro)

```
QueensPage
├── Header: "Ana Arılar" + [Filtre] + [+ Yeni Ana Arı] + [CSV Export]
├── Filters: Kovan ▼ | İrk ▼ | Durum ▼ | Yaş Aralığı | Performans > N | Kaynak ▼
├── Table (Virtualized)
│   ID | Kovan | İrk | Doğum | Yaş | Renk | Kaynak | Performans | Durum | Aksiyon
│   Q-1 | K-12 | Anadolu | 15 Nis 24 | 4 ay | 🟢 Yeşil | Kendi | 87/100 | Aktif | [✏️] [🔄] [🗑️]
│   Q-2 | K-05 | Kafkas | 02 May 23 | 14 ay | 🔵 Mavi | Satın | 72/100 | Değiştirildi | [✏️]
└── Pagination
```

### 3.4 Ana Arı Detay Sayfası (/queens/:id — Pro)

```
QueenDetailPage
├── StickyHeader: Geri, İrk + İşaret Noktası, 3-nokta Menü
├── SummaryRow: Kovan | Yaş | Kaynak | Maliyet | Performans
├── Tabs: [Genel] [Performans] [Soy Ağacı] [Yavruları] [Geçmiş]
│
├── GENEL
│   ├── Temel Bilgiler Card
│   ├── İşaretleme Geçmişi (Renk kodları yıllar)
│   └── Notlar
│
├── PERFORMANS (AI)
│   ├── KPI: Verim Etkisi, Huy Skoru, Hastalık Direnci, Yumurtlama Düzenliliği
│   ├── Trend Grafikleri (Aylık)
│   └── Karşılaştırma: Bölge Ortalaması vs Bu Ana Arı
│
├── SOY AĞACI (Pedigree)
│   ├── Görsel Ağaç: Anne → Anne-Annesi → ...
│   ├── Baba Hattı (Satın alındysa tedarikçi verisi)
│   └── Kardeş Ana Arılar (Aynı anneden)
│
├── YAVRULARI (Offspring)
│   ├── Liste: Yavru Ana Arı ID | Doğum | Kovan | Durum | Performans
│   └── [Yeni Yavru Kaydet] → Queen Rearing modülüne link
│
└── GEÇMİŞ
    ├── Zaman Çizelgesi: Kurulum, Değişimler, Muayene Notları, Tedaviler
    └── [PDF Raporu]
```

---

## 4. Bileşen Detayları

### 4.1 QueenMarkingDot (Yıl Renk Kodu)

```tsx
// components/queen/QueenMarkingDot.tsx
const QUEEN_MARKING_COLORS = [
  { year: 2020, color: 'blue', label: 'Mavi' },
  { year: 2021, color: 'white', label: 'Beyaz' },
  { year: 2022, color: 'yellow', label: 'Sarı' },
  { year: 2023, color: 'red', label: 'Kırmızı' },
  { year: 2024, color: 'green', label: 'Yeşil' },
  { year: 2025, color: 'blue', label: 'Mavi' },
  { year: 2026, color: 'white', label: 'Beyaz' },
  { year: 2027, color: 'yellow', label: 'Sarı' },
  { year: 2028, color: 'red', label: 'Kırmızı' },
  { year: 2029, color: 'green', label: 'Yeşil' },
];

export function QueenMarkingDot({ birthDate, size = 'md' }: { birthDate?: string; size?: 'sm' | 'md' | 'lg' }) {
  if (!birthDate) return <span className="w-2 h-2 rounded-full bg-neutral-600" title="Bilinmiyor" />;
  
  const year = new Date(birthDate).getFullYear();
  const marking = QUEEN_MARKING_COLORS.find(m => m.year === year) || QUEEN_MARKING_COLORS[0];
  
  const sizeClasses = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-5 h-5' };
  const colorMap = {
    blue: 'bg-blue-500',
    white: 'bg-white ring-1 ring-neutral-600',
    yellow: 'bg-yellow-400',
    red: 'bg-red-500',
    green: 'bg-green-500',
  };

  return (
    <span 
      className={cn('rounded-full flex-shrink-0', sizeClasses[size], colorMap[marking.color as keyof typeof colorMap])}
      title={`${year} yılı işaret rengi: ${marking.label}`}
    />
  );
}

export function getQueenMarkingColor(year: number): { color: string; label: string } {
  const idx = (year - 2020) % 5;
  return QUEEN_MARKING_COLORS[idx];
}
```

### 4.2 QueenPerformanceCard (AI Performans Gösterimi)

```tsx
// components/queen/QueenPerformanceCard.tsx
interface QueenPerformanceCardProps {
  queen: Queen;
  hiveInspections: Inspection[];
  harvests: HoneyHarvest[];
}

export function QueenPerformanceCard({ queen, hiveInspections, harvests }: QueenPerformanceCardProps) {
  const metrics = useMemo(() => calculateQueenMetrics(queen, hiveInspections, harvests), [queen, hiveInspections, harvests]);

  const metricCards = [
    { key: 'productivity', label: 'Verim Etkisi', value: `${metrics.productivityImpact > 0 ? '+' : ''}${metrics.productivityImpact.toFixed(1)}%`, icon: TrendingUp, color: metrics.productivityImpact > 0 ? 'success' : 'error', description: 'Bölge ortalamasına göre' },
    { key: 'temperament', label: 'Huysuzluk', value: `${metrics.temperamentScore}/100`, icon: Smile, color: 'info', description: 'Muayene huysuzluk ort.' },
    { key: 'health', label: 'Hastalık Direnci', value: `${metrics.diseaseResistance}/100`, icon: Shield, color: 'warning', description: 'Varroa/nosema dayanıklılığı' },
    { key: 'broodPattern', label: 'Yumurtlama Düzeni', value: `${metrics.broodPatternScore}/10`, icon: Egg, color: 'honey', description: 'Petek doldurma kalitesi' },
  ];

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-50 flex items-center gap-2">
          <Crown className="w-5 h-5 text-honey-400" />
          Performans Analizi (AI)
        </h3>
        <Badge variant={getPerformanceBadgeVariant(queen.performance_score)}>
          {(queen.performance_score * 100).toFixed(0)}/100
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {metricCards.map(m => (
          <div key={m.key} className="p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
            <div className="flex items-center gap-2 mb-1">
              <m.icon className={cn('w-4 h-4', `text-${m.color}-400`)} />
              <span className="text-xs text-neutral-400">{m.label}</span>
            </div>
            <p className="text-xl font-bold text-neutral-50">{m.value}</p>
            <p className="text-[10px] text-neutral-500 mt-1">{m.description}</p>
          </div>
        ))}
      </div>

      {queen.performance_score < 0.6 && (
        <div className="mt-4 p-3 bg-warning-bg border-warning-border rounded-xl text-warning text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Performans bölgesel ortalamanın altında. Değişim değerlendirilebilir.</span>
        </div>
      )}
    </Card>
  );
}

function calculateQueenMetrics(queen: Queen, inspections: Inspection[], harvests: HoneyHarvest[]) {
  // Basit hesaplama - gerçekte AI Agent yapar
  const recentInspections = inspections.slice(0, 6);
  
  const avgStrength = recentInspections.reduce((sum, i) => sum + STRENGTH_SCORE[i.strength], 0) / (recentInspections.length || 1);
  const avgTemperament = recentInspections.reduce((sum, i) => sum + TEMPERAMENT_SCORE[i.temperament], 0) / (recentInspections.length || 1);
  const avgBroodPattern = recentInspections.reduce((sum, i) => sum + (i.brood_pattern_score || 5), 0) / (recentInspections.length || 1);
  
  const regionAvgHoney = 25; // kg/kovan/yıl - bölge verisinden gelecek
  const thisHiveHoney = harvests.reduce((sum, h) => sum + h.weight_kg, 0);
  const productivityImpact = ((thisHiveHoney - regionAvgHoney) / regionAvgHoney) * 100;

  return {
    productivityImpact,
    temperamentScore: Math.round(avgTemperament * 20),
    diseaseResistance: Math.round((1 - (inspections.filter(i => i.varroa_count && i.varroa_count > 3).length / (inspections.length || 1))) * 100),
    broodPatternScore: Math.round(avgBroodPattern),
  };
}

const STRENGTH_SCORE = { very_weak: 1, weak: 2, moderate: 3, strong: 4, very_strong: 5 };
const TEMPERAMENT_SCORE = { calm: 5, moderate: 3, defensive: 2, aggressive: 1 };
```

### 4.3 QueenPedigreeTree (Soy Ağacı Görselleştirme)

```tsx
// components/queen/QueenPedigreeTree.tsx
interface QueenPedigreeTreeProps {
  queen: Queen;
  allQueens: Queen[]; // For finding relatives
}

export function QueenPedigreeTree({ queen, allQueens }: QueenPedigreeTreeProps) {
  const mother = queen.mother_id ? allQueens.find(q => q.id === queen.mother_id) : null;
  const grandmother = mother?.mother_id ? allQueens.find(q => q.id === mother.mother_id) : null;
  const sisters = mother ? allQueens.filter(q => q.mother_id === mother.id && q.id !== queen.id) : [];

  return (
    <div className="space-y-6">
      {/* Ana Arı */}
      <div className="flex justify-center">
        <QueenNode queen={queen} highlight />
      </div>

      {/* Anne */}
      {mother && (
        <>
          <div className="flex justify-center"><Connector vertical /></div>
          <div className="flex justify-center">
            <QueenNode queen={mother} label="Anne" />
          </div>
          
          {grandmother && (
            <>
              <div className="flex justify-center"><Connector vertical /></div>
              <div className="flex justify-center">
                <QueenNode queen={grandmother} label="Anne-Annesi" />
              </div>
            </>
          )}
        </>
      )}

      {/* Kardeşler */}
      {sisters.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-medium text-neutral-400 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" /> Kardeş Ana Arılar ({sisters.length})
          </h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sisters.map(sister => (
              <QueenNode key={sister.id} queen={sister} compact />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function QueenNode({ queen, label, highlight, compact }: { queen: Queen; label?: string; highlight?: boolean; compact?: boolean }) {
  const markingColor = getQueenMarkingColor(new Date(queen.birth_date).getFullYear());
  
  return (
    <div className={cn('flex flex-col items-center gap-1', compact && 'w-24')}>
      {label && <span className="text-[10px] text-neutral-500">{label}</span>}
      <div className={cn(
        'relative w-16 h-16 rounded-xl border-2 flex items-center justify-center bg-neutral-800',
        highlight ? 'border-honey-400 ring-2 ring-honey-400/30' : 'border-neutral-700'
      )}>
        <div className="flex flex-col items-center gap-1">
          <Crown className="w-6 h-6 text-honey-400" />
          <span className="text-xs font-medium truncate w-full text-center">{queen.name || `Q-${queen.id.slice(0,6)}`}</span>
        </div>
        <QueenMarkingDot birthDate={queen.birth_date} size="sm" className="absolute -bottom-1 -right-1" />
        {queen.status !== 'active' && (
          <span className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center text-xs text-error">
            {QUEEN_STATUS_LABELS[queen.status]}
          </span>
        )}
      </div>
      <div className="text-center text-[10px] text-neutral-400 w-20">
        <div>{queen.strain}</div>
        <div>{format(new Date(queen.birth_date), 'yyyy', { locale: tr })} • {calculateAge(queen.birth_date)} ay</div>
        <div className="font-mono text-honey-400">{(queen.performance_score * 100).toFixed(0)}/100</div>
      </div>
    </div>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/queen.ts
interface Queen {
  id: string; // UUIDv7
  hiveId: string;
  userId: string;
  
  // Kimlik
  strain: 'anatolian' | 'caucasian' | 'carniolan' | 'italian' | 'hybrid' | 'other';
  birth_date: string; // ISO date
  source: 'bred' | 'purchased' | 'swarm' | 'supersedure' | 'emergency';
  supplier?: string; // Satın alındıysa
  cost_try?: number;
  
  // İşaretleme
  marked_color: 'white' | 'yellow' | 'red' | 'green' | 'blue'; // Otomatik yıl bazlı
  
  // Pedigree (Kendi yetiştirme için)
  mother_id?: string; // FK → Queen
  father_source?: string; // Baba arı kaynağı (satın alındıysa)
  rearing_method?: 'grafting' | 'jenter' | 'nicot' | 'walk_away' | 'natural';
  
  // Durum
  status: 'active' | 'superseded' | 'dead' | 'sold' | 'missing';
  superseded_at?: string;
  
  // Performans (AI Hesaplamalı)
  performance_score: number; // 0.00 - 1.00
  productivity_impact?: number; // Yüzde etkisi
  temperament_score?: number; // 0-100
  disease_resistance?: number; // 0-100
  brood_pattern_score?: number; // 0-10
  
  // Notlar
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// Yardımcı tipler
interface QueenRearingRecord {
  id: string;
  mother_queen_id: string;
  graft_date: string;
  cell_builder_hive_id: string;
  cells_grafted: number;
  cells_accepted: number;
  queens_emerged: number;
  queens_mated: number;
  notes?: string;
}
```

---

## 6. AI Entegrasyonu (QueenAgent)

```typescript
// agents/queenAgent.ts
interface QueenAgentInput {
  queen: Queen;
  hive: Hive;
  inspections: Inspection[];
  harvests: HoneyHarvest[];
  region: Region;
  season: Season;
}

interface QueenRecommendation {
  action: 'replace' | 'keep' | 'monitor' | 'requeen_now' | 'breed_from';
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  dueDate: string;
  confidence: number;
  references: string[]; // Literatür referansları
}

export async function analyzeQueen(input: QueenAgentInput): Promise<QueenRecommendation> {
  const { queen, hive, inspections, harvests, region, season } = input;
  const ageMonths = calculateAgeMonths(queen.birth_date);
  const recentInsp = inspections.slice(0, 3);
  
  // 1. Yaş kontrolü (Anadolu arısı 2-3 yıl optimum)
  if (ageMonths > 36) {
    return {
      action: 'replace',
      priority: 'high',
      reasoning: `Ana arı ${ageMonths} ay (${ageMonths/12} yıl) yaşında. Anadolu arısı için optimum üretkenlik 1-2 yıl, 3 yıldan sonra yumurtlama ve feromon üretimi belirgin düşer.`,
      dueDate: addDays(new Date(), 14).toISOString(),
      confidence: 0.9,
      references: ['Anadolu Arısı Yönetimi, s.67', 'COLOSS Queen Longevity Study 2021'],
    };
  }

  // 2. Performans skoru düşük
  if (queen.performance_score < 0.5) {
    return {
      action: 'replace',
      priority: 'high',
      reasoning: `Performans skoru ${(queen.performance_score*100).toFixed(0)}/100. Bölge ortalaması altındaysa (verim, huy, hastalık direnci) değişim kâr sağlar.`,
      dueDate: addDays(new Date(), 21).toISOString(),
      confidence: 0.85,
      references: ['TÜBİTAK Arıcılık Verimlilik Raporu 2023'],
    };
  }

  // 3. Supersedure riski (Doğal değiştirme)
  const supersedureRisk = calculateSupersedureRisk(queen, recentInsp);
  if (supersedureRisk > 0.7) {
    return {
      action: 'monitor',
      priority: 'medium',
      reasoning: `Supersedure (doğal değiştirme) riski %${(supersedureRisk*100).toFixed(0)}. Kraliçe hucreleri görüldüğünde müdahale hazırlığı रखें.`,
      dueDate: addDays(new Date(), 7).toISOString(),
      confidence: 0.75,
      references: ['Bee Culture: Supersedure Indicators'],
    };
  }

  // 4. Mevsimsel: Bahar başlangıcı yeni ana arı avantajı
  if (season === 'spring' && ageMonths > 12 && ageMonths < 24) {
    return {
      action: 'keep',
      priority: 'low',
      reasoning: 'Bahar akımı için optimum yaş aralığında (1-2 yıl). Güçlü yumurtlama ve sürgün kontrolü sağlar.',
      dueDate: addDays(new Date(), 90).toISOString(),
      confidence: 0.8,
      references: ['Anadolu Arısı Bahar Yönetimi'],
    };
  }

  // 5. Yetiştirme adayı (Elite performans)
  if (queen.performance_score > 0.85 && queen.source === 'bred') {
    return {
      action: 'breed_from',
      priority: 'low',
      reasoning: `Mükemmel performans (${(queen.performance_score*100).toFixed(0)}/100) ve kendi yetiştirme. Ana arı yetiştirme programına dahil edilebilir.`,
      dueDate: addDays(new Date(), 60).toISOString(),
      confidence: 0.8,
      references: ['Selection Breeding for Anatolian Honey Bee'],
    };
  }

  // Varsayılan: İzle
  return {
    action: 'monitor',
    priority: 'low',
    reasoning: 'Ana arı normal parametrelerde. Düzenli muayene yeterli.',
    dueDate: addDays(new Date(), 30).toISOString(),
    confidence: 0.9,
    references: [],
  };
}

function calculateSupersedureRisk(queen: Queen, inspections: Inspection[]): number {
  let risk = 0;
  const ageMonths = calculateAgeMonths(queen.birth_date);
  
  // Yaş faktörü
  if (ageMonths > 24) risk += 0.3;
  if (ageMonths > 30) risk += 0.2;
  
  // Performans düşüşü
  if (queen.performance_score < 0.6) risk += 0.2;
  
  // Son muayenelerde kraliçe hucreleri
  const recentQueenCells = inspections.filter(i => i.queen_status === 'cells_present').length;
  if (recentQueenCells > 0) risk += 0.3;
  
  // Yumurtalık alanı daralma
  const avgBrood = inspections.reduce((s, i) => s + (i.brood_area_pct || 0), 0) / (inspections.length || 1);
  if (avgBrood < 20) risk += 0.2;
  
  return Math.min(risk, 1);
}
```

---

## 7. Yıl Renk Kodu Takvimi (Uluslararası Standart)

| Yıl | Renk | Kod | Hatırlatma |
|-----|------|-----|------------|
| 2020 | 🔵 Mavi | B | "Mavi" → 2020, 2025, 2030... |
| 2021 | ⚪ Beyaz | W | "Beyaz" → 2021, 2026... |
| 2022 | 🟡 Sarı | Y | "Sarı" → 2022, 2027... |
| 2023 | 🔴 Kırmızı | R | "Kırmızı" → 2023, 2028... |
| 2024 | 🟢 Yeşil | G | "Yeşil" → 2024, 2029... |
| 2025 | 🔵 Mavi | B | 5 yıl döngü |

> **Kural:** Doğum yılına göre renk belirlenir. Kullanıcı manuel değiştirebilir (örn: satın alınan ana arı zaten işaretli gelmişse).

---

## 8. Offline ve Senkronizasyon

| İşlem | Offline | Senkron |
|-------|---------|---------|
| Ana arı değiştir | ✅ IndexedDB | `update_queen` (eski) + `create_queen` (yeni) |
| Performans güncelle | ✅ Local AI | `update_queen` (performance_score) |
| Pedigree girişi | ✅ | `create_queen` with mother_id |
| Satış/Transfer | ✅ | `update_queen` (status: sold) + `create_queen` (yeni sahiplik) |

---

## 9. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **İşaret Rengi** | `aria-label="2024 doğumlu, yeşil işaret"` + Şekil (daire) + Metin |
| **Performans** | `aria-label="Performans skoru 87 üzerinden 100, bölge ortalamasının üzeri"` |
| **S" |
| **Soy Ağacı** | Klavye navigasyonu: Ok tuşları ile düğümler arası, Enter ile detay |
| **Değişim Sihirbazı** | `aria-live="polite"` adım değişiklikleri için |

---

## 10. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| 2022 doğumlu ana arı → İşaret rengi | 🟡 Sarı |
| Ana arı değiştir (Kendi yetiştirme) | Eski: superseded, Yeni: active, mother_id set |
| Ana arı 38 ay, performans 0.45 | AI: "replace" high priority, gerekçe: yaş + performans |
| Supersedure hucreleri görüldü | Risk > 0.7, AI: "monitor" medium, 7 gün içinde kontrol |
| Satın alınan ana arı, tedarikçi girildi | Supplier field dolu, cost_try girildi |
| Offline ana arı değiştir → Online | 2 sync op, server ID'leri eşleşir |

---

## 11. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Ana Arı Yetiştirme Modülü** | Grafting takvimi, hücre kabul oranları, erginleşme takibi, eşleşme kontrolü |
| **Genetik Test Entegrasyonu** | DNA örneği → ırk safiyeti, hastalık direnci markerları, hygro behaviour |
| **Fotoğraftan İrk Tanıma** | CNN modeli: Ana arı fotoğrafından ırk/hibrit oranı tahmini |
| **Supersedure Erken Uyarı Sistemi** | Muayene fotoğraflarından kraliçe hucreleri tespiti (YOLO) |
| **Ana Arı Pazarı** | Kooperatif içinde satın alma/satma, referans puanları, garanti süreleri |
| **Çoklu Baba Arı Analizi** | Doğal eşleşmede baba arı katkısı analizi (Paternity analysis) |