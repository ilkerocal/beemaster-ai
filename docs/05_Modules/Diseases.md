# BeeMaster AI — Diseases (Hastalıklar / Varroa) Modülü v1.0

> **Amaç:** Varroa, Nosema, AFB, EFB, Çalkbrood, Sakbrood, DWV gibi hastalık ve parazit takibi. Sayım yöntemleri, risk değerlendirmesi, tedavi protokolleri, ilaç dozajı, etkinlik takibi. AI destekli erken uyarı sistemi.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/diseases` (Dashboard), `/hives/:id/diseases` (Kovan bazlı), `/treatments` (Tedavi listesi) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (inspections, treatments), Supabase Sync, AI Agent |
| **Offline** | %100 |
| **Performans** | Risk skoru < 500ms, Tedavi protokolü < 300ms |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| DS-01 | Varroa sayımı girmek (Alkol/Pudra/Çöp/Görsel) ve anlık risk seviyesi almak | P0 |
| DS-02 | AI risk değerlendirmesi: Trend, eşik, hava, kovan gücü → Tedavi önerisi (İlaç, Dozaj, Yöntem, Süre) | P0 |
| DS-03 | Tedavi kaydı: İlaç, dozaj, uygulama yöntemi, başlangıç/bitiş, maliyet | P0 |
| DS-04 | Tedavi etkinlik takibi: Öncesi/sonrası sayım, % etkinlik, başarı/başarısız | P0 |
| DS-05 | Diğer hastalıklar (Nosema, AFB, EFB, Çalkbrood) işaretleme ve protokol erişimi | P1 |
| DS-06 | Bölgesel hastalık prevalansı uyarısı: "Bölgenizde AFB görüldü" | P1 |
| DS-07 | İlaç stok entegrasyonu: Tedavi planlarken stok kontrolü, sipariş hatırlatması | P1 |
| DS-08 | Tedavi takvimi: "Okzalik asidi 2. seansı 5 gün sonra" hatırlatıcı | P1 |

---

## 3. UI Yapısı

### 3.1 Hastalık Dashboard (/diseases)

```
DiseasesDashboardPage
├── Header: "Hastalık & Parazit" + [Filtre: Üs ▼] + [+ Varroa Sayımı] + [+ Tedavi]
├── Risk Özeti (4 Kart)
│   ├── Varroa Riski: [KRİTİK 🔴] 3 kovan eşik üstü
│   ├── Nosema Riski: [DÜŞÜK 🟢] 0 kovan
│   ├── Bakteriyel Risk: [ORTA 🟡] 1 kovan şüpheli
│   └── Viral Risk: [DÜŞÜK 🟢] 0 kovan
├── Varroa Trend Grafiği (Son 12 ay)
│   ├── X: Ay, Y: Ort. Varroa/100
│   ├── Eşik çizgisi (3 alkol, 10 çöp)
│   └── Tedavi noktaları (İkon)
├── Aktif Tedaviler Listesi
│   ├── Kovan-12: Okzalik Asidi Buhar (Gün 2/3) → [Detay] [Sayım Planla]
│   ├── Kovan-05: Formik Asit (Gün 1/1) → [Detay] [Bitir]
└── Kovan Bazlı Risk Tablosu (Sıralanabilir)
    │ Kovan │ Son Sayım │ Yöntem │ Trend │ Risk │ Son Tedavi │ Aksiyon │
    │ K-12  │ 15        │ Alkol  │ ↑↑    │ 🔴   │ 45 gün ön  │ Tedavi  │
```

### 3.2 Varroa Sayım Girişi (/diseases/varroa/new)

```
VarroaCountEntryModal
├── Kovan: [Kovan-12 ▼] (Context'ten gelirse pre-fill)
├── Yöntem: [Alkol Yıkama ▼] (Radio: Alkol / Pudra / Çöp / Görsel)
├── Sayım Sonucu:
│   ├─ Alkol/Pudra: [12] varroa / 100 arı
│   ├─ Çöp Tablası: [45] varroa / 24 saat
│   └─ Görsel: [Az ▼] [Orta] [Çok]
├── Tarih: [Bugün ▼]
├── Not: [_______________________]
│
├── [HESAPLA VE KAYDET] → AI Risk Analizi Ekranı
│
└── AI RİSK DEĞERLENDİRMESİ (Anlık)
    ┌─────────────────────────────────────┐
    │ RİSK SEVİYESİ: YÜKSEK 🔴          │
    │ Enfeksiyon: %12 (Eşik: %3)        │
    │ Trend: 2 → 5 → 12 (Son 3 muayene) │
    │ Kayıp Riski: %40 (Tedavisz)       │
    └─────────────────────────────────────┘
    
    ÖNERİLEN TEDAVİLER:
    1. Okzalik Asidi Buhar (Birincil)
       Dozaj: 2g/kovan, 3 seans, 5 gün arayla
       Maliyet: ~15 TL/kovan | Etkinlik: %95+
       
    2. Okzalik Asidi Damlatma (Alternatif)
       Dozaj: 35ml 3.5% çözelti/kovan
       Etkinlik: %85-90
       
    3. Formik Asit (Sıcaklık 10-25°C)
       Dozaj: 250ml/kovan, tek seans
       Etkinlik: %90
    
    [TEDAVİ BAŞLAT] [Daha Sonra]
```

### 3.3 Tedavi Kayıt Sihirbazı (/treatments/new)

```
TreatmentWizard
├── ADIM 1: Kovan ve Hastalık
│   Kovan: [Kovan-12 ▼]
│   Hedef: [Varroa ▼] [Nosema] [AFB] [EFB] [Çalkbrood] [Diğer]
│
├── ADIM 2: İlaç Seçimi
│   ┌─────────────────────────────────────┐
│   │ VARROA İÇİN ONAYLI İLAÇLAR (TR):    │
│   │ ┌───────────────────────────────┐   │
│   │ │ Okzalik Asidi Buhar    ✓      │   │
│   │ │ Okzalik Asidi Damlatma ✓      │   │
│   │ │ Formik Asit            ✓      │   │
│   │ │ Timol (Apiguard)       ✓      │   │
│   │ │ Amitraz (Apivar)       ✓      │   │
│   │ │ Flumetrin (Bayvarol)   ✓      │   │
│   │ └───────────────────────────────┘   │
│   │ [Diğer: _____________]              │
│   └─────────────────────────────────────┘
│
├── ADIM 3: Dozaj ve Uygulama
│   Ürün: [VarroMed ▼] [Apibioxal] [Kendi hazırladım]
│   Etkin Madde: [Okzalik Asidi %XX] (Otomatik)
│   Dozaj: [2] [g/kovan ▼] (g/ml/strip)
│   Uygulama: [Buhar Makinesi ▼] [Damlama] [Strip] [Spray]
│   Seans Sayısı: [3] (Buhar için)
│   Seans Aralığı: [5] gün
│
├── ADIM 4: Zamanlama
│   Başlangıç: [Bugün ▼]
│   Planlanan Bitiş: [Otomatik: 15 gün sonra] ▼
│   Kontrol Sayımı: [Tedavi sonrası 14 gün] 📅
│
├── ADIM 5: Maliyet ve Stok
│   Birim Maliyet: [15] TL/kovan
│   Toplam: [180] TL (12 kovan × 15)
│   Stok: ✓ Okzalik Asidi 500g (Yeterli)
│
└── [KAYDET] → Hatırlatıcılar oluşturulur
```

### 3.4 Tedavi Detayı ve Etkinlik (/treatments/:id)

```
TreatmentDetailPage
├── StickyHeader: İlaç, Kovan, Tarih, Status, 3-nokta
├── SummaryChips
│   ├── İlaç: Okzalik Asidi Buhar (VarroMed)
│   ├── Dozaj: 2g/kovan × 3 seans
│   ├── Süre: 15 Tem - 30 Tem (15 gün)
│   ├── Maliyet: 180 TL
│   └── Durum: [Devam Ediyor] [Tamamlandı] [Başarısız]
├── Tabs: [Protokol] [Seanslar] [Etkinlik] [Notlar]
│
├── PROTOKOL SEKMESİ
│   ├── Resmi Protokol (PDF link)
│   ├── Güvenlik: Koruyucu ekipman, havalandırma, sıcaklık
│   ├── Uygulama Adımları (Numaralı)
│   └── Yasaklı Dönemler: Bal akışı sırasında, yüksek sıcaklık
│
├── SEANSLAR SEKMESİ
│   ├── Seans 1: 15 Tem ✓ (Not: Akşam 19:00, 18°C)
│   ├── Seans 2: 20 Tem ⏰ (Planlandı, Hatırlatıcı aktif)
│   ├── Seans 3: 25 Tem ⏰
│   └── [Seans Tamamla] butonu (Her seans için)
│
├── ETKİNLİK SEKMESİ
│   ├── Öncesi Sayım: 12 varroa/100 (15 Tem)
│   ├── Ara Sayım: [Giriş] (Opsiyonel - 2. seans sonrası)
│   ├── Son Sayım: [Giriş] (Zorunlu - Tedavi sonrası 14 gün)
│   │
│   ├── Etkinlik Hesaplama: %91.6 ✓
│   ├── Sonuç: [Başarılı] [Kısmi] [Başarısız]
│   └── Not: [2. seans yeterli oldu, 3. iptal]
│
└── NOTLAR SEKMESİ
    └── Serbest metin, zaman damgalı
```

---

## 4. Bileşen Detayları

### 4.1 VarroaRiskBadge (Risk Göstergesi)

```tsx
// components/disease/VarroaRiskBadge.tsx
export function VarroaRiskBadge({ count, method, trend, hiveStrength }: VarroaRiskBadgeProps) {
  const risk = calculateVarroaRisk(count, method, hiveStrength);
  
  const riskConfig = {
    low: { label: 'Düşük', icon: CheckCircle, color: 'success', bg: 'bg-success-bg', border: 'border-success' },
    medium: { label: 'Orta', icon: AlertTriangle, color: 'warning', bg: 'bg-warning-bg', border: 'border-warning' },
    high: { label: 'Yüksek', icon: AlertCircle, color: 'error', bg: 'bg-error-bg', border: 'border-error' },
    critical: { label: 'KRİTİK', icon: AlertOctagon, color: 'error', bg: 'bg-error-bg', border: 'border-error animate-pulse' },
  }[risk.level];

  const trendIcon = trend === 'up' ? <TrendingUp className="w-3 h-3" /> : 
                    trend === 'down' ? <TrendingDown className="w-3 h-3" /> : 
                    <Minus className="w-3 h-3" />;
  const trendColor = trend === 'up' ? 'text-error' : trend === 'down' ? 'text-success' : 'text-neutral-400';

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-2 rounded-xl border', riskConfig.bg, riskConfig.border)}>
      <riskConfig.icon className={cn('w-5 h-5', `text-${riskConfig.color}`)} />
      <div>
        <p className="font-semibold text-neutral-50">Varroa Riski: <span className={cn(`text-${riskConfig.color}`)}>{riskConfig.label}</span></p>
        <p className="text-xs text-neutral-400 flex items-center gap-1">
          {count} / 100 ({METHOD_LABELS[method]}) 
          {trend !== 'stable' && <span className={trendColor}>{trendIcon}</span>}
        </p>
      </div>
      {risk.level === 'critical' && (
        <Tooltip content="Acil müdahale gerekli! Kayıp riski çok yüksek.">
          <AlertOctagon className="w-5 h-5 text-error animate-pulse ml-2" />
        </Tooltip>
      )}
    </div>
  );
}

function calculateVarroaRisk(count: number, method: VarroaMethod, strength?: ColonyStrength): { level: 'low'|'medium'|'high'|'critical' } {
  // Alkol/Pudra: 100 arıda sayı
  if (method === 'alcohol_wash' || method === 'sugar_shake') {
    if (count === 0) return { level: 'low' };
    if (count <= 1) return { level: 'low' };
    if (count <= 3) return { level: 'medium' };
    if (count <= 9) return { level: 'high' };
    return { level: 'critical' };
  }
  // Çöp Tablası: 24 saatte sayı
  if (method === 'sticky_board') {
    if (count === 0) return { level: 'low' };
    if (count <= 10) return { level: 'low' };
    if (count <= 50) return { level: 'medium' };
    if (count <= 100) return { level: 'high' };
    return { level: 'critical' };
  }
  // Görsel
  if (method === 'visual') {
    return { level: count === 0 ? 'low' : count === 1 ? 'medium' : 'high' };
  }
  return { level: 'low' };
}
```

### 4.2 TreatmentProtocolCard (Tedavi Protokolü)

```tsx
// components/disease/TreatmentProtocolCard.tsx
const TREATMENT_PROTOCOLS: Record<string, TreatmentProtocol> = {
  oxalic_vapor: {
    name: 'Okzalik Asidi Buhar',
    activeIngredient: 'Okzalik Asidi Dihidrat',
    products: ['VarroMed', 'Apibioxal', 'Oxybee', 'Kendi hazırlama'],
    dosage: '2g/kovan (3-5g asit/kovan)',
    method: 'Buharlaştırma cihazı (Varrox, Oxavar, vb.)',
    sessions: 3,
    interval_days: 5,
    temperature: { min: 0, max: 30, optimal: '10-20°C' },
    duration_minutes: '2-3 dk/kovan',
    efficacy: 95,
    pros: ['Yüksek etkinlik', 'Balda kalıntı yok', 'Uygulama kolay', 'Ucuz'],
    cons: ['Buhar makinesi gerekir', 'Operküllü yumurtalık etkilenmez', 'Soğuk havada az etkin'],
    contraindications: ['Bal akışı sırasında', 'Sıcaklık >30°C', 'Rüzgarlı hava'],
    safety: ['Koruyucu maske (FFP2/3)', 'Gözlük', 'Eldiven', 'Havalandırma'],
    references: ['COLOSS 2022', 'TÜBİTAK 2023', 'EU Varroa Control'],
  },
  oxalic_dribble: {
    name: 'Okzalik Asidi Damlatma',
    activeIngredient: 'Okzalik Asidi Dihidrat 3.5% çözelti',
    products: ['Apibioxal çözelti', 'Kendi hazırlama (35g/L)'],
    dosage: '35ml/kovan (5ml/çerçeve arası)',
    method: 'Şırınga/pozitif basınçlı damlatma, çerçeve aralarına',
    sessions: 1,
    interval_days: 0,
    temperature: { min: 5, max: 25 },
    efficacy: 85,
    pros: ['Ekipman gerekmez', 'Hızlı', 'Düşük maliyet'],
    cons: ['Daha az etkin', 'Yumurtalık hasarı riski', 'Sıcaklık hassas'],
    contraindications: ['Güçlü yumurtalık', 'Sıcaklık >25°C', 'Aç kovan'],
    safety: ['Eldiven', 'Gözlük', 'Cilt temasından kaçının'],
    references: ['COLOSS 2022', 'Ritter 2014'],
  },
  formic_acid: {
    name: 'Formik Asit',
    activeIngredient: 'Formik Asit %60-85',
    products: ['Mite Away Quick Strips (MAQS)', 'Formic Pro', 'NOD'],
    dosage: '250ml/kovan (MAQS: 2 strip/kovan)',
    method: 'Strip/Kapasiter kovan girişine/üstüne yerleştirme',
    sessions: 1,
    interval_days: 0,
    temperature: { min: 10, max: 25, optimal: '15-20°C' },
    duration_days: 7-10,
    efficacy: 90,
    pros: ['Kapalı yumurtalıkı da etkiler', 'Tek seans', 'Doğal asit'],
    cons: ['Sıcaklık dar aralığı', 'Kraliçe kaybı riski', 'Koku, koruyucu zorunlu'],
    contraindications: ['Sıcaklık <10°C veya >25°C', 'Zayıf kovan', 'Kraliçe hücreleri varsa'],
    safety: ['Maske (gazlı)', 'Gözlük', 'Uzun kollu', 'Çocuk/hayvan uzak'],
    references: ['COLOSS 2022', 'MAQS Label'],
  },
  amitraz: {
    name: 'Amitraz (Strip)',
    activeIngredient: 'Amitraz',
    products: ['Apivar', 'Apitraz'],
    dosage: '2 strip/kovan (5 çerçeve arası 1 strip)',
    method: 'Strip\'leri kovan arasına asma',
    sessions: 1,
    interval_days: 0,
    duration_weeks: 6-10,
    temperature: { min: 10, max: 30 },
    efficacy: 95,
    pros: ['Uzun süreli', 'Yüksek etkinlik', 'Uygulama basit'],
    cons: ['Rezistans riski', 'Balda kalıntı (mumda)', 'Kullanım süresi uzun'],
    contraindications: ['Bal akışı', 'Rezistans bölge', 'Sıcaklık >30°C'],
    safety: ['Eldiven', 'Maske', 'Yutmamak'],
    references: ['EFSA 2019', 'Apivar SPC'],
  },
};

export function TreatmentProtocolCard({ protocolId, onStartTreatment }: TreatmentProtocolCardProps) {
  const protocol = TREATMENT_PROTOCOLS[protocolId];
  if (!protocol) return null;

  return (
    <Card variant="bordered" padding="md" className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-neutral-50 flex items-center gap-2">
            <Pill className="w-5 h-5 text-honey-400" />
            {protocol.name}
          </h3>
          <p className="text-sm text-neutral-400 mt-1">Etkin Madde: {protocol.activeIngredient}</p>
        </div>
        <Badge variant="success">Etkinlik %{protocol.efficacy}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <ProtocolStat label="Dozaj" value={protocol.dosage} icon={Scale} />
        <ProtocolStat label="Yöntem" value={protocol.method} icon={Settings} />
        <ProtocolStat label="Seans" value={`${protocol.sessions} × ${protocol.interval_days ? `${protocol.interval_days}g arayla` : 'Tek'}`} icon={Repeat} />
        <ProtocolStat label="Sıcaklık" value={`${protocol.temperature.optimal || `${protocol.temperature.min}-${protocol.temperature.max}°C`}`} icon={Thermometer} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-neutral-400 mb-2 flex items-center gap-1 text-sm">
            <CheckCircle className="w-4 h-4 text-success" /> Avantajlar
          </h4>
          <ul className="space-y-1 text-sm text-neutral-400">
            {protocol.pros.map((p, i) => <li key={i} className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-success" /> {p}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="font-medium text-neutral-400 mb-2 flex items-center gap-1 text-sm">
            <AlertTriangle className="w-4 h-4 text-warning" /> Dezavantajlar
          </h4>
          <ul className="space-y-1 text-sm text-neutral-400">
            {protocol.cons.map((c, i) => <li key={i} className="flex items-center gap-1"><X className="w-3.5 h-3.5 text-warning" /> {c}</li>)}
          </ul>
        </div>
      </div>

      <div className="p-3 bg-error-bg border-error-border rounded-xl text-error text-sm">
        <h4 className="font-medium mb-1 flex items-center gap-1"><AlertTriangle className="w-4 h-4" /> Güvenlik ve Yasaklılar</h4>
        <ul className="space-y-1">
          {protocol.safety.map((s, i) => <li key={i} className="flex items-center gap-1"><Shield className="w-3.5 h-3.5" /> {s}</li>)}
          {protocol.contraindications.map((c, i) => <li key={i} className="flex items-center gap-1"><Ban className="w-3.5 h-3.5" /> {c}</li>)}
        </ul>
      </div>

      <Button variant="primary" fullWidth onClick={onStartTreatment} rightIcon={<ArrowRight className="w-4 h-4" />}>
        Bu Tedaviyi Başlat
      </Button>
    </Card>
  );
}
```

### 4.3 DiseaseSignSelector (Hastalık İşaretleyici)

```tsx
// components/disease/DiseaseSignSelector.tsx
const DISEASE_SIGNS = [
  { id: 'varroa', name: 'Varroa', icon: Bug, category: 'parasite', severity: 'high' },
  { id: 'nosema', name: 'Nosema', icon: Microscope, category: 'fungal', severity: 'medium' },
  { id: 'afb', name: 'ABF (Amerikan Yumurtalık Çürüklüğü)', icon: Skull, category: 'bacterial', severity: 'critical', notifiable: true },
  { id: 'efb', name: 'EYB (Avrupa Yumurtalık Çürüklüğü)', icon: Bone, category: 'bacterial', severity: 'high', notifiable: true },
  { id: 'chalkbrood', name: 'Çalkbrood (Kireçbrood)', icon: Ghost, category: 'fungal', severity: 'medium' },
  { id: 'sacbrood', name: 'Sakbrood (Kısa Brood)', icon: Virus, category: 'viral', severity: 'medium' },
  { id: 'dwv', name: 'DWV (Deformed Wing Virus)', icon: BugOff, category: 'viral', severity: 'high' },
  { id: 'small_hive_beetle', name: 'Küçük Kovan Böceği', icon: Beetle, category: 'parasite', severity: 'medium' },
  { id: 'wax_moth', name: 'Bal Böceği / Mum Tını', icon: Moth, category: 'parasite', severity: 'low' },
  { id: 'ants', name: 'Karıncalar', icon: Ant, category: 'predator', severity: 'low' },
];

export function DiseaseSignSelector({ value, onChange, compact }: DiseaseSignSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {DISEASE_SIGNS.map(disease => {
          const selected = value.includes(disease.id);
          const severityColors = {
            critical: 'border-error bg-error-bg text-error',
            high: 'border-warning bg-warning-bg text-warning',
            medium: 'border-info bg-info-bg text-info',
            low: 'border-neutral-600 bg-neutral-800/50 text-neutral-400',
          };
          
          return (
            <label key={disease.id} className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium cursor-pointer transition-all',
              selected ? severityColors[disease.severity] : 'border-neutral-700 hover:border-honey-400'
            )}>
              <input 
                type="checkbox" 
                checked={selected} 
                onChange={e => onChange(e.target.checked ? [...value, disease.id] : value.filter(v => v !== disease.id))}
                className="w-4 h-4 accent-honey-400" 
              />
              <disease.icon className="w-4 h-4" />
              <span>{compact ? disease.id.toUpperCase() : disease.name}</span>
              {disease.notifiable && <Badge variant="error" className="text-[9px] ml-1">Bildirimi Zorunlu</Badge>}
            </label>
          );
        })}
      </div>
      
      {value.length > 0 && (
        <div className="text-xs text-neutral-500">
          Seçili: {value.map(v => DISEASE_SIGNS.find(d => d.id === v)?.name).join(', ')}
        </div>
      )}
    </div>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/disease.ts
interface Treatment {
  id: string; // UUIDv7
  hiveId: string;
  apiaryId: string;
  userId: string;
  
  // Hedef
  target_disease: 'varroa' | 'nosema' | 'afb' | 'efb' | 'chalkbrood' | 'sacbrood' | 'dwv' | 'other';
  target_disease_other?: string;
  
  // İlaç
  treatment_type: 'varroa_oxalic_vapor' | 'varroa_oxalic_dribble' | 'varroa_formic' | 'varroa_amitraz' | 'varroa_flumetrin' | 'varroa_thymol' | 'nosema_fumagillin' | 'afb_shake' | 'other';
  product_name?: string; // "VarroMed", "Apivar", "MAQS"
  active_ingredient?: string; // "Okzalik Asidi", "Amitraz"
  dosage: string; // "2g/kovan", "35ml/kovan", "2 strip/kovan"
  application_method: 'vaporization' | 'dribble' | 'strip' | 'spray' | 'fogging' | 'shake' | 'other';
  
  // Zamanlama
  started_at: string; // ISO date
  ended_at?: string;
  planned_end_date?: string;
  sessions_planned: number;
  sessions_completed: number;
  session_interval_days: number;
  
  // Sayım (Etkinlik için)
  pre_treatment_count?: number; // Varroa sayımı öncesi
  mid_treatment_count?: number; // Ara sayım
  post_treatment_count?: number; // Sonrası (14 gün)
  efficacy_pct?: number; // Hesaplanan etkinlik
  
  // Maliyet
  cost_per_hive_try?: number;
  total_cost_try?: number;
  
  // Güvenlik/Notlar
  weather_conditions?: WeatherSnapshot; // Uygulama anı hava
  safety_notes?: string;
  notes?: string;
  
  // Status
  status: 'planned' | 'active' | 'completed' | 'failed' | 'cancelled';
  outcome?: 'successful' | 'partial' | 'failed';
  
  created_at: string;
  updated_at: string;
}

// Tedavi Seans Takibi
interface TreatmentSession {
  id: string;
  treatmentId: string;
  session_number: number;
  applied_at: string;
  applied_by?: string;
  dosage_used: string;
  weather: WeatherSnapshot;
  notes?: string;
  status: 'planned' | 'completed' | 'skipped' | 'delayed';
}

// Hastalık Tanı (Muayenede)
interface DiseaseDiagnosis {
  inspectionId: string;
  hiveId: string;
  disease: DiseaseSign;
  severity: 'suspected' | 'confirmed' | 'ruled_out';
  evidence: string; // "Yumurtalıkta delikli operküller, kokulu"
  lab_confirmed: boolean;
  lab_report_id?: string;
  reported_to_authority: boolean; // AFB/EFB için
  created_at: string;
}
```

---

## 6. AI Entegrasyonu (DiseaseAgent)

```typescript
// agents/diseaseAgent.ts
interface DiseaseAgentInput {
  hive: Hive;
  inspections: Inspection[];
  treatments: Treatment[];
  region: Region;
  season: Season;
  weather_forecast: WeatherForecast[];
  regional_prevalence: RegionalDiseaseStats;
}

interface DiseaseRecommendation {
  disease: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  should_treat: boolean;
  recommended_treatment: string; // protocolId
  dosage: string;
  timing: { start: string; urgency: 'immediate' | 'within_week' | 'planned' };
  reasoning: string;
  alternatives: { treatment: string; reason: string }[];
  cost_estimate: number;
  safety_warnings: string[];
  references: string[];
  confidence: number;
}

export async function assessDiseaseRisk(input: DiseaseAgentInput): Promise<DiseaseRecommendation[]> {
  const recommendations: DiseaseRecommendation[] = [];
  const { hive, inspections, treatments, region, season, weather_forecast, regional_prevalence } = input;
  const lastInsp = inspections[0];
  
  // 1. VARROA
  if (lastInsp?.varroa_count !== null) {
    const varroaRec = assessVarroa(lastInsp, inspections, treatments, season, weather_forecast);
    if (varroaRec) recommendations.push(varroaRec);
  }
  
  // 2. NOSEMA (Mevsimsel: Bahar/Sonbahar)
  if (season === 'spring' || season === 'autumn') {
    const nosemaRec = assessNosema(lastInsp, inspections, regional_prevalence);
    if (nosemaRec) recommendations.push(nosemaRec);
  }
  
  // 3. AFB/EFB (Bildirimi zorunlu)
  const bacterialRec = assessBacterial(lastInsp, inspections, regional_prevalence);
  if (bacterialRec) recommendations.push(bacterialRec);
  
  // 4. VİRAL (DWV - Varroa vektörlü)
  if (lastInsp?.varroa_count && lastInsp.varroa_count > 5) {
    const viralRec = assessViral(lastInsp, inspections);
    if (viralRec) recommendations.push(viralRec);
  }
  
  return recommendations.sort((a, b) => RISK_PRIORITY[b.risk_level] - RISK_PRIORITY[a.risk_level]);
}

function assessVarroa(lastInsp: Inspection, history: Inspection[], treatments: Treatment[], season: Season, weather: WeatherForecast[]): DiseaseRecommendation | null {
  const count = lastInsp.varroa_count;
  const method = lastInsp.varroa_method;
  if (count === null || !method) return null;
  
  const risk = calculateVarroaRisk(count, method);
  if (risk.level === 'low') return null;
  
  // Son tedavi ne zaman?
  const lastVarroaTreat = treatments.find(t => t.target_disease === 'varroa' && t.status === 'completed');
  const daysSinceTreat = lastVarroaTreat ? differenceInDays(new Date(), new Date(lastVarroaTreat.ended_at || lastVarroaTreat.started_at)) : 999;
  
  // Mevsimsellik
  const isTreatmentSeason = season === 'autumn' || season === 'winter' || (season === 'spring' && count > 1);
  
  // Sıcaklık uygunluğu
  const avgTemp = weather.slice(0, 7).reduce((s, w) => s + w.temp, 0) / 7;
  
  let recommendedTreatment = 'oxalic_vapor';
  let reasoning = '';
  
  if (risk.level === 'critical') {
    reasoning = `Acil: ${count} varroa/100 (eşik: 3). Kayıp riski %40+. Hemen buhar tedavisi başlat.`;
    recommendedTreatment = 'oxalic_vapor';
  } else if (risk.level === 'high') {
    reasoning = `Yüksek: ${count} varroa/100. Trend artış gösteriyor. 5-7 gün içinde tedavi planla.`;
    if (avgTemp > 15 && avgTemp < 25) recommendedTreatment = 'formic_acid';
    else recommendedTreatment = 'oxalic_vapor';
  } else { // medium
    reasoning = `İzleme gerekli: ${count} varroa/100. Sonraki muayenede tekrar sayım.`;
    recommendedTreatment = 'oxalic_dribble';
  }
  
  // Son tedavi yakınsa alternatif
  if (daysSinceTreat < 60) {
    recommendedTreatment = 'formic_acid'; // Farklı mekanizma
    reasoning += ` Son tedavi ${daysSinceTreat} gün önce. Farklı etkin madde (Formik Asit) önerilir.`;
  }
  
  return {
    disease: 'varroa',
    risk_level: risk.level,
    should_treat: risk.level !== 'low',
    recommended_treatment: recommendedTreatment,
    dosage: TREATMENT_PROTOCOLS[recommendedTreatment].dosage,
    timing: { 
      start: new Date().toISOString().split('T')[0], 
      urgency: risk.level === 'critical' ? 'immediate' : risk.level === 'high' ? 'within_week' : 'planned' 
    },
    reasoning,
    alternatives: getAlternatives(recommendedTreatment, avgTemp),
    cost_estimate: estimateCost(recommendedTreatment, 1),
    safety_warnings: TREATMENT_PROTOCOLS[recommendedTreatment].safety,
    references: TREATMENT_PROTOCOLS[recommendedTreatment].references,
    confidence: 0.9,
  };
}

function getAlternatives(primary: string, temp: number): { treatment: string; reason: string }[] {
  const all = Object.keys(TREATMENT_PROTOCOLS).filter(k => k !== primary);
  return all.map(t => ({
    treatment: t,
    reason: temp < 10 && t === 'formic_acid' ? 'Sıcaklık düşük, formik asit riskli' : 
            temp > 25 && t === 'formic_acid' ? 'Sıcaklık yüksek, formik asit riskli' : 'Alternatif protokol'
  }));
}
```

---

## 7. Bölgesel Hastalık Prevalansı (Regional Prevalence)

```typescript
// lib/disease/regionalPrevalence.ts
interface RegionalDiseaseStats {
  region_id: string;
  year: number;
  varroa: { avg_count: number; prevalence_pct: number; peak_month: number };
  nosema: { prevalence_pct: number; peak_month: number };
  afb: { cases: number; incidence_per_1000: number };
  efb: { cases: number; incidence_per_1000: number };
  chalkbrood: { prevalence_pct: number };
  viral: { dwv_prevalence_pct: number };
  data_source: 'ministry' | 'university' | 'cooperative' | 'user_reported';
  sample_size: number;
  updated_at: string;
}

// Kullanım: AI Agent'a context olarak verilir
export async function getRegionalPrevalence(regionId: string): Promise<RegionalDiseaseStats | null> {
  const cached = await getCache(`prevalence-${regionId}`);
  if (cached && !isStale(cached.timestamp, 10080)) return cached.data; // 1 hafta
  
  try {
    const res = await fetch(`/api/v1/regions/${regionId}/disease-prevalence`);
    const data = await res.json();
    await setCache(`prevalence-${regionId}`, data);
    return data;
  } catch {
    return getDefaultPrevalence(regionId);
  }
}
```

---

## 8. Offline ve Senkronizasyon

| İşlem | Offline | Senkron |
|-------|---------|---------|
| Varroa sayımı | ✅ | `create_inspection` (varroa fields) |
| Tedavi planı | ✅ | `create_treatment` (status: planned) |
| Seans tamamlama | ✅ | `update_treatment` (sessions_completed) |
| Etkinlik sayımı | ✅ | `update_treatment` (post_treatment_count, efficacy) |
| Hastalık bildirimi (AFB) | ✅ Local | `create_disease_diagnosis` + `report_to_authority` queue |

---

## 9. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Risk Seviyesi** | `aria-label="Varroa riski yüksek, 12 varroa sayımı, kritik seviye"` |
| **Tedavi Protokolü** | `role="dialog"` modal, `aria-labelledby` başlık, `aria-describedby` açıklama |
| **Güvenlik Uyarıları** | `role="alert"` kritik güvenlik kuralları için |
| **Renk Körlüğü** | Risk: İkon (✓/⚠/🔴) + Metin + Şekil + Renk |
| **Ekran Okuyucu** | "Tedavi başlat: Okzalik asidi buhar, 2 gram kovan, 3 seans, 5 gün arayla, maliyet 15 TL" |

---

## 10. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Alkol yıkama: 12 varroa | Critical risk, Okzalik asidi buhar önerisi, acil |
| Çöp tablası: 80 varroa/24sa | High risk, Formik asit (sıcaklık uygunysa) |
| Tedavi sonrası 14 gün: 1 varroa | Etkinlik %91.6, "Başarılı" |
| Aynı ilaç 2 ay arayla 2 kez | Uyarı: "Rezistans riski, farklı etkin madde kullanın" |
| AFB şüphesi (delikli operkül, koku) | Critical, "Bildirimi zorunlu", Şekil düğme protokolü |
| Nosema baharında, zayıf kovan | Fumagillin önerisi, protein destekli besleme |
| Offline tedavi seansı gir → Online | Senkron, hatırlatıcı güncellenir |

---

## 11. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Fotoğraftan Hastalık Tanıma** | CNN modeli: AFB/EFB/Çalkbrood/Sakbrood görsel tanı (Yolo/RT-DETR) |
| **PCR/Lab Entegrasyonu** | Nosema/DWV/AFB PCR sonuçları otomatik çekme, rapor eşleştirme |
| **Epidemiyoloji Haritası** | Bölgesel hastalık ısı haritası, gerçek zamanlı uyarı (AFB çıkması) |
| **Rezistans Takibi** | İlaç/dozaj/etkinlik verisi → Rezistans haritası, döngüsel ilaç önerisi |
| **Biyo-guvenlik Skoru** | Kovan/Üs bazlı: Ziyaretler, ekipman paylaşımı, yabancı kovan girişi riski |
| **Veteriner Hekim Bağlantısı** | Reçete/rapor paylaşımı, uzaktan danışmanlık, dijital reçete |