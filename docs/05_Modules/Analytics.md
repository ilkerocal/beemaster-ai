# BeeMaster AI — Analytics (Analitik) Modülü v1.0

> **Amaç:** Veri odaklı kararlar için görselleştirme, trend analizi, benchmarking, tahmin modelleri. Dashboard özeti değil, derinlemesine analitik keşif aracı.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/analytics` |
| **Erişim** | Free: Temel (3 grafik), Pro: Tam, Enterprise: Özel modeller + API |
| **Veri Kaynağı** | IndexedDB (lokal agregasyon) + Supabase (Materialized Views) |
| **Offline** | Önbelleğe alınmış grafikler, yerel hesaplamalar |
| **Performans** | 10k+ kayıt < 2s render (Web Workers + Canvas/WebGL) |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| AN-01 | Arıcı olarak kovan verim trendini aylık/yıllık görmek, ani düşüşleri tespit etmek | P0 |
| AN-02 | Varroa sayım trendini eşik çizgisiyle birlikte izlemek, sezonsal desenleri görmek | P0 |
| AN-03 | Arı üssü bazında performans karşılaştırması: Verim, maliyet, sağlık | P0 |
| AN-04 | Bölgesel benchmark: "Eğil'de benim verimim vs bölge ortalaması" | P1 |
| AN-05 | Flora etkisi analizi: Hangi çiçeklenme döneminde ne kadar bal? | P1 |
| AN-06 | Maliyet/gelir analizi: Kovan başına, üs başına, sezonluk kar marjı | P1 |
| AN-07 | AI tahmin: "Gelecek ay verim tahmini", "Varroa risk tahmini" | P1 |
| AN-08 | Özel rapor: Kendi metriği tanımlama (Formül editörü) | P2 |

---

## 3. UI Yapısı

```
AnalyticsPage
├── Header: "Analitik" + Zaman Aralığı [Bu Ay ▼] + [Kaydet/Paylaş] + [Özel Metrik]
├── KPI Bar (Sticky, 4 kart)
│   ├── Toplam Hasat (kg) + Trend
│   ├── Ort. Kovan Verimi (kg) + vs Bölge
│   ├── Net Kar (TL) + Marj %
│   └── Aktif Kovan Sayısı + Sağlıklı %
│
├── Ana Sekmeler (Tabs)
│   ├── [Verim] [Sağlık] [Maliyet] [Flora] [Tahmin] [Özel]
│
├── VERİM SEKMESİ
│   ├── Grafik Seçici: [Çizgi] [Çubuk] [Alan] [Isı Haritası]
│   ├── Boyut: [Kovan] [Üs] [İrk] [Kutu Tipi] [Bal Tipi]
│   ├── Metrik: [Toplam kg] [kg/Kovan] [kg/Çerçeve] [Verim Değişimi %]
│   ├── Zaman: [Günlük] [Haftalık] [Aylık] [Sezonluk]
│   └── Grafik Alanı (Recharts/Chart.js - Interactive)
│       ├── Tooltip: Detaylı veri noktası
│       ├── Zoom/Pan: Seçili aralık
│       ├── Seri Toggle: Legend tıklama
│       └── Export: PNG/CSV
│
├── SAĞLIK SEKMESİ
│   ├── Varroa Trend (Çizgi + Eşik Çizgisi)
│   ├── Hastalık Isı Haritası (Kovan × Hastalık × Zaman)
│   ├── Tedavi Etkinlik Matrisi (İlaç × Dozaj × Yöntem → Etkinlik %)
│   ├── Kovan Sağlık Skoru Dağılımı (Histogram)
│   └── Riskli Kovanlar Listesi (Filtrelenebilir)
│
├── MALİYET SEKMESİ
│   ├── Gider Kategorileri (Yığın Çubuk: Besleme/İlaç/Ekipman/İşçilik/Seyahat)
│   ├── Gelir Kategorileri (Bal/Arı/Polen/Propolis)
│   ├── Kar/Zarar Su Döşeme Grafiği (Waterfall)
│   ├── Kovan Bazlı Maliyet/Verim Scatter Plot
│   └── ROI Hesaplayıcı (Girdi → Çıktı simülasyonu)
│
├── FLORA SEKMESİ
│   ├── Çiçeklenme Takvimi vs Hasat Isı Haritası
│   ├── Flora Katkı Analizi (Geven %40, Kekik %35, Ada Çayı %15...)
│   ├── Hava Korelasyonu: Sıcaklık/Yağış vs Günlük Hasat
│   └── Bölgesel Flora Karşılaştırması
│
├── TAHMİN SEKMESİ (Pro+)
│   ├── Model Seçici: [Verim] [Varroa] [Güç] [Maliyet]
│   ├── Tahmin Penceresi: [1 Hafta] [1 Ay] [3 Ay] [Sezon Sonu]
│   ├── Güven Aralığı: %80 / %95 (Bant grafiği)
│   ├── Özellik Önem Grafiği (SHAP values)
│   └── Senaryo Simülasyonu: "Eğer 2:1 şekerli su verirsem..."
│
└── ÖZEL SEKMESİ (Pro+)
    ├── Metrik Oluşturucu (Drag-Drop Formül)
    │   Metrik Adı: [Verim Maliyet Oranı]
    │   Formül: [Toplam Hasat] / [Toplam Maliyet] * 100
    │   Gruplama: [Üs] [Kovan] [Ay]
    │   Filtre: [İrk = Anadolu] [Güç > Orta]
    ├── Kaydedilmiş Özel Metrikler Listesi
    └── Dashboard'a Pinleme
```

---

## 4. Grafik Türleri ve Kullanım Alanları

| Grafik | Kullanım | Veri Yapısı |
|--------|----------|-------------|
| **Line Chart** | Zaman serisi: Verim, Varroa, Maliyet, Güç | `{ date, value, series }[]` |
| **Bar Chart** | Kategorik karşılaştırma: Üs, İrk, Bal tipi | `{ category, value, series }[]` |
| **Area Chart** | Birikimli: Toplam hasat, kümülatif maliyet | `{ date, value, series }[]` |
| **Stacked Bar** | Parça-bütün: Gider kategorileri, Bal tipleri | `{ category, series, value }[]` |
| **Scatter Plot** | Korelasyon: Maliyet vs Verim, Sıcaklık vs Hasat | `{ x, y, label, series }[]` |
| **Heatmap** | 2D yoğunluk: Kovan × Zaman × Varroa | `{ row, col, value }[]` |
| **Histogram** | Dağılım: Sağlık skorları, verim dağılımı | `{ bin, count }[]` |
| **Waterfall** | Artı/eksi: Aylık kar/zarar bileşenleri | `{ category, value, type: 'income'|'expense' }[]` |
| **Gauge/KPI** | Tek değer: Risk skoru, performans % | `{ value, min, max, thresholds }` |
| **Treemap** | Hiyerarşik: Üs → Kovan → Çerçeve değeri | `{ name, value, children }[]` |

---

## 5. Bileşen Detayları

### 5.1 AnalyticsChart (Genel Grafik Bileşeni)

```tsx
// components/analytics/AnalyticsChart.tsx
interface AnalyticsChartProps {
  data: ChartDataPoint[];
  config: ChartConfig;
  onDataPointClick?: (point: ChartDataPoint) => void;
  onRangeSelect?: (range: { start: Date; end: Date }) => void;
  height?: number;
  showToolbar?: boolean;
}

export function AnalyticsChart({ data, config, onDataPointClick, onRangeSelect, height = 350, showToolbar = true }: AnalyticsChartProps) {
  const [chartType, setChartType] = useState(config.defaultType || 'line');
  const [zoomDomain, setZoomDomain] = useState<[Date, Date] | null>(null);
  const [visibleSeries, setVisibleSeries] = useState(config.series.map(s => s.key));

  // Veri filtreleme
  const filteredData = useMemo(() => 
    data.filter(d => visibleSeries.includes(d.series))
      .filter(d => !zoomDomain || (d.date >= zoomDomain[0] && d.date <= zoomDomain[1])),
  [data, visibleSeries, zoomDomain]);

  const seriesConfig = useMemo(() => 
    config.series.filter(s => visibleSeries.includes(s.key)),
  [config.series, visibleSeries]);

  return (
    <Card variant="bordered" padding={showToolbar ? 'none' : 'md'} className="h-full">
      {showToolbar && (
        <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-neutral-50">{config.title}</h3>
            {config.subtitle && <p className="text-sm text-neutral-400">{config.subtitle}</p>}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Grafik Türü */}
            <SegmentedControl
              value={chartType}
              onChange={setChartType}
              options={['line', 'bar', 'area', 'scatter'].map(t => ({ value: t, label: CHART_TYPE_LABELS[t], icon: CHART_TYPE_ICONS[t] }))}
            />
            
            {/* Seri Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">{visibleSeries.length}/{config.series.length}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {config.series.map(s => (
                  <DropdownMenuCheckboxItem
                    key={s.key}
                    checked={visibleSeries.includes(s.key)}
                    onCheckedChange={checked => setVisibleSeries(v => checked ? [...v, s.key] : v.filter(x => x !== s.key))}
                    className="flex items-center gap-2"
                  >
                    <span className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
                    {s.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Export */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => exportChart('png')}>
                  <Image className="w-4 h-4 mr-2" /> PNG Görüntü
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => exportChart('csv')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> CSV Verisi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div className="relative h-full" style={{ height: showToolbar ? `calc(${height}px - 56px)` : height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart(chartType, filteredData, seriesConfig, config, zoomDomain, onRangeSelect)}
        </ResponsiveContainer>
        
        {/* Zoom Reset Butonu */}
        {zoomDomain && (
          <button 
            onClick={() => setZoomDomain(null)}
            className="absolute bottom-2 right-2 z-10 px-2 py-1 bg-neutral-900/90 backdrop-blur rounded-lg text-xs text-neutral-400 hover:text-honey-400 border border-neutral-700"
          >
            Zoom Sıfırla
          </button>
        )}
      </div>
    </Card>
  );
}

function renderChart(type: string, data: ChartDataPoint[], series: SeriesConfig[], config: ChartConfig, zoomDomain: [Date, Date] | null, onRangeSelect?: (range: { start: Date; end: Date }) => void) {
  const commonProps = {
    data,
    margin: { top: 10, right: 30, left: 10, bottom: 10 },
  };

  switch (type) {
    case 'line':
      return (
        <LineChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" type="number" domain={zoomDomain ? [zoomDomain[0].getTime(), zoomDomain[1].getTime()] : 'auto'} tick={{ fill: '#737373', fontSize: 11 }} tickFormatter={v => format(new Date(v), 'dd MMM', { locale: tr })} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip 
            content={<CustomTooltip series={series} />}
            cursor={{ strokeDasharray: '3 3', stroke: '#fbbf24' }}
          />
          <Legend />
          {series.map(s => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
              name={s.label}
            />
          ))}
          <Brush 
            dataKey="date" 
            height={30} 
            stroke="#fbbf24"
            onChange={onRangeSelect}
          />
        </LineChart>
      );
    case 'bar':
      return (
        <BarChart {...commonProps} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" tick={{ fill: '#737373', fontSize: 11 }} />
          <YAxis dataKey="category" type="category" width={120} tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip series={series} />} />
          <Legend />
          {series.map(s => (
            <Bar key={s.key} dataKey={s.key} fill={s.color} name={s.label} radius={[0, 4, 4, 0]} />
          ))}
        </BarChart>
      );
    case 'area':
      return (
        <AreaChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" type="number" tick={{ fill: '#737373', fontSize: 11 }} tickFormatter={v => format(new Date(v), 'dd MMM', { locale: tr })} />
          <YAxis tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip series={series} />} />
          <Legend />
          {series.map(s => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.3}
              name={s.label}
            />
          ))}
        </AreaChart>
      );
    case 'scatter':
      return (
        <ScatterChart {...commonProps}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" tick={{ fill: '#737373', fontSize: 11 }} />
          <YAxis type="number" tick={{ fill: '#737373', fontSize: 11 }} />
          <Tooltip content={<CustomTooltip series={series} />} />
          <Legend />
          {series.map(s => (
            <Scatter key={s.key} data={data.filter(d => d.series === s.key)} fill={s.color} name={s.label} shape="circle" />
          ))}
        </ScatterChart>
      );
    default:
      return null;
  }
}
```

### 5.2 KPICard (Analitik KPI Kartı)

```tsx
// components/analytics/KPICard.tsx
interface KPICardProps {
  label: string;
  value: string | number;
  trend?: { value: number; period: string }; // +12% vs önceki ay
  benchmark?: { value: number; label: string; source: string }; // Bölge ort: 28.5 kg
  icon: React.ReactNode;
  color: 'honey' | 'success' | 'warning' | 'error' | 'info';
  sparklineData?: number[]; // Mini trend
  onClick?: () => void;
}

export function KPICard({ label, value, trend, benchmark, icon, color, sparklineData, onClick }: KPICardProps) {
  const colorMap = {
    honey: 'text-honey-400 bg-honey-400/10 border-honey-400/20',
    success: 'text-success bg-success-bg border-success-border',
    warning: 'text-warning bg-warning-bg border-warning-border',
    error: 'text-error bg-error-bg border-error-border',
    info: 'text-info bg-info-bg border-info-border',
  };

  const trendColor = trend && trend.value > 0 ? 'text-success' : trend && trend.value < 0 ? 'text-error' : 'text-neutral-500';
  const trendIcon = trend && trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : trend && trend.value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;

  return (
    <Card 
      variant="bordered" 
      padding="md" 
      className={cn('transition-all duration-200', onClick && 'cursor-pointer hover:border-honey-400 hover:shadow-lg')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-xl', colorMap[color])}>
          {icon}
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            {trendIcon} {Math.abs(trend.value)}% {trend.period}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <p className="text-2xl font-bold text-neutral-50">{value}</p>
        <p className="text-xs text-neutral-400 mt-1">{label}</p>
      </div>

      {benchmark && (
        <div className="mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between text-xs">
          <span className="text-neutral-400">{benchmark.label}</span>
          <span className={cn('font-mono font-medium', 
            typeof value === 'number' && typeof benchmark.value === 'number' && value >= benchmark.value ? 'text-success' : 'text-warning'
          )}>
            {benchmark.value} {benchmark.source}
          </span>
        </div>
      )}

      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-3 h-12">
          <Sparkline data={sparklineData} color={color} />
        </div>
      )}
    </Card>
  );
}
```

### 5.3 CustomTooltip (Grafik Tooltip)

```tsx
// components/analytics/CustomTooltip.tsx
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string; dataKey: string; payload: ChartDataPoint }>;
  label?: string | number;
}

export function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const first = payload[0];
  const date = first.payload?.date ? format(new Date(first.payload.date), 'dd MMM yyyy', { locale: tr }) : label;

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-xl p-3 shadow-lg min-w-[200px]">
      <p className="font-medium text-neutral-50 mb-2">{date}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-neutral-400">{entry.name}:</span>
          <span className="font-mono font-medium text-neutral-50 ml-auto">
            {typeof entry.value === 'number' ? entry.value.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : entry.value}
          </span>
        </div>
      ))}
      {first.payload?.hive_name && (
        <p className="mt-2 text-xs text-neutral-500 flex items-center gap-1">
          <Home className="w-3 h-3" /> {first.payload.hive_name}
        </p>
      )}
    </div>
  );
}
```

---

## 6. Veri İşleme ve Agregasyon (Backend)

### 6.1 Materialized Views (Supabase/PostgreSQL)

```sql
-- analytics/hive_monthly_summary.matview.sql
CREATE MATERIALIZED VIEW analytics.hive_monthly_summary AS
SELECT 
  h.id AS hive_id,
  h.apiary_id,
  h.user_id,
  date_trunc('month', i.inspected_at)::date AS month,
  -- Verim
  COALESCE(SUM(hv.weight_kg) FILTER (WHERE date_trunc('month', hv.harvested_at) = date_trunc('month', i.inspected_at)), 0) AS total_honey_kg,
  COUNT(DISTINCT hv.id) AS harvest_count,
  -- Güç
  AVG(CASE i.strength 
    WHEN 'very_weak' THEN 1 
    WHEN 'weak' THEN 2 
    WHEN 'moderate' THEN 3 
    WHEN 'strong' THEN 4 
    WHEN 'very_strong' THEN 5 
  END) AS avg_strength_score,
  -- Varroa
  AVG(i.varroa_count) FILTER (WHERE i.varroa_count IS NOT NULL) AS avg_varroa,
  MAX(i.varroa_count) FILTER (WHERE i.varroa_count IS NOT NULL) AS max_varroa,
  -- Tedavi
  COUNT(DISTINCT t.id) FILTER (WHERE date_trunc('month', t.started_at) = date_trunc('month', i.inspected_at)) AS treatment_count,
  -- Besleme
  COALESCE(SUM(f.amount_kg) FILTER (WHERE date_trunc('month', f.fed_at) = date_trunc('month', i.inspected_at)), 0) AS total_feed_kg,
  COALESCE(SUM(f.cost_try) FILTER (WHERE date_trunc('month', f.fed_at) = date_trunc('month', i.inspected_at)), 0) AS total_feed_cost,
  -- Maliyet
  COALESCE(SUM(t.cost_try) FILTER (WHERE date_trunc('month', t.started_at) = date_trunc('month', i.inspected_at)), 0) AS total_treatment_cost
FROM hives h
LEFT JOIN inspections i ON i.hive_id = h.id
LEFT JOIN honey_harvests hv ON hv.hive_id = h.id
LEFT JOIN treatments t ON t.hive_id = h.id
LEFT JOIN feedings f ON f.hive_id = h.id
WHERE h.deleted_at IS NULL
GROUP BY h.id, h.apiary_id, h.user_id, date_trunc('month', i.inspected_at);

CREATE UNIQUE INDEX ON analytics.hive_monthly_summary (hive_id, month);
```

### 6.2 Bölgesel Benchmark View

```sql
-- analytics/regional_benchmark.matview.sql
CREATE MATERIALIZED VIEW analytics.regional_benchmark AS
SELECT 
  r.id AS region_id,
  r.name AS region_name,
  date_trunc('month', i.inspected_at)::date AS month,
  -- Verim
  AVG(hive_yield.total_kg) AS avg_yield_per_hive,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY hive_yield.total_kg) AS median_yield,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY hive_yield.total_kg) AS p90_yield,
  -- Varroa
  AVG(hive_health.avg_varroa) AS avg_varroa,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY hive_health.max_varroa) AS p90_varroa,
  -- Sağlık
  AVG(hive_health.avg_strength_score) AS avg_strength,
  COUNT(DISTINCT h.id) * 100.0 / NULLIF(SUM(CASE WHEN h.status = 'active' THEN 1 ELSE 0 END), 0) AS survival_rate,
  -- Maliyet
  AVG(hive_cost.total_cost) AS avg_cost_per_hive
FROM regions r
JOIN apiaries a ON ST_Contains(r.polygon, a.location) OR a.region_id = r.id
JOIN hives h ON h.apiary_id = a.id
JOIN analytics.hive_monthly_summary hive_yield ON hive_yield.hive_id = h.id AND hive_yield.month = date_trunc('month', i.inspected_at)::date
JOIN analytics.hive_monthly_summary hive_health ON hive_health.hive_id = h.id AND hive_health.month = date_trunc('month', i.inspected_at)::date
JOIN analytics.hive_monthly_summary hive_cost ON hive_cost.hive_id = h.id AND hive_cost.month = date_trunc('month', i.inspected_at)::date
LEFT JOIN inspections i ON i.hive_id = h.id
WHERE h.deleted_at IS NULL AND h.status = 'active'
GROUP BY r.id, r.name, date_trunc('month', i.inspected_at);
```

---

## 7. AI Tahmin Modelleri (AnalyticsAgent)

```typescript
// agents/analyticsAgent.ts
interface PredictionRequest {
  model: 'yield' | 'varroa' | 'strength' | 'cost' | 'mortality';
  hiveId?: string;
  apiaryId?: string;
  horizon: '1w' | '1m' | '3m' | 'season';
  features: Record<string, any>; // Hava, flora, geçmiş, kovan durumu
}

interface PredictionResult {
  predicted: number;
  confidence_interval: { lower: number; upper: number; level: 0.8 | 0.95 };
  feature_importance: { feature: string; importance: number }[];
  scenario_analysis?: { scenario: string; predicted: number }[];
  model_version: string;
  generated_at: string;
}

export async function predictAnalytics(request: PredictionRequest): Promise<PredictionResult> {
  // 1. Feature Engineering
  const features = await buildFeatures(request);
  
  // 2. Model Seçimi (Local vs Remote)
  const useRemote = request.horizon === 'season' || request.model === 'mortality';
  
  if (useRemote && navigator.onLine) {
    return predictRemote(request, features);
  } else {
    return predictLocal(request, features);
  }
}

// Yerel Model (TensorFlow.js / ONNX Runtime Web)
async function predictLocal(request: PredictionRequest, features: number[]): Promise<PredictionResult> {
  const model = await getLocalModel(request.model);
  const input = new Float32Array([features]);
  const output = await model.predict(input);
  
  // Basit güven aralığı (Monte Carlo Dropout veya Quantile Regression)
  const predictions = await Promise.all(
    Array(20).fill(0).map(() => model.predict(input, { training: true })) // MC Dropout
  );
  
  const mean = predictions.reduce((a, b) => a + b, 0) / predictions.length;
  const std = Math.sqrt(predictions.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / predictions.length);
  
  return {
    predicted: mean,
    confidence_interval: { lower: mean - 1.28 * std, upper: mean + 1.28 * std, level: 0.8 },
    feature_importance: await computeSHAP(features, model),
    model_version: 'local-v1.2',
    generated_at: new Date().toISOString(),
  };
}

// Uzak Model (MCP / Edge Function)
async function predictRemote(request: PredictionRequest, features: number[]): Promise<PredictionResult> {
  const mcp = new MCPClient('beemaster-analytics');
  return mcp.callTool('predict_advanced', {
    model: request.model,
    horizon: request.horizon,
    features,
    context: {
      hive_id: request.hiveId,
      apiary_id: request.apiaryId,
    },
  });
}
```

---

## 8. Offline ve Performans

| Strateji | Detay |
|----------|-------|
| **Web Workers** | Veri işleme, agregasyon, CSV parse → Main thread bloke etmez |
| **Canvas/WebGL** | 10k+ nokta grafiklerde SVG yerine Canvas (Chart.js/Recharts Canvas mod) |
| **Veri Örnekleme** | >5000 nokta → LTTB (Largest-Triangle-Three-Buckets) downsampling |
| **Lazy Load** | Sekme içeriği göründüğünde veri çekme + render |
| **Cache** | Grafik verisi 5 dk cache, offline IndexedDB'de saklama |
| **Progressive Render** | Önce özet (100 nokta), sonra detay (tüm veri) |

---

## 9. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Veri Tablosu Fallback** | Her grafik için `role="img" aria-label="..."` + `<table>` alternatifi (sr-only) |
| **Klavye Navigasyon** | Tab ile veri noktaları arası, Enter ile detay tooltip |
| **Renk Körlüğü** | Desen (çizgi tipi: solid/dashed/dotted) + Şekil (nokta/kare/üçgen) + Renk |
| **Yüksek Kontrast** | `prefers-contrast: more` → Daha kalın çizgiler, belirgin grid |
| **Hareket Azaltma** | `prefers-reduced-motion` → Animasyonlar kapalı, tooltip anında |

---

## 10. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| 100 kovan, 3 yıl veri → Verim trendi | < 2s render, zoom/pan 60fps |
| Varroa grafiği eşik çizgisi | Kırmızı çizgi (3), tooltip "Tedavi eşiği" |
| Bölge benchmark: Kullanıcı vs Ortalama | KPI kartında "Bölge ort: 28.5 kg" kıyaslama |
| Özel metrik: Hasat/Maliyet | Formül parser çalışır, yeni sütun eklenir |
| Offline analitik sekmesi | Önbellekli grafikler görüntülenir, "Veri güncel olmayabilir" banner |
| Tahmin modeli (1 ay) | Güven aralığı %80, özellik önemi listesi |

---

## 11. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Doğal Dil Sorgu** | "Son 6 ayda Eğil'de ortalama verim neydi?" → SQL + Grafik |
| **Anomali Tespiti (ML)** | Otomatik: "Kovan-12 verimi %40 düştü, normalde %5-10 varyasyon" |
| **Kovan Benzerlik Ağı** | "Benim kovanlarıma en benzer 10 kovan (verim, iklim, ırk) nasıl performans gösterdi?" |
| **Pazar Tahmini** | Bölgesel bal fiyatı + üretim miktarı → Optimal satış zamanı |
| **İklim Uyum Skoru** | "2025 tahminine göre bu üste 2030'da %15 verim düşüşü bekleniyor" |
| **Paylaşımlı Analitik** | Mentor/öğrenci: "Öğrencimin verimi bölge altındaydı, bu grafikte göster" |