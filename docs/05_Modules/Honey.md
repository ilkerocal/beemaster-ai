# BeeMaster AI — Honey (Bal) Modülü v1.0

> **Amaç:** Bal hasadı, kalite analizi, verim takibi, fiyatlandırma, paketleme, stok yönetimi ve pazar entegrasyonu. Bal türü, nem, flora kaynağı, bölgesel pazar fiyatları.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/harvest/new` (Giriş), `/harvest` (Liste), `/hives/:id/harvests` (Kovan bazlı), `/apiaries/:id/harvests` (Üs bazlı) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (honey_harvests), Supabase Sync, Envanter entegrasyonu |
| **Offline** | %100 |
| **Performans** | Giriş formu < 500ms, Verim grafikleri < 1s |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| HN-01 | Hasat girişi: Çerçeve sayısı, toplam kg, nem %, bal tipi, flora kaynağı, fiyat | P0 |
| HN-02 | Kovan/Üs bazlı verim hesaplaması: kg/kovan, kg/çerçeve, yıllık trend | P0 |
| HN-03 | Bal nemi uyarısı: >18% fermente riski, <14% kalite düşüklüğü | P0 |
| HN-04 | Flora kaynağı otomatik (Takvim + Konum) + manuel düzeltme | P1 |
| HN-05 | Bölgesel pazar fiyatı entegrasyonu (Kooperatif/İhracat fiyatları) | P1 |
| HN-06 | Paketleme/stok: Kavanoz, fiyat, satış, kalıntı takibi | P1 |
| HN-07 | Hasat raporu: Sezon özeti, verim karşılaştırması, kar/zarar | P1 |
| HN-08 | Çoklu kovan toplu hasat girişi (Apiary seviyesinde) | P2 |

---

## 3. UI Yapısı

### 3.1 Hasat Girişi (Harvest Entry Wizard)

```
[Dashboard / Kovan / Üs / Envanter] → [+ Hasat] → BOTTOM SHEET / MODAL

┌─────────────────────────────────────┐
│ YENİ HASAT GİRİŞİ                   │
├─────────────────────────────────────┤
│                                     │
│ Arı Üssü: [Eğil Yaylası ▼]          │
│ Kovan: [Kovan-12 ▼] [Tümü (Toplu)]  │
│                                     │
│ Tarih: [15 Temmuz 2024 ▼] 📅        │
│                                     │
│ Hasat Edilen Çerçeve: [8] 🔢        │
│ Toplam Ağırlık (kg): [24.5] ⚖️     │
│                                     │
│ Bal Nemi (%): [17.2] 💧             │
│    ├─ Ölçer: Refraktometre          │
│    └─ Uyarı: >18% = Fermente Riski! │
│                                     │
│ Bal Tipi:                           │
│ [Çiçek] [Çam] [Kestane] [Kekik]     │
│ [Karışık] [Tek Çiçek: _____] ▼      │
│                                     │
│ Dominant Flora: [Otomatik: Geven %60, Kekik %40] ✏️
│                                     │
│ Fiyat (TL/kg): [185] 💰             │
│    └─ Pazar Fiyatı: 180-195 TL/kg   │
│ Satılan Miktar: [0] kg              │
│                                     │
│ Not: [Bu sezon ilk hasat, kalite iyi]│
│                                     │
│ [İptal]                    [Kaydet] │
└─────────────────────────────────────┘
```

### 3.2 Hasat Listesi (/harvest)

```
HarvestListPage
├── Header: "Bal Hasatları" + Zaman Aralığı [Bu Sezon ▼] + [+ Hasat] + [Export]
├── Filters: Üs ▼ | Kovan ▼ | Bal Tipi ▼ | Nem Durumu [Normal/Uyarı] | Min-Max kg
├── Summary Cards (Top)
│   ├─ Toplam Hasat: 1,245 kg
│   ├─ Ort. Verim: 28.5 kg/kovan
│   ├─ Toplam Gelir: 230,000 TL
│   └─ Ort. Nem: 17.2%
├── Table / Cards (Virtualized)
│   │ Tarih │ Üs │ Kovan │ Çerçeve │ Kg │ Nem │ Tip │ Flora │ Fiyat │ Gelir │ Aksiyon │
│   │ 15 Tem│Eğil│ K-12 │ 8       │24.5│17.2%│Çiçek│Geven  │185    │4,532 │ [✏️] [🗑️] │
└── Pagination
```

### 3.3 Hasat Detayı (/harvest/:id)

```
HarvestDetailPage
├── StickyHeader: Tarih, Kovan, Üs, Status, 3-nokta Menü
├── SummaryChips
│   ├── Çerçeve: 8
│   ├── Toplam: 24.5 kg
│   ├── Çerçeve Başı: 3.06 kg
│   ├── Nem: 17.2% [Normal ✓]
│   ├── Tip: Çiçek Balı
│   └── Flora: Geven %60, Kekik %40
├── Tabs: [Genel] [Kalite] [Pazar] [Geçmişe Karşılaştır]
│
├── GENEL
│   ├── Temel Bilgiler
│   ├── Paketleme: [Kavanoz 450gr x 50] [Bulk 10kg x 2]
│   ├── Satış: 120 kg / 24.5 kg (Kalan: 4.5 kg)
│   └── Notlar
│
├── KALİTE
│   ├── Nem Analizi: Grafik (Zaman içinde)
│   ├── HMF Değeri: [Giriş] (mg/kg) — Kalite göstergesi
│   ├── Diyastaz: [Giriş] (Schade) — Tazelik
│   ├── Prolin: [Giriş] (mg/kg) — Doğallık
│   └── Lab Sonuçları (PDF yükleme)
│
├── PAZAR
│   ├── Bölge Fiyat Trendi (Grafik)
│   ├── Satış Kanalları: [Kooperatif] [Perakende] [Online] [İhracat]
│   ├── Fiyat Karşılaştırması: Senin vs Bölge vs Yıl Önceki
│   └── [Fiyat Bildirimi Oluştur]
│
└── KARŞILAŞTIR
    ├── Bu Kovan: Yıllık Verim Trendi
    ├── Üs Ortalaması vs Bu Kovan
    ├── Bölge Ortalaması vs Bu Kovan
    └── İrk Bazlı Karşılaştırma
```

---

## 4. Bileşen Detayları

### 4.1 HarvestEntryForm (Bottom Sheet)

```tsx
// components/honey/HarvestEntryForm.tsx
export function HarvestEntryForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  apiaries,
  hives,
  regionFlora 
}: HarvestEntryFormProps) {
  const [form, setForm] = useState({
    apiary_id: initialData?.apiary_id || '',
    hive_id: initialData?.hive_id || 'all',
    harvested_at: initialData?.harvested_at || new Date().toISOString().split('T')[0],
    frames_harvested: initialData?.frames_harvested || 0,
    weight_kg: initialData?.weight_kg || '',
    moisture_pct: initialData?.moisture_pct || '',
    honey_type: initialData?.honey_type || 'flower',
    flora_source: initialData?.flora_source || [],
    price_per_kg_try: initialData?.price_per_kg_try || '',
    sold_amount_kg: initialData?.sold_amount_kg || 0,
    notes: initialData?.notes || '',
  });

  // Otomatik hesaplamalar
  const perFrameYield = form.frames_harvested && form.weight_kg 
    ? (Number(form.weight_kg) / form.frames_harvested).toFixed(2) 
    : null;
  
  const moistureWarning = form.moisture_pct && Number(form.moisture_pct) > 18;
  const moistureLowWarning = form.moisture_pct && Number(form.moisture_pct) < 14;
  
  // Bölge fiyat önerisi
  const suggestedPrice = useRegionPrice(form.honey_type, form.apiary_id);

  return (
    <BottomSheet isOpen onClose={onCancel} title="Yeni Hasat Girişi" size="full">
      <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className="space-y-4 max-w-xl mx-auto">
        
        {/* Üs / Kovan */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Arı Üssü *">
            <Select value={form.apiary_id} onChange={v => setForm({...form, apiary_id: v})} required>
              {apiaries.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
            </Select>
          </FormField>
          <FormField label="Kovan">
            <Select value={form.hive_id} onChange={v => setForm({...form, hive_id: v})}>
              <SelectItem value="all">Tümü (Toplu)</SelectItem>
              {hives.filter(h => h.apiary_id === form.apiary_id).map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Tarih *">
          <Input type="date" value={form.harvested_at} onChange={v => setForm({...form, harvested_at: v})} required max={new Date().toISOString().split('T')[0]} />
        </FormField>

        {/* Miktar Grubu */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label="Çerçeve *">
            <Input type="number" min={1} max={50} value={form.frames_harvested} onChange={v => setForm({...form, frames_harvested: parseInt(v) || 0})} required />
          </FormField>
          <FormField label="Toplam kg *">
            <Input type="number" step="0.1" min={0.1} max={500} value={form.weight_kg} onChange={v => setForm({...form, weight_kg: v})} required />
          </FormField>
          <FormField label="Nem % *">
            <Input type="number" step="0.1" min={10} max={25} value={form.moisture_pct} onChange={v => setForm({...form, moisture_pct: v})} required />
          </FormField>
        </div>

        {/* Hesaplanan Verim */}
        {perFrameYield && (
          <div className="p-3 bg-honey-400/10 border border-honey-400/20 rounded-xl flex items-center justify-between">
            <span className="text-sm text-neutral-400">Çerçeve Başı Verim</span>
            <span className="text-xl font-bold text-honey-400">{perFrameYield} kg</span>
          </div>
        )}

        {/* Nem Uyarısı */}
        {moistureWarning && (
          <Alert variant="warning" className="mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Nem %{form.moisture_pct} > 18% — Fermente riski! Hemen kurutun.</span>
          </Alert>
        )}
        {moistureLowWarning && (
          <Alert variant="info" className="mb-2">
            <Info className="w-4 h-4" />
            <span>Nem %{form.moisture_pct} < 14% — Çok kuru, kristalleşme hızı artar.</span>
          </Alert>
        )}

        {/* Bal Tipi */}
        <FormField label="Bal Tipi *">
          <Select value={form.honey_type} onChange={v => setForm({...form, honey_type: v})} required>
            <SelectItem value="flower">🌸 Çiçek Balı</SelectItem>
            <SelectItem value="pine">🌲 Çam Balı</SelectItem>
            <SelectItem value="chestnut">🌰 Kestane Balı</SelectItem>
            <SelectItem value="thyme">🌿 Kekik Balı</SelectItem>
            <SelectItem value="mixed">🌼 Karışık</SelectItem>
            <SelectItem value="monofloral">🎯 Tek Çiçek (Monofloral)</SelectItem>
          </Select>
        </FormField>

        {/* Flora Kaynağı */}
        <FormField label="Dominant Flora" hint="Takvimden otomatik dolduruldu, düzenleyebilirsiniz">
          <FloraMultiSelect 
            value={form.flora_source} 
            onChange={v => setForm({...form, flora_source: v})}
            suggestions={regionFlora}
          />
        </FormField>

        {/* Fiyat */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Fiyat (TL/kg)" hint={`Pazar: ${suggestedPrice?.min}-${suggestedPrice?.max} TL/kg`}>
            <Input type="number" step="0.01" min={0} value={form.price_per_kg_try} onChange={v => setForm({...form, price_per_kg_try: v})} />
          </FormField>
          <FormField label="Satılan (kg)">
            <Input type="number" step="0.1" min={0} max={Number(form.weight_kg) || 0} value={form.sold_amount_kg} onChange={v => setForm({...form, sold_amount_kg: parseFloat(v) || 0})} />
          </FormField>
        </div>

        {/* Gelir Hesaplaması */}
        {(form.price_per_kg_try && form.sold_amount_kg) && (
          <div className="p-3 bg-success-bg border-success-border rounded-xl flex items-center justify-between">
            <span className="text-sm text-neutral-400">Tahmini Gelir</span>
            <span className="text-xl font-bold text-success">{(Number(form.price_per_kg_try) * Number(form.sold_amount_kg)).toLocaleString('tr-TR')} TL</span>
          </div>
        )}

        <FormField label="Not">
          <Textarea value={form.notes} onChange={v => setForm({...form, notes: v})} rows={3} />
        </FormField>

        <div className="flex gap-3 pt-4 border-t border-neutral-800 sticky bottom-0 bg-neutral-950/95 backdrop-blur pb-4">
          <Button variant="ghost" fullWidth onClick={onCancel}>İptal</Button>
          <Button variant="primary" fullWidth type="submit" rightIcon={<Check className="w-4 h-4" />}>
            Kaydet
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
```

### 4.2 HarvestCard (Liste Öğesi)

```tsx
// components/honey/HarvestCard.tsx
export function HarvestCard({ harvest, hive, apiary, onClick, onEdit, onDelete }: HarvestCardProps) {
  const perFrame = harvest.frames_harvested ? (harvest.weight_kg / harvest.frames_harvested).toFixed(2) : '—';
  const moistureStatus = harvest.moisture_pct > 18 ? 'warning' : harvest.moisture_pct < 14 ? 'info' : 'success';
  const revenue = harvest.price_per_kg_try && harvest.sold_amount_kg 
    ? (harvest.price_per_kg_try * harvest.sold_amount_kg).toLocaleString('tr-TR') + ' TL'
    : '—';

  return (
    <Card variant="bordered" padding="md" className="flex flex-col gap-3" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-neutral-50">{apiary?.name} / {hive?.name}</h3>
            <Badge variant={HONEY_TYPE_BADGE[harvest.honey_type]}>{HONEY_TYPE_LABELS[harvest.honey_type]}</Badge>
          </div>
          <p className="text-sm text-neutral-400">{format(new Date(harvest.harvested_at), 'dd MMM yyyy', { locale: tr })}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm"><MoreHorizontal className="w-5 h-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Düzenle</DropdownMenuItem>
            <DropdownMenuItem className="text-error" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" /> Sil</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-2 bg-neutral-800/50 rounded-xl">
          <p className="text-2xl font-bold text-neutral-50">{harvest.weight_kg} kg</p>
          <p className="text-xs text-neutral-400">Toplam</p>
        </div>
        <div className="p-2 bg-neutral-800/50 rounded-xl">
          <p className="text-2xl font-bold text-honey-400">{perFrame}</p>
          <p className="text-xs text-neutral-400">kg/Çerçeve</p>
        </div>
        <div className="p-2 bg-neutral-800/50 rounded-xl">
          <p className="text-2xl font-bold text-neutral-50">{harvest.frames_harvested}</p>
          <p className="text-xs text-neutral-400">Çerçeve</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-neutral-400 border-t border-neutral-800 pt-3">
        <span className="flex items-center gap-1">
          <Droplet className="w-4 h-4" />
          <span className={cn('font-mono', moistureStatus === 'warning' ? 'text-warning' : moistureStatus === 'info' ? 'text-info' : 'text-success')}>
            %{harvest.moisture_pct.toFixed(1)}
          </span>
        </span>
        <span className="flex items-center gap-1">
          <Tag className="w-4 h-4" />
          {harvest.flora_source.join(', ') || 'Bilinmiyor'}
        </span>
        <span className="flex items-center gap-1 ml-auto text-honey-400 font-medium">
          <TurkishLira className="w-4 h-4" />
          {revenue}
        </span>
      </div>
    </Card>
  );
}

const HONEY_TYPE_LABELS = {
  flower: 'Çiçek',
  pine: 'Çam',
  chestnut: 'Kestane',
  thyme: 'Kekik',
  mixed: 'Karışık',
  monofloral: 'Monofloral',
};

const HONEY_TYPE_BADGE = {
  flower: 'honey',
  pine: 'success',
  chestnut: 'warning',
  thyme: 'info',
  mixed: 'default',
  monofloral: 'honey',
};
```

### 4.3 YieldAnalyticsChart (Verim Analitiği)

```tsx
// components/honey/YieldAnalyticsChart.tsx
interface YieldAnalyticsChartProps {
  harvests: HoneyHarvest[];
  hives: Hive[];
  apiaries: Apiary[];
  timeRange: 'month' | 'season' | 'year';
}

export function YieldAnalyticsChart({ harvests, hives, apiaries, timeRange }: YieldAnalyticsChartProps) {
  const [view, setView] = useState<'apiary' | 'hive' | 'strain' | 'type'>('apiary');

  // Veri hazırlama
  const chartData = useMemo(() => {
    switch (view) {
      case 'apiary':
        return groupByApiary(harvests, apiaries);
      case 'hive':
        return groupByHive(harvests, hives);
      case 'strain':
        return groupByStrain(harvests, hives);
      case 'type':
        return groupByHoneyType(harvests);
    }
  }, [harvests, hives, apiaries, view]);

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-50">Verim Analizi ({timeRangeLabel[timeRange]})</h3>
        <SegmentedControl value={view} onChange={setView} options={[
          { value: 'apiary', label: 'Üslere Göre' },
          { value: 'hive', label: 'Kovanlara Göre' },
          { value: 'strain', label: 'Irklara Göre' },
          { value: 'type', label: 'Bal Tiplerine Göre' },
        ]} />
      </div>

      {/* Bar Chart - Recharts */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis type="number" tick={{ fill: '#737373', fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#737373', fontSize: 11 }} width={100} />
          <Tooltip 
            formatter={(value: number) => [value.toFixed(1) + ' kg', 'Toplam Hasat']}
            contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="total_kg" name="Toplam Hasat (kg)" fill="#fbbf24" radius={[0, 4, 4, 0]} />
          <Bar dataKey="avg_per_hive" name="Kovan Başı Ort. (kg)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <KPICard label="Toplam Hasat" value={`${totalKg.toFixed(1)} kg`} icon={Wheat} color="honey" />
        <KPICard label="Ort. Kovan Verimi" value={`${avgPerHive.toFixed(1)} kg`} icon={TrendingUp} color="success" />
        <KPICard label="En Verimli" value={bestApiary?.name || '—'} icon={Award} color="info" />
        <KPICard label="Ort. Nem" value={`${avgMoisture.toFixed(1)}%`} icon={Droplet} color={avgMoisture > 18 ? 'warning' : 'success'} />
      </div>
    </Card>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/honey.ts
interface HoneyHarvest {
  id: string; // UUIDv7
  hiveId: string;
  apiaryId: string;
  userId: string;
  
  // Temel
  harvested_at: string; // ISO date
  frames_harvested: number;
  weight_kg: number; // Net bal ağırlığı
  moisture_pct: number; // Refraktometre ile ölçülür
  
  // Tip ve Flora
  honey_type: 'flower' | 'pine' | 'chestnut' | 'thyme' | 'mixed' | 'monofloral';
  flora_source: string[]; // Örn: ['Geven', 'Kekik', 'Ada Çayı']
  flora_confidence?: number; // AI tahmin güveni
  
  // Kalite (Opsiyonel - Lab)
  hmg_mg_kg?: number; // HMG (Hidroksimetilfurfural) - Isıtma/eskime göstergesi
  diastase_schade?: number; // Diyastaz aktivitesi - Tazelik
  proline_mg_kg?: number; // Prolin - Doğallık/kalite
  conductivity?: number; // İletkenlik - Çam balı ayrımı için
  
  // Pazar
  price_per_kg_try?: number;
  sold_amount_kg: number; // Satılan miktar
  sales_channels?: ('cooperative' | 'retail' | 'online' | 'export')[];
  
  // Paketleme
  packaging?: PackagingRecord[];
  
  // Meta
  notes?: string;
  weather_snapshot?: WeatherSnapshot;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface PackagingRecord {
  id: string;
  harvest_id: string;
  container_type: 'jar_250' | 'jar_450' | 'jar_900' | 'bucket_5kg' | 'bucket_10kg' | 'bulk' | 'custom';
  container_count: number;
  label_design_id?: string;
  cost_per_unit_try: number;
  created_at: string;
}

// Kalite Standartları (TSE / EU)
const HONEY_QUALITY_STANDARDS = {
  moisture: { max: 20, optimal_max: 18, warning_min: 14 }, // %
  hmg: { max: 40, fresh_max: 15 }, // mg/kg
  diastase: { min: 8 }, // Schade
  proline: { min: 180 }, // mg/kg
  conductivity: { honeydew_min: 0.8 }, // mS/cm (Çam balı için)
};
```

---

## 6. Otomatik Hesaplamalar ve Kurallar

| Hesaplama | Formül | Kullanım |
|-----------|--------|----------|
| **Çerçeve Başı Verim** | `weight_kg / frames_harvested` | Hasat kalitesi, kovan karşılaştırması |
| **Kovan Yıllık Verimi** | `SUM(weight_kg) WHERE hive_id AND season` | Performans takibi |
| **Üs Yıllık Verimi** | `SUM(weight_kg) WHERE apiary_id AND season` | Üs karşılaştırması |
| **Bölge Ortalaması** | `AVG(yield) WHERE region AND season` | Benchmark |
| **Nem Durumu** | `>18%: Uyarı`, `14-18%: Normal`, `<14%: Bilgi` | Kalite kontrolü |
| **Gelir Tahmini** | `weight_kg * price_per_kg_try` | Mali planlama |
| **Kar/Zarar** | `Toplam Gelir - (Besleme + Tedavi + Ekipman + İşçilik)` | İşletme analitiği |

### Nem Bazlı Kalite Etiketleme

```typescript
function getMoistureStatus(moisture: number): { status: 'optimal' | 'warning' | 'critical'; label: string; color: string } {
  if (moisture > 20) return { status: 'critical', label: 'Fermente Riski — Satış Yasak', color: 'error' };
  if (moisture > 18) return { status: 'warning', label: 'Yüksek Nem — Kurutma Gerekli', color: 'warning' };
  if (moisture < 14) return { status: 'warning', label: 'Düşük Nem — Hızlı Kristalleşme', color: 'info' };
  return { status: 'optimal', label: 'İdeal Nem Aralığı', color: 'success' };
}
```

---

## 7. Bölgesel Pazar Fiyat Entegrasyonu

```typescript
// lib/honey/marketPrice.ts
interface MarketPrice {
  region: string;
  honey_type: string;
  min_price_try: number;
  max_price_try: number;
  avg_price_try: number;
  source: 'cooperative' | 'export' | 'retail_survey' | 'user_reported';
  date: string;
  sample_size: number;
}

export async function getRegionMarketPrice(regionId: string, honeyType: string): Promise<MarketPrice | null> {
  // 1. Cache kontrolü (24 saat)
  const cached = await getCache(`market-price-${regionId}-${honeyType}`);
  if (cached && !isStale(cached.timestamp, 1440)) return cached.data;

  // 2. API'den çek (Supabase Edge Function → External APIs)
  try {
    const res = await fetch(`/api/v1/market/prices?region=${regionId}&type=${honeyType}`);
    const data = await res.json();
    await setCache(`market-price-${regionId}-${honeyType}`, data);
    return data;
  } catch {
    // 3. Fallback: Kullanıcı bildirimli fiyatlar (son 30 gün)
    return getUserReportedPrices(regionId, honeyType);
  }
}

export function getPriceRecommendation(marketPrice: MarketPrice, quality: 'premium' | 'standard' | 'bulk'): { min: number; max: number; suggested: number } {
  const base = marketPrice.avg_price_try;
  const multipliers = { premium: 1.15, standard: 1.0, bulk: 0.85 };
  const mult = multipliers[quality];
  return {
    min: Math.round(base * mult * 0.95),
    max: Math.round(base * mult * 1.05),
    suggested: Math.round(base * mult),
  };
}
```

---

## 8. AI Entegrasyonu (HoneyAgent)

```typescript
// agents/honeyAgent.ts
interface HoneyForecastInput {
  apiary: Apiary;
  hives: Hive[];
  harvests: HoneyHarvest[]; // Geçmiş 3 yıl
  flora_calendar: FloraEvent[];
  weather_forecast: WeatherForecast[];
  season: Season;
}

interface HoneyForecastOutput {
  estimated_yield_kg: { min: number; max: number; expected: number };
  harvest_window: { start: string; peak: string; end: string };
  recommended_harvest_dates: string[];
  flora_contribution: { flora: string; percentage: number }[];
  risk_factors: string[];
  confidence: number;
}

export async function forecastHoneyYield(input: HoneyForecastInput): Promise<HoneyForecastOutput> {
  const { apiary, hives, harvests, flora_calendar, weather_forecast, season } = input;
  
  // 1. Geçmiş verim trendi (son 3 yıl)
  const historicalYield = calculateHistoricalTrend(harvests);
  
  // 2. Flora katkısı (Takvim + Hava)
  const floraContribution = calculateFloraContribution(flora_calendar, weather_forecast);
  
  // 3. Kovan gücü faktörü
  const colonyStrengthFactor = calculateColonyStrengthFactor(hives);
  
  // 4. Hava risk faktörleri
  const weatherRisks = analyzeWeatherRisks(weather_forecast);
  
  // 5. Tahmin modeli (Basit ağırlıklı ortalama - v1.0)
  const baseYield = historicalYield.avg_per_hive * hives.length;
  const adjustedYield = baseYield * colonyStrengthFactor * floraContribution.total_factor;
  
  return {
    estimated_yield_kg: {
      min: Math.round(adjustedYield * 0.7),
      max: Math.round(adjustedYield * 1.3),
      expected: Math.round(adjustedYield),
    },
    harvest_window: determineHarvestWindow(flora_calendar, season),
    recommended_harvest_dates: getOptimalHarvestDates(weather_forecast, flora_calendar),
    flora_contribution: floraContribution.details,
    risk_factors: weatherRisks,
    confidence: calculateConfidence(harvests.length, floraContribution.confidence),
  };
}
```

---

## 9. Offline ve Senkronizasyon

| İşlem | Offline | Senkron |
|-------|---------|---------|
| Hasat girişi | ✅ IndexedDB | `create_harvest` |
| Paketleme kaydı | ✅ | `create_packaging` |
| Satış güncelleme | ✅ | `update_harvest` (sold_amount) |
| Lab sonucu girişi | ✅ | `update_harvest` (quality fields) |
| Fotoğraf (Etiket/Kalite) | ✅ Blob | Media upload queue |

---

## 10. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Nem Girişi** | `aria-describedby` ile uyarı mesajı bağlı, step=0.1, min/max |
| **Fiyat** | `aria-label="Kilogram başına fiyat, Türk Lirası"` |
| **Grafikler** | `role="img" aria-label="Eğil Yaylası 420kg, Karacadağ 380kg..."` + Data table fallback |
| **Renk Körlüğü** | Nem durumu: İkon + Metin + Renk (sadece renk değil) |
| **Ekran Okuyucu** | "Hasat kaydedildi: 24.5 kg, 8 çerçeve, nem %17.2, çiçek balı, tahmini gelir 4532 TL" |

---

## 11. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Nem %19 girildi | Warning badge "Fermente riski", toast uyarısı |
| Nem %13 girildi | Info badge "Düşük nem, kristalleşme" |
| Fiyat girilmedi, satış miktarı girildi | Gelir hesaplanmaz, "Fiyat girin" ipucu |
| Toplu hasat (Kovan: Tümü) | Her kovan için ayrı kayıt OLUŞMAZ, tek kayıt apiary_id ile |
| Flora "Geven, Kekik" seçildi | Flora_source array, takvimdeki yoğunlukla eşleşir |
| Offline hasat girişi → Online | Sync başarılı, server ID ile merge |

---

## 12. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Lab Entegrasyonu** | Akredite lab API'si → HMG, Diyastaz, Prolin otomatik çekme |
| **Blockchain İzlenebilirlik** | Bal kavanozında QR → Hasat tarihi, konum, kalite, beekeeper profili |
| **NFC Kavanoz Etiketi** | Kavanoza NFC → Tüketici tarar, "Bu bal Eğil'de 15 Temmuz'da toplanmıştır" |
| **İhracat Belgeleri** | Otomatik: Analiz raporu, menşe belgesi, fitosaniter belge şablonları |
| **Monofloral Doğrulama** | Polen analizi (Melissopalynology) entegrasyonu |
| **Dinamik Fiyat Motoru** | Pazar talebi + kalite + sezonsallık → Günlük fiyat önerisi |
| **Tüketici Geri Bildirimi** | QR tarama → Puan/yorumu arıcıya anonim iletme |