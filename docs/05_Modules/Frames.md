# BeeMaster AI — Frames (Çerçeveler / Petek Döngüsü) Modülü v1.0

> **Amaç:** Her çerçevenin doğum → bal → temizlik → yeniden kullanım yaşam döngüsünü takip etmek. Petek yaşı, döngü sayısı, perga tipi, son bal alımı, temizlik tarihi. **Bu modül BeeMaster'ın benzersiz farklaştırma özelliğidir (USP).**

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/hives/:hiveId/frames` (Kovan detayında sekme), `/frames` (Global liste - Pro) |
| **Erişim** | Tüm kullanıcılar (Kovan detayında), Pro+ (Global liste/analitik) |
| **Veri Kaynağı** | IndexedDB (frames), Supabase Sync |
| **Offline** | %100 |
| **Performans** | 12 çerçeve ızgarası < 100ms render |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| FR-01 | Kovan detayında çerçeve ızgarasını görmek: Her slot için tip, döngü, yaş, son bal alımı | P0 |
| FR-02 | Çerçeve tıklayıp tipini değiştirmek (Bal ↔ Yumurtalık ↔ Polen ↔ Perga ↔ Boş) | P0 |
| FR-03 | Bal alındığında döngü sayısını otomatik artırmak, "Son Bal Alımı" tarihini güncellemek | P0 |
| FR-04 | Petek yaşı 3 yıl / 5 döngüyü aştığında uyarı almak (Değişim zamanı) | P0 |
| FR-05 | "Yeni Sezon Sıfırla" ile tüm çerçeveleri perga/boş yapıp döngüleri sıfırlamak | P1 |
| FR-06 | Çerçeve bazlı maliyet/kar: Perga maliyeti, bal geliri, temizlik maliyeti | P2 |
| FR-07 | NFC/QR ile çerçeve fiziksel etiketleme ve tarama | P2 |

---

## 3. UI Yapısı

### 3.1 Kovan Detayında Çerçeve Sekmesi (FrameGrid)

```
FrameTab (in HiveDetail)
├── FrameGrid (Visual Grid)
│   ├── Slot 1-10/12 (Box tipine göre)
│   │   ├── FrameMiniCard
│   │   │   ├── Type Badge (Renkli: 🟡Bal 🟠Yumurtalık 🟣Polen ⚪Perga ⚫Boş)
│   │   │   ├── Cycle Badge: "Döngü: 3"
│   │   │   ├── Age Badge: "14 ay" (Kırmızı if >36 ay)
│   │   │   └── Foundation Icon: 🕯 Mum / 🔶 Plastik / 📄 Pergasız
│   │   └── Click → FrameDetailModal
│   ├── Empty Slot (Kutu tipine göre boşluk)
│   └── Legend (Bottom fixed)
│
├── FrameCounterChips (Sticky Bottom Bar)
│   [Yumurtalık: 4] [Bal: 3] [Polen: 2] [Perga: 1] [Boş: 0]  Toplam: 10
│
├── Bulk Actions (Collapsible)
│   ├── [Tümünü Bal Olarak İşaretle]
│   ├── [Yeni Sezon Sıfırla] → Confirm Modal
│   └── [CSV Dışa Aktar]
│
└── FrameListView (Alternative - Pro)
    └── Virtualized Table: Position | Type | Cycles | Age | Foundation | Last Extract | Actions
```

### 3.2 FrameDetailModal

```
┌─────────────────────────────────────┐
│ Çerçeve #3 — Detay              [×] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐    │
│  │  [BAL]       Döngü: 3       │    │  ← Büyük tip badge
│  │  Perga Yaşı: 14 ay          │    │
│  │  Son Bal Alımı: 15 Tem 2024 │    │
│  │  Son Temizlik: 20 Ara 2024  │    │
│  │  Perga Tipi: Mum            │    │
│  └─────────────────────────────┘    │
│                                     │
│  Tip Değiştir:                      │
│  [Yumurtalık] [Bal] [Polen] [Perga] [Boş]  ← Chip Group
│                                     │
│  Perga Tipi: [Mum ▼] [Plastik] [Pergasız] │
│                                     │
│  Not: [________________________]    │
│                                     │
│  [İptal]                    [Kaydet] │
└─────────────────────────────────────┘
```

### 3.3 Global Çerçeve Listesi (/frames — Pro)

```
FramesPage (Pro)
├── Header: "Tüm Çerçeveler" + [Filtre] + [CSV Export]
├── Filters: Kovan ▼ | Tip ▼ | Durum ▼ | Yaş Aralığı | Döngü > N
├── Table (Virtualized)
│   Position | Kovan | Tip | Döngü | Yaş | Perga | Son Bal | Son Temizlik | Aksiyon
│   #3       | K-12  | 🟡  | 3     | 14a | Mum   | 15 Tem  | 20 Ara       | [✏️] [🗑️]
│   #7       | K-12  | 🟠  | 0     | 2a  | Plast | -       | -            | [✏️] [🗑️]
└── Pagination / Infinite Scroll
```

---

## 4. Bileşen Detayları

### 4.1 FrameMiniCard (Grid Slot İçinde)

```tsx
// components/frame/FrameMiniCard.tsx
interface FrameMiniCardProps {
  frame: Frame;
  position: number;
  onClick: () => void;
  compact?: boolean;
}

export function FrameMiniCard({ frame, position, onClick, compact }: FrameMiniCardProps) {
  const typeConfig = FRAME_TYPE_CONFIG[frame.frame_type];
  const ageColor = frame.wax_age_months > 36 ? 'text-error' : 
                   frame.wax_age_months > 24 ? 'text-warning' : 'text-success';
  const cycleColor = frame.cycles_completed >= 5 ? 'text-warning' : 'text-honey-400';

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-xl border transition-all duration-100',
        'hover:shadow-lg hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-honey-400',
        compact ? 'p-1.5' : ''
      )}
      style={{ borderColor: typeConfig.borderColor }}
    >
      {/* Pozisyon Numarası */}
      <span className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-neutral-900 border border-neutral-700 text-[10px] font-bold flex items-center justify-center">
        {position}
      </span>

      {/* Tip Badge - Büyük */}
      <div className={cn(
        'mb-2 px-2 py-1 rounded-lg text-center text-[11px] font-bold',
        compact ? 'text-[10px] py-0.5' : '',
        typeConfig.bg
      )}>
        {typeConfig.icon}
        <span className="ml-1">{typeConfig.label}</span>
      </div>

      {/* Döngü + Yaş */}
      <div className="flex items-center justify-between text-[10px]">
        <span className={cn('font-mono', cycleColor)}>
          <RotateCcw className="w-3 h-3 inline-block mr-0.5" />
          {frame.cycles_completed}
        </span>
        <span className={cn('font-mono', ageColor)}>
          <Clock className="w-3 h-3 inline-block mr-0.5" />
          {frame.wax_age_months ? `${frame.wax_age_months}a` : 'Yeni'}
        </span>
      </div>

      {/* Perga Tipi İkonu */}
      <div className="flex justify-center mt-1">
        <FoundationIcon type={frame.foundation_type} className="w-4 h-4 text-neutral-500" />
      </div>

      {/* Uyarı: Eski Petek */}
      {frame.wax_age_months && frame.wax_age_months > 36 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <Badge variant="error" className="text-[9px] px-1.5 py-0.5">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Değişim
          </Badge>
        </div>
      )}

      {/* Durum: Depoda/Temizleniyor */}
      {frame.status !== 'in_use' && (
        <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
          <span className="text-xs font-medium px-2 py-1 bg-neutral-900/90 rounded">
            {FRAME_STATUS_LABELS[frame.status]}
          </span>
        </div>
      )}
    </button>
  );
}

const FRAME_TYPE_CONFIG = {
  brood: { label: 'Yumurtalık', icon: <Egg className="w-3.5 h-3.5" />, bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30', borderColor: 'rgba(245,158,11,0.3)' },
  honey: { label: 'Bal', icon: <Droplets className="w-3.5 h-3.5" />, bg: 'bg-honey-400/20 text-honey-400 border-honey-400/30', borderColor: 'rgba(251,191,36,0.3)' },
  pollen: { label: 'Polen', icon: <CircleDot className="w-3.5 h-3.5" />, bg: 'bg-orange-500/20 text-orange-400 border-orange-500/30', borderColor: 'rgba(249,115,22,0.3)' },
  foundation: { label: 'Perga', icon: <Layout className="w-3.5 h-3.5" />, bg: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30', borderColor: 'rgba(115,115,115,0.3)' },
  empty: { label: 'Boş', icon: <Square className="w-3.5 h-3.5" />, bg: 'bg-neutral-700/50 text-neutral-500 border-neutral-600/30', borderColor: 'rgba(75,85,99,0.3)' },
};

const FRAME_STATUS_LABELS = {
  in_use: 'Kullanımda',
  extracted: 'Bal Alındı',
  cleaning: 'Temizleniyor',
  stored: 'Depoda',
  retired: 'Emekli',
};
```

### 4.2 FrameCounterChips (Muayene Modalında ve Çerçeve Sekmesinde)

```tsx
// components/frame/FrameCounterChips.tsx — Zaten Hive_Inspections.md'de detaylı
// Burada sadece read-only versiyonu (Çerçeve Sekmesi için)

export function FrameCounterChipsReadOnly({ frames }: { frames: Frame[] }) {
  const counts = useMemo(() => ({
    brood: frames.filter(f => f.frame_type === 'brood').length,
    honey: frames.filter(f => f.frame_type === 'honey').length,
    pollen: frames.filter(f => f.frame_type === 'pollen').length,
    foundation: frames.filter(f => f.frame_type === 'foundation').length,
    empty: frames.filter(f => f.frame_type === 'empty').length,
    total: frames.length,
  }), [frames]);

  const chips = [
    { key: 'brood', label: 'Yumurtalık', count: counts.brood, color: 'amber' },
    { key: 'honey', label: 'Bal', count: counts.honey, color: 'honey' },
    { key: 'pollen', label: 'Polen', count: counts.pollen, color: 'orange' },
    { key: 'foundation', label: 'Perga', count: counts.foundation, color: 'neutral' },
    { key: 'empty', label: 'Boş', count: counts.empty, color: 'slate' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 px-2 py-2 bg-neutral-900/50 rounded-xl border border-neutral-700">
      {chips.map(({ key, label, count, color }) => (
        <span key={key} className={cn(
          'inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs font-medium',
          count > 0 ? `bg-${color}-500/20 text-${color}-400 border-${color}-500/30` : 'bg-neutral-800/50 text-neutral-500 border-neutral-600'
        )}>
          <FrameTypeIcon type={key} className="w-3 h-3" />
          <span>{count}</span>
        </span>
      ))}
      <span className="flex items-center px-2 py-1 text-xs text-neutral-500 border border-dashed border-neutral-700 rounded-full ml-auto">
        Toplam: {counts.total}
      </span>
    </div>
  );
}
```

### 4.3 FrameDetailModal

```tsx
// components/frame/FrameDetailModal.tsx
export function FrameDetailModal({ frame, hive, onSave, onClose }) {
  const [formData, setFormData] = useState({
    frame_type: frame.frame_type,
    foundation_type: frame.foundation_type,
    status: frame.status,
    cycles_completed: frame.cycles_completed,
    wax_age_months: frame.wax_age_months,
    last_extracted_at: frame.last_extracted_at,
    last_cleaned_at: frame.last_cleaned_at,
    notes: frame.notes,
  });

  const handleTypeChange = (newType: FrameType) => {
    setFormData(prev => {
      const next = { ...prev, frame_type: newType };
      // Bal alındığında döngü artır
      if (newType === 'honey' && prev.frame_type !== 'honey') {
        next.cycles_completed = prev.cycles_completed + 1;
        next.last_extracted_at = new Date().toISOString().split('T')[0];
        next.status = 'extracted';
      }
      // Yumurtalık/Perga/Boş'a çekerken döngü sayılmaz
      if (['brood', 'foundation', 'empty'].includes(newType)) {
        next.status = 'in_use';
      }
      return next;
    });
  };

  return (
    <Modal isOpen onClose={onClose} title={`Çerçeve #${frame.position} — Detay`} size="md">
      <div className="space-y-6">
        {/* Mevcut Durum Özeti */}
        <Card variant="glass" padding="md">
          <div className="flex items-center gap-3">
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', FRAME_TYPE_CONFIG[formData.frame_type].bg)}>
              <FRAME_TYPE_CONFIG[formData.frame_type].icon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-neutral-50">{FRAME_TYPE_CONFIG[formData.frame_type].label}</p>
              <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
                <span className="flex items-center gap-1 font-mono text-honey-400">
                  <RotateCcw className="w-3.5 h-3.5" /> Döngü: {formData.cycles_completed}
                </span>
                {formData.wax_age_months && (
                  <span className={cn('flex items-center gap-1 font-mono', formData.wax_age_months > 36 ? 'text-error' : 'text-success')}>
                    <Clock className="w-3.5 h-3.5" /> Yaş: {formData.wax_age_months} ay
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Tip Değiştir — Chip Group */}
        <div>
          <label className="block text-sm font-medium text-neutral-400 mb-2">Çerçeve Tipi</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(FRAME_TYPE_CONFIG).map(([key, config]) => (
              <button
                key={key}
                onClick={() => handleTypeChange(key as FrameType)}
                className={cn(
                  'inline-flex items-center gap-1 px-3 py-2 rounded-full border text-sm font-medium transition-all',
                  formData.frame_type === key
                    ? `${config.bg} border-${config.borderColor} scale-105 shadow-md`
                    : `bg-neutral-800/50 border-neutral-600 hover:border-${config.borderColor}`
                )}
              >
                {config.icon}
                <span>{config.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Perga Tipi */}
        <FormField label="Perga Tipi">
          <Select value={formData.foundation_type} onChange={v => setFormData({ ...formData, foundation_type: v })}>
            <SelectItem value="wax">🕯 Mum Perga</SelectItem>
            <SelectItem value="plastic">🔶 Plastik Perga</SelectItem>
            <SelectItem value="foundationless">📄 Pergasız (Doğal)</SelectItem>
          </Select>
        </FormField>

        {/* Tarihler */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Son Bal Alımı">
            <Input type="date" value={formData.last_extracted_at} onChange={v => setFormData({ ...formData, last_extracted_at: v })} />
          </FormField>
          <FormField label="Son Temizlik">
            <Input type="date" value={formData.last_cleaned_at} onChange={v => setFormData({ ...formData, last_cleaned_at: v })} />
          </FormField>
        </div>

        {/* Durum */}
        <FormField label="Durum">
          <Select value={formData.status} onChange={v => setFormData({ ...formData, status: v })}>
            <SelectItem value="in_use">Kullanımda</SelectItem>
            <SelectItem value="extracted">Bal Alındı</SelectItem>
            <SelectItem value="cleaning">Temizleniyor</SelectItem>
            <SelectItem value="stored">Depoda</SelectItem>
            <SelectItem value="retired">Emekli / Değişim Gerekli</SelectItem>
          </Select>
        </FormField>

        {/* Not */}
        <FormField label="Not">
          <Textarea value={formData.notes} onChange={v => setFormData({ ...formData, notes: v })} rows={3} />
        </FormField>

        {/* Aksiyonlar */}
        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button variant="ghost" fullWidth onClick={onClose}>İptal</Button>
          <Button variant="primary" fullWidth onClick={() => onSave(formData)}>Kaydet</Button>
        </div>
      </div>
    </Modal>
  );
}
```

### 4.4 Yeni Sezon Sıfırlama Modalı

```tsx
// components/frame/ResetSeasonModal.tsx
export function ResetSeasonModal({ hive, frames, onConfirm, onClose }) {
  const [options, setOptions] = useState({
    setAllToFoundation: true,      // Hepsini Perga yap
    resetCycles: true,             // Döngüleri 0'la
    resetWaxAge: false,            // Petek yaşını SIFIRLAMA (birikimli)
    archiveOldFrames: true,        // >5 döngü / >3 yaş olanları "Emekli" yap
  });

  const affectedFrames = frames.filter(f => 
    f.frame_type !== 'foundation' || f.cycles_completed > 0
  );

  return (
    <Modal isOpen onClose={onClose} title="Yeni Sezon İçin Sıfırla" size="md">
      <div className="space-y-4">
        <Card variant="bordered" padding="md" className="bg-warning-bg/30 border-warning/30">
          <AlertTriangle className="w-5 h-5 text-warning mb-2" />
          <p className="text-sm text-neutral-400">
            Bu işlem <strong>{affectedFrames.length}</strong> çerçeveyi etkileyecek. 
            Geri alınamaz (sadece manuel düzeltilir).
          </p>
        </Card>

        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={options.setAllToFoundation} onChange={e => setOptions({...options, setAllToFoundation: e.target.checked})} className="w-4 h-4 accent-honey-400" />
            <div>
              <p className="font-medium">Tüm çerçeveleri "Perga" tipine çevir</p>
              <p className="text-xs text-neutral-500">Yeni sezon başlangıç varsayımı</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={options.resetCycles} onChange={e => setOptions({...options, resetCycles: e.target.checked})} className="w-4 h-4 accent-honey-400" />
            <div>
              <p className="font-medium">Döngü sayılarını sıfırla</p>
              <p className="text-xs text-neutral-500">Bal alım sayacını yeni sezona başlat</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={options.resetWaxAge} onChange={e => setOptions({...options, resetWaxAge: e.target.checked})} className="w-4 h-4 accent-honey-400" />
            <div>
              <p className="font-medium text-error">⚠ Petek yaşını da sıfırla</p>
              <p className="text-xs text-neutral-500">Önerilmez! Petek yaşı birikimlidir, sadece perga değiştirildiğinde sıfırlanır.</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={options.archiveOldFrames} onChange={e => setOptions({...options, archiveOldFrames: e.target.checked})} className="w-4 h-4 accent-honey-400" />
            <div>
              <p className="font-medium">Eski petekleri "Emekli" yap</p>
              <p className="text-xs text-neutral-500">>5 döngü veya >36 ay olanları "Değişim Gerekli" olarak işaretle</p>
            </div>
          </label>
        </div>

        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button variant="ghost" fullWidth onClick={onClose}>İptal</Button>
          <Button variant="primary" fullWidth onClick={() => onConfirm(options)}>Sıfırla ve Uygula</Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/frame.ts
interface Frame {
  id: string; // UUIDv7
  hiveId: string;
  position: number; // 1-12 (kovan içi sıra)
  frame_type: 'brood' | 'honey' | 'pollen' | 'foundation' | 'empty';
  foundation_type: 'wax' | 'plastic' | 'foundationless';
  status: 'in_use' | 'extracted' | 'cleaning' | 'stored' | 'retired';
  cycles_completed: number; // Kaç kez bal alınıp yeniden kullanıldı
  last_extracted_at?: string; // ISO date
  last_cleaned_at?: string;
  wax_age_months?: number; // Petek yaşı (ay) — Mum perga için kritikal
  notes?: string;
  nfc_tag?: string; // Fiziksel etiket
  created_at: string;
  updated_at: string;
}

// Hesaplanan alanlar (local)
interface FrameComputed {
  needs_replacement: boolean; // wax_age > 36 ay VEYA cycles > 5
  days_since_extraction: number | null;
  days_since_cleaning: number | null;
  value_estimate: number; // Tahmini değer (mum maliyeti - bal geliri)
}
```

### Petek Yaşı Hesaplama Mantığı

| Senaryo | Petek Yaşı (wax_age_months) | Döngü (cycles_completed) |
|---------|----------------------------|--------------------------|
| Yeni mum perga koyuldu | 0 | 0 |
| İlk bal alındı | 0 (yaş değişmez) | 1 |
| 6 ay sonra tekrar bal alındı | 6 | 2 |
| Perga değiştirildi (yeni mum) | 0 (SIFIRLANIR) | 0 (SIFIRLANIR) |
| Plastik perga | Yaş artar (kök petek yaşı) | Artar |
| Pergasız (doğal) | Yaş artar | Artar |

> **Kural:** `wax_age_months` sadece **mum perga** için sıfırlanır. Plastik/pergasız da petek kökleri yaşlanır.

---

## 6. AI Entegrasyonu (Frame Agent)

```typescript
// agents/frameAgent.ts
interface FrameAnalysisInput {
  hiveId: string;
  frames: Frame[];
  inspections: Inspection[];
  region: string;
  season: Season;
}

interface FrameRecommendation {
  frameId: string;
  action: 'replace_wax' | 'rotate_position' | 'clean' | 'extract_honey' | 'move_to_honey_super';
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  dueDate: string;
}

export async function analyzeFrames(input: FrameAnalysisInput): Promise<FrameRecommendation[]> {
  const recommendations: FrameRecommendation[] = [];

  for (const frame of input.frames) {
    // 1. Eski petek kontrolü
    if (frame.wax_age_months && frame.wax_age_months > 36) {
      recommendations.push({
        frameId: frame.id,
        action: 'replace_wax',
        priority: 'high',
        reasoning: `Petek yaşı ${frame.wax_age_months} ay (eşik: 36 ay). Eski petek hastalık bulaşıcıları barındırabilir, bal kalitesini düşürür.`,
        dueDate: addDays(new Date(), 14).toISOString(),
      });
    }

    // 2. Çok döngü yapılmış petek
    if (frame.cycles_completed >= 5) {
      recommendations.push({
        frameId: frame.id,
        action: 'replace_wax',
        priority: 'medium',
        reasoning: `${frame.cycles_completed} döngü tamamlanmış. Petek kalınlaşmış, hücre boyu küçülmüş olabilir.`,
        dueDate: addDays(new Date(), 30).toISOString(),
      });
    }

    // 3. Mevsimsel rotasyon (Bahar: Yumurtalık → Ortada, Bal → Üstte)
    if (input.season === 'spring' && frame.frame_type === 'honey' && frame.position <= 3) {
      recommendations.push({
        frameId: frame.id,
        action: 'move_to_honey_super',
        priority: 'low',
        reasoning: 'Bahar döneminde bal çerçeveleri üst kasa (super) ya da kenarlara taşınmalı, ortada yumurtalık alanı genişletilmeli.',
        dueDate: addDays(new Date(), 7).toISOString(),
      });
    }

    // 4. Bal alımı hazır mı? (Petek operkülle kaplı mı? — Muayeneden gelmeli)
    const lastInsp = input.inspections[0];
    if (lastInsp && lastInsp.frame_distribution.honey > 0 && frame.frame_type === 'honey') {
      // Operkül oranı muayenede yoksa varsayım: %80+ operkül = hasat
      recommendations.push({
        frameId: frame.id,
        action: 'extract_honey',
        priority: 'medium',
        reasoning: 'Bal çerçevesi operküllendirilmiş olabilir. Hasat kontrolü yapın.',
        dueDate: addDays(new Date(), 3).toISOString(),
      });
    }
  }

  return recommendations.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
}
```

---

## 7. Offline ve Senkronizasyon

| İşlem | Offline Davranış |
|-------|------------------|
| Tip değiştir | IndexedDB anında, `sync_queue` push |
| Döngü artır | Local state, senkron kuyruğu |
| Yeni sezon sıfırla | Batch update (12 frame), tek sync op |
| NFC yaz | Web NFC API, offline'da kuyrukta bekler |
| Fotoğraf çek | Blob IndexedDB, thumb oluştur, upload kuyruğu |

---

## 8. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Grid Navigasyonu** | Arrow keys (←→↑↓) ile slotlar arası, Enter/Space ile modal |
| **Renk Körlüğü** | Tip: İkon + Metin + Şekil (Border rengi de farklı) |
| **Yaş/Uyarı** | `aria-live="polite"` ile "Çerçeve 3: 14 ay, değişim gerekmiyor" / "Çerçeve 7: 40 ay, KRİTİK - değişim gerekli" |
| **Döngü Sayısı** | `aria-label="Döngü sayısı 3, maksimum 5"` |
| **Ekran Okuyucu** | "10 çerçeve ızgarası. Pozisyon 1: Bal, 3 döngü, 6 ay. Pozisyon 2: Yumurtalık, 0 döngü, 12 ay..." |

---

## 9. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Çerçeve tipini Bal→Yumurtalık yap | Döngü sayısı **artmaz**, status `in_use`, `last_extracted_at` korundu mu? |
| Çerçeve tipini Yumurtalık→Bal yap | Döngü **+1**, `last_extracted_at` = bugün, status `extracted` |
| Perga Mum→Plastik değiştir | `wax_age_months` **korunur** (kök petek yaşı), `foundation_type` değişir |
| Yeni Sezon Sıfırla (opsiyonlar hepsi açık) | Tüm frame_type=`foundation`, cycles=0, wax_age **korunur**, eski emekli |
| Petek yaşı 40 ay girildiğinde | Grid'de kırmızı "Değişim" badge, FrameDetailModal'da uyarı banner |
| Offline 3 çerçeve değiştir → Online | 3 `update_frame` sync op, batch gönderilir, server ID ile merge |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **AR Petek Tarama** | Kamerayla çerçeve üzerine tutulduğunda: Operkül oranı % hesaplama, varroa sayımı, hücre boyu ölçümü |
| **IoT Ağırlık Sensörü** | Çerçeve altındaki yük hücresi → "Bu çerçeve %90 dolu, hasat zamanı" |
| **Genetik Petek Analizi** | Petek numunesi DNA → Hastalık direnci, ırk safiyeti |
| **Otomatik Yaşlandırma** | Cron job: Her ay 1. günde `wax_age_months++` (sadece `in_use` olanlar) |
| **Çerçeve Pazarı** | "Emekli çerçeve sat/bağışla" — Kooperatif içi transfer |
| **3D Kovan Simülasyonu** | WebGL ile kovan 3D modeli, çerçeve yerleştirme simülasyonu |