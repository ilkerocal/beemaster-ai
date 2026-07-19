# BeeMaster AI — Analytics (Genel Analitik) Modülü v1.0

> **Amaç:** Tüm modüllerden toplanan verilerin çapraz analizi, trend tespiti, benchmarking, tahmin modelleri ve karar destek sistemleri. Modül bazlı analitiklerin (05_Modules/Analytics.md) üstünde, ürün geneli stratejik analitik.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/analytics` (Genel), `/analytics/comparison`, `/analytics/forecasting`, `/analytics/benchmarking` |
| **Erişim** | Free: Temel (3 grafik), Pro: Tam, Enterprise: Özel modeller + API |
| **Veri Kaynağı** | Materialized Views (`analytics.*`), Event Store, ML Pipeline |
| **Offline** | Önbellekli grafikler, yerel hesaplamalar |
| **Performans** | 10k+ kayıt < 2s render (Web Workers + Canvas) |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| GA-01 | Arıcı olarak sezonluk performansımı geçen yılla ve bölge ortalamasıyla karşılaştırmak istiyorum | P0 |
| GA-02 | "Hangi kovanlarım en karlı?" ve "Nerede para kaybediyorum?" sorularına anlık cevap almak istiyorum | P0 |
| GA-03 | Varroa trendi artıyorsa, 2 ay sonra ne olacağını tahmin eden model görmek istiyorum | P1 |
| GA-04 | Benim gibi Anadolu arısı yetiştiren, Eğil bölgesindeki diğer arıcılarla verimimi karşılaştırmak istiyorum | P1 |
| GA-05 | "Balıkesir'e göç ettirsem verim ne kadar artar?" gibi senaryo simülasyonu yapmak istiyorum | P2 |
| GA-06 | Kooperatife/vergiye sunulacak resmi analitik rapor otomatik hazırlansın | P0 |

---

## 3. Analitik Kategoriler

### 3.1 Performans Analitiği (Performance Analytics)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PERFORMANS DASHBOARD                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  KPI BAR (Sticky Top)                                                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Toplam    │ │Ort.      │ │Net Kar   │ │Kar Marjı │ │Aktif     │        │
│  │Kovan: 42 │ │Verim:28kg│ │125K TL   │ │%54.8     │ │Kovan: 38 │        │
│  │▲ +3      │ │▲ +12%    │ │▲ +18%    │ │▲ +2.1pp  │ │▼ -2      │        │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘        │
│                                                                             │
│  SEKMELER: [Verim] [Sağlık] [Maliyet] [Flora] [Karşılaştırma] [Tahmin]    │
│                                                                             │
│  VERİM SEKMESİ                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Verim Trendi (Çizgi)                                                │   │
│  │ 50 ┤     ╭────╮                                                      │   │
│  │ 40 ┤    ╱      ╲     Bölge Ort: ────                                │   │
│  │ 30 ┤   ╱        ╲    Benim: ──────                                  │   │
│  │ 20 ┤  ╱          ╲                                                 │   │
│  │ 10 ┤ ╱            ╲                                                │   │
│  │  0 ┼══════════════════                                               │   │
│  │    Oca Şub Mar Nis May Haz Tem Ağu Eyl Eki Kas Ara                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐          │
│  │ Kovan Bazlı      │ │ İrk Bazlı        │ │ Kutu Tipi Bazlı  │          │
│  │ Verim (Bar)      │ │ Verim (Bar)      │ │ Verim (Bar)      │          │
│  │ K-12: 45kg 🟢    │ │ Anadolu: 32kg    │ │ Langstroth: 30kg │          │
│  │ K-05: 12kg 🔴    │ │ Kafkas: 28kg     │ │ Dadant: 35kg     │          │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Sağlık Analitiği (Health Analytics)

| Grafik | Açıklama | Veri Kaynağı |
|--------|----------|--------------|
| **Varroa Trend + Eşik** | Çizgi grafik, eşik çizgisi (3), tedavi noktaları | `inspections.varroa_count` |
| **Hastalık Isı Haritası** | Kovan × Hastalık × Zaman (Renk: Yoğunluk) | `inspections.disease_signs` |
| **Tedavi Etkinlik Matrisi** | İlaç × Dozaj × Yöntem → Etkinlik % | `treatments` + `inspections` |
| **Sağlık Skoru Dağılımı** | Histogram (0-100), Kovan sayısı | AI hesaplamalı skor |
| **Riskli Kovanlar Listesi** | Filtrelenebilir: Risk > 0.7, Son muayene > 14 gün | AI risk skorları |

### 3.3 Maliyet/Gelir Analitiği (Financial Analytics)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FINANSAL ÖZET (Su Döşeme / Waterfall)               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  GELİRLER (Yeşil)                                                           │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Bal Satışı: 185,000 TL  ████████████████████████████████████        │   │
│  │ Ana Arı Satışı: 12,000 TL  ████████                                 │   │
│  │ Polen/Propolis: 5,500 TL  █████                                     │   │
│  │ ─────────────────────────────────────────────────────────────────   │   │
│  │ TOPLAM GELİR: 202,500 TL  ████████████████████████████████████████   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  GİDERLER (Kırmızı - Negatif)                                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Besleme (Şeker/Paté): 28,000 TL ██████████████                      │   │
│  │ İlaç/Tedavi: 15,000 TL       ████████                               │   │
│  │ Ekipman/Bakım: 22,000 TL       ████████████                         │   │
│  │ İşçilik: 18,000 TL             ███████████                          │   │
│  │ Lojistik/Seyahat: 8,500 TL     ██████                               │   │
│  │ ─────────────────────────────────────────────────────────────────   │   │
│  │ TOPLAM GİDER: 91,500 TL        ████████████████████                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  NET KAR: 111,000 TL (Marj: %54.8)                                          │
│  Kovan Başına Kar: 2,640 TL                                                 │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Aylık Nakit Akışı (Bar)                                             │   │
│  │ Mar: -15K  │ Apr: +25K  │ May: +45K  │ Haz: +35K  │ Tem: -10K     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Flora ve Çevresel Analitik

| Analitik | Açıklama | Kullanım |
|----------|----------|----------|
| **Flora Katkı Analizi** | Geven %40, Kekik %35, Ada Çayı %15, Diğer %10 | Bal tipi tahmini, fiyatlandırma |
| **Hava Korelasyonu** | Sıcaklık/Yağış vs Günlük Hasat (Scatter + Trend) | Hasat zamanı optimizasyonu |
| **Bölgesel Flora Karşılaştırması** | Eğil vs Karacadağ vs Siverek çiçeklenme takvimi | Göç rotası planlaması |
| **Nektar Akışı Tahmini** | Hava + Flora + Kovan gücü → Gelecek 2 hafta | Besleme/Hasat kararı |

---

## 4. Benchmarking (Karşılaştırma Analitiği)

### 4.1 Karşılaştırma Boyutları

| Boyut | Filtreler | Metrikler |
|-------|-----------|-----------|
| **Kendi Geçmişim** | YoY (Yıl üst üste), Sezon bazlı | Verim, Maliyet, Sağlık, Kar |
| **Bölge Ortalaması** | İl/İlçe, Benzer iklim, Benzer flora | Verim, Varroa prevalansı, Maliyet |
| **İrk Bazlı** | Anadolu vs Kafkas vs Karnika vs İtalyan | Verim, Huy, Kış geçirimi, Hastalık direnci |
| **Kutu Tipi** | Langstroth vs Dadant vs Layens | Verim/kg, İşçilik, Maliyet |
| **Kooperatif/Grubum** | Üye bazlı (anonim) | Sıralama, En iyi uygulamalar |
| **Ülke Geneli (Anonim)** | Tüm BeeMaster kullanıcıları (opt-in) | Trendler, En iyi/birinci yüzdelik |

### 4.2 Gizlilik ve Veri Paylaşımı

```typescript
// analytics/benchmarking.ts
interface BenchmarkConfig {
  scope: 'self' | 'region' | 'strain' | 'cooperative' | 'national';
  anonymization: 'full' | 'aggregated_only'; // Kullanıcı ID gizli
  optIn: boolean; // Kullanıcı onayı
  filters: {
    region?: string;
    strain?: string;
    boxType?: string;
    hiveCountRange?: [number, number];
  };
}

// Veri hazırlama: Kullanıcı verisi asla ham paylaşılmaz
function prepareBenchmarkData(userData: UserData, config: BenchmarkConfig): BenchmarkDataset {
  if (!config.optIn) return { error: 'Opt-in gerekli' };
  
  return {
    metrics: aggregateToPercentiles(userData, [10, 25, 50, 75, 90]),
    sampleSize: countSimilarUsers(config.filters),
    period: getCurrentSeason(),
    // Ham veri YOK, sadece yüzdelikler ve örneklem büyüklüğü
  };
}
```

---

## 5. Tahmin Modelleri (Forecasting & Predictive Analytics)

### 5.1 Model Portföyü

| Model | Girdi | Çıktı | Horizon | Güncelleme |
|-------|-------|-------|---------|------------|
| **Yield Forecast** | Flora, Hava, Kovan gücü, Geçmiş | kg/kovan (min/max/expected) | 1-12 ay | Haftalık |
| **Varroa Risk** | Sayım trendi, Hava, Yumurtalık, Bölge | Risk skoru (0-1), Tahmini sayım | 2-8 hafta | Her muayene |
| **Colony Strength** | Mevsim, Besleme, Tedavi, Geçmiş | Güç seviyesi (5liyesi, Olumsuz/Değişmez/Pozitif) | 1-4 hafta | Haftalık |
| **Mortality Risk** | Varroa, Güç, Kış hazırlığı, Bölge | Kayıp olasılığı % | Sezonluk | Ayda bir |
| **Honey Price** | Pazar verileri, İhracat, Mevsim, Kalite | TL/kg (min/max/expected) | 1-6 ay | Haftalık |
| **Cash Flow** | Gelir/Gider trendi, Planlı harcamalar | Nakit akışı (haftalık) | 12 ay | Haftalık |

### 5.2 Tahmin Çıktı Formatı

```typescript
interface ForecastResult {
  model: 'yield' | 'varroa' | 'strength' | 'mortality' | 'price' | 'cashflow';
  horizon: string; // '1m', '3m', 'season'
  predicted: number;
  confidenceInterval: { lower: number; upper: number; level: 0.8 | 0.95 };
  featureImportance: { feature: string; importance: number }[]; // SHAP values
  scenarios?: { name: string; predicted: number; assumptions: string[] }[];
  modelVersion: string;
  generatedAt: string;
  explainability: {
    summary: string; // "Gelecek ay verim 28kg tahmin ediliyor (bölge ort: 25kg). Ana sürücüler: Geven yoğunluğu %40, Kovan gücü +15%."
    keyDrivers: string[];
    risks: string[];
  };
}
```

### 5.3 Senaryo Simülasyonu (What-If Analysis)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SENARYO SİMÜLASYONU: "Balıkesir Göçü"                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  MEVCUT DURUM (Eğil, Diyarbakır)                                           │
│  ├─ Kovan: 40  ├─ Tahmini Verim: 1,120 kg  ├─ Maliyet: 45K TL              │
│  ├─ Net Kar: 67K TL  └─ ROI: %149                                         │
│                                                                             │
│  SENARYO: "15 Mayıs - 15 Temmuz Balıkesir'e Göç"                           │
│  ├─ Parametreler:                                                          │
│  │  ✓ Flora: Geven + Kestane + Çam (Yoğunluk +60%)                        │
│  │  ✓ Mesafe: 850 km (Yakıt +15K TL)                                       │
│  │  ✓ Göç Süresi: 3 gün (Kovan stresi: Geçici güç düşüşü %10)             │
│  │  ✓ Kışlama: Balıkesir (Daha ılıman, Besleme -20%)                      │
│  │  ✗ Risk: Yol hasarı %2, Hastalık bulaşma %5                            │
│  │                                                                         │
│  ├─ TAHMİN SONUÇLARI (Monte Carlo 1000 simülasyon):                        │
│  │  Verim: 1,120 → 1,680 kg (+50%, CI: +35%/+65%)                         │
│  │  Maliyet: 45K → 58K TL (+13K: Yakıt+Kira+İşçilik)                      │
│  │  Net Kar: 67K → 110K TL (+64%, CI: +40%/+90%)                          │
│  │  ROI: %149 → %190                                                      │
│  │                                                                         │
│  ├─ RİSK ANALİZİ:                                                          │
│  │  🟢 Yüksek güven: Flora verisi güçlü, geçmiş göç verileri var          │
│  │  🟡 Orta risk: Kovan stresi, ilk hafta verim düşüşü                    │
│  │  🔴 Düşük risk: Araç arızası, ani hava değişimi                        │
│  │                                                                         │
│  └─ ÖNERİ: "Göç karlı görünüyor. 1 Mayıs'tan önce yola çıkın,              │
│            kovan girişlerini kapatın, suya dikkat edin."                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. AI Destekli Özetler (AI-Generated Insights)

```typescript
// analytics/aiInsights.ts
interface AIInsight {
  id: string;
  type: 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'recommendation';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  evidence: string[]; // Veri kanıtları
  actionable: boolean;
  suggestedActions: SuggestedAction[];
  affectedEntities: { type: 'hive' | 'apiary'; ids: string[] }[];
  generatedAt: string;
  expiresAt?: string;
}

// Örnek İçerikler
const sampleInsights: AIInsight[] = [
  {
    type: 'anomaly',
    priority: 'critical',
    title: 'Kovan-12: Varroa 3 haftada 2→12 arttı',
    description: 'Alkol yıkama sayımı %12 enfeksiyon gösteriyor. Kayıp riski %40+. Acil tedavi gerekli.',
    evidence: ['Varroa: 2→5→12 (son 3 muayene)', 'Eşik: 3', 'Trend: +140%/ay'],
    actionable: true,
    suggestedActions: [
      { action: 'Okzalik asidi buhar tedavisi başlat', priority: 'critical', dueDate: '2026-07-22' },
      { action: '7 gün sonra kontrol sayımı planla', priority: 'high', dueDate: '2026-07-29' },
    ],
    affectedEntities: [{ type: 'hive', ids: ['hive-12'] }],
  },
  {
    type: 'opportunity',
    priority: 'high',
    title: 'Geven çiçeklenmesi başlıyor - Hasat penceresi 10-14 gün',
    description: 'Bölgenizde Geven %80 yoğunlukta çiçeklenmeye başladı. Operkül oranı %70+ ise hasat yapın.',
    evidence: ['Flora takvimi: Geven yoğunluk %80', 'Hava: 24°C, güneşli, rüzgarsız', 'Kovan-03 operkül %75'],
    actionable: true,
    suggestedActions: [
      { action: 'Operkül oranını kontrol et', priority: 'high' },
      { action: 'Hasat planla (önümüzdeki 10 gün içinde)', priority: 'high' },
    ],
    affectedEntities: [{ type: 'apiary', ids: ['apiary-eğil'] }],
  },
  {
    type: 'recommendation',
    priority: 'medium',
    title: 'Kış beslemesi için şeker stoğu yetersiz',
    description: 'Planlı 2:1 şekerli su (40 kovan × 15kg = 600kg şeker). Stokta 200kg var. 400kg sipariş gerekli.',
    evidence: ['Kovan sayısı: 40', 'Hedef: 15kg/kovan', 'Mevcut stok: 200kg', 'Gerekli: 600kg'],
    actionable: true,
    suggestedActions: [
      { action: '400kg şeker siparişi ver (Tedarikçi: Şeker A.Ş.)', priority: 'high' },
      { action: 'Besleme programını 15 Ekim başlat', priority: 'medium' },
    ],
    affectedEntities: [{ type: 'apiary', ids: ['apiary-eğil', 'apiary-karacadağ'] }],
  },
];
```

---

## 7. Raporlama ve Export

| Format | Kullanım Alanı | Özellikler |
|--------|----------------|------------|
| **PDF** | Resmi raporlar, vergi, kooperatif | Şablonlu, sayfa numarası, imza alanı, logo |
| **Excel** | Veri analizi, pivottable, hesaplamalar | Çoklu sayfa, formüller korunaklı, koşullu biçimlendirme |
| **CSV** | Diğer sistemlere import, makine öğrenmesi | UTF-8, noktalı virgül/ virgül ayırıcı |
| **JSON** | API entegrasyonu, webhook | Şema versiyonlu, metadata dahil |
| **PowerPoint** | Sunumlar, toplantılar | Grafikler vektörel, şablonlu slaytlar |

---

## 8. Performans ve Ölçeklenebilirlik

| Teknik | Uygulama |
|--------|----------|
| **Web Workers** | Veri işleme, agregasyon, CSV parse → Main thread serbest |
| **Canvas/WebGL** | 10k+ veri noktası grafiklerde (Chart.js Canvas, uPlot) |
| **LTTB Downsampling** | >5000 nokta → 500 nokta (Görsel kalite koruyarak) |
| **Virtual Scrolling** | 1000+ satır tablolarda (TanStack Virtual) |
| **Query Caching** | TanStack Query: 5 dk stale, 30 dk garbage collection |
| **Materialized Views** | Saatlik yenileme, OLAP sorguları anlık |
| **Progressive Render** | Önce özet (100 pt), sonra detay (tüm veri) |

---

## 9. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Doğal Dil Sorgu** | "Son 6 ayda Eğil'de ortalama verim neydi?" → SQL + Grafik |
| **Anomali Tespiti (ML)** | Otomatik: "Kovan-12 verimi %40 düştü, normal varyasyon %5-10" |
| **Kovan Benzerlik Ağı** | "Benim kovanlarıma en benzer 10 kovan (verim, iklim, ırk) nasıl performans gösterdi?" |
| **Pazar Tahmini** | Bölgesel bal fiyatı + üretim miktarı → Optimal satış zamanı |
| **İklim Uyum Skoru** | "2030 tahminine göre bu üste %15 verim düşüşü bekleniyor" |
| **Paylaşımlı Analitik** | Mentor/Öğrenci: "Öğrencimin verimi bölge altındaydı, bu grafikte göster" |