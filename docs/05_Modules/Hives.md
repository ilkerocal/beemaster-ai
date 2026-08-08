# BeeMaster AI — Hives (Kovanlar) Modülü v1.0

> **Amaç:** Kovan yaşam döngüsünün merkezi yönetimi. Kovan CRUD, çerçeve haritası (petek döngüsü), ana arı takibi, muayene/hasat/besleme/tedavi geçmişi, NFC/QR entegrasyonu.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/hives/:id` (Detay), `/apiaries/:apiaryId/hives` (Liste) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (hives, frames, queens, inspections, harvests, feedings, treatments), Supabase Sync |
| **Offline** | %100 (Tüm CRUD lokal, medya blob olarak IndexedDB) |
| **Performans** | Detay sayfası < 1s (lokal veri), Çerçeve ızgara 60fps |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| HV-01 | Arı üssünde kovanları grid/liste olarak görmek, arama/filtre yapmak | P0 |
| HV-02 | Yeni kovan eklerken: isim, ırk, kutu tipi, çerçeve sayısı, NFC etiketi yazmak | P0 |
| HV-03 | Kovan detayında: çerçeve haritası (petek döngüsü), ana arı pedigreesi, geçmiş zaman çizelgesi | P0 |
| HV-04 | Çerçeve tıklayıp tipini değiştirmek (Bal/Yumurtalık/Polen/Perga/Boş), döngü sayısını artırmak | P0 |
| HV-05 | Hızlı muayene, hasat, besleme, tedavi başlatmak (Context-aware wizard) | P0 |
| HV-06 | Kovanı diğer üse taşımak, birleştirmek, satış/ölüm olarak işaretlemek | P1 |
| HV-07 | NFC/QR ile kovanı fiziksel etiketleyip, telefonla tarayıp açmak | P1 |
| HV-08 | Kovan performans analitiği: verim trendi, varroa trendi, maliyet/gelir | P2 |

---

## 3. UI Yapısı

### 3.1 Kovan Listesi (/apiaries/:apiaryId/hives)

```
HivesListPage
├── PageHeader
│   ├── Title: "Kovanlar" + Apiary adı
│   └── Actions: [+ Kovan Ekle] (Primary)
│
├── FilterBar (Sticky)
│   ├── Search: İsim, NFC, Etiket
│   ├── Status Chips: [Aktif] [Zayıf] [Ölü] [Satıldı] [Birleştirildi]
│   ├── Strain Filter: [Anadolu] [Kafkas] [Karnika] [İtalyan] [Hibrit]
│   └── Sort: [İsim] [Güç] [Son Muayene] [Hasat]
│
├── ViewToggle: [Grid] [Liste] [Harita] (Default: Grid)
│
├── Grid View (Default)
│   └── HiveCard[] (2 kol mobil, 3 tablet, 4 desktop)
│
├── List View
│   └── HiveCard.List[] (Compact, swipe actions)
│
├── Map View (Eğer kovan GPS varsa)
│   └── Map + Kovan Marker Cluster
│
└── EmptyState: "Bu üste henüz kovan yok" → [+ İlk Kovanı Ekle]
```

### 3.2 Kovan Detay Sayfası (/hives/:id)

```
HiveDetailPage
├── StickyHeader
│   ├── Back, Kovan Adı, Status Badge, 3-dot Menu
│   └── NFC/QR Icon → [Tara] [Yazdır] [Paylaş]
│
├── SummaryChips (Horizontal Scroll)
│   ├── Güç: [●●●○○] Orta
│   ├── İrk: Anadolu Arısı
│   ├── Ana Arı: 2024, Yeşil, Aktif
│   ├── Çerçeve: 10 (4B/3H/2P/1E)
│   ├── Kutu: Langstroth
│   └── Son Muayene: 3 gün önce
│
├── Tabs (Sticky)
│   ├── [Genel] [Çerçeveler] [Geçmiş] [Analitik]
│
├── GENEL SEKME
│   ├── HiveInfoCard (Temel: İsim, İrk, Kutu, Çerçeve, Kurulum Tarihi, Notlar)
│   ├── QueenCard (Pedigree, Performans, Değişim Takvimi, [Değiştir] aksiyonu)
│   ├── QuickActions (Grid 2x2)
│   │   ├── [Muayene Yap] 🎙 (Primary)
│   │   ├── [Hasat Gir] 🍯
│   │   ├── [Besleme Planla] 🍯
│   │   └── [Tedavi Başlat] ⚠
│   └── NotesCard (Serbest metin, zaman damgalı)
│
├── ÇERÇEVE SEKMESİ — ANA ÖZELLİK (Petek Yaşam Döngüsü)
│   ├── FrameGrid (Görsel ızgara: kutu tipine göre 8/10/12 slot)
│   │   ├── Slot 1-10: FrameMiniCard (Tip ikonu + Döngü sayısı + Yaş)
│   │   │   Renk Kodlaması:
│   │   │   🟡 Bal (Honey)
│   │   │   🟠 Yumurtalık (Brood)
│   │   │   🟠🟡 Karışık
│   │   │   🟣 Polen (Pollen)
│   │   │   ⚪ Perga (Foundation)
│   │   │   ⚫ Boş (Empty)
│   │   │   🔴 Eski/Değişim Gerekli (>3 yıl / >5 döngü)
│   │   └── Tıklama → FrameDetailModal
│   ├── FrameCounterChips (Alt bar - Muayene modalında da kullanılır)
│   │   [Yumurtalık: 4] [Bal: 3] [Polen: 2] [Perga: 1] [Boş: 0]  Toplam: 10
│   ├── Bulk Actions
│   │   ├── [Tümünü Bal Olarak İşaretle]
│   │   ├── [Yeni Sezon Sıfırla] (Tüm döngüleri 0'la, tipi Perga yap)
│   │   └── [CSV Dışa Aktar]
│   └── Legend (Renk/İkon açıklaması)
│
├── GEÇMİŞ SEKMESİ
│   ├── Timeline (Zaman çizelgesi - en yeni en üst)
│   │   ├── Filtre: [Tümü] [Muayene] [Hasat] [Besleme] [Tedavi] [Ana Arı] [Diğer]
│   │   ├── Item: Icon + Başlık + Tarih + Özet + [Detay] [Düzenle] [Sil]
│   │   └── Virtualized List (100+ kayıt)
│   └── Export Buttons: [PDF Raporu] [Excel]
│
└── ANALİTİK SEKMESİ (Pro+)
    ├── KPI Row: Sezon Verimi, Ort. Varroa, Maliyet/Kovan, Net Kar
    ├── Charts (Tabs): [Verim Trendi] [Varroa Trendi] [Güç Trendi] [Maliyet/Gelir]
    └── Table: Kovan Bazlı Performans (Sıralanabilir)
```

---

## 4. Bileşen Detayları

### 4.1 HiveCard (Grid Varyantı)

```tsx
// components/hive/HiveCard.tsx
interface HiveCardProps {
  hive: Hive;
  variant: 'grid' | 'list' | 'compact';
  onClick: () => void;
  onInspect: () => void;
  onMenu: () => void;
}

export function HiveCard({ hive, variant = 'grid', onClick, onInspect, onMenu }: HiveCardProps) {
  const strengthConfig = {
    very_weak: { label: 'Çok Zayıf', color: 'text-error', dots: '●○○○○' },
    weak: { label: 'Zayıf', color: 'text-warning', dots: '●●○○○' },
    moderate: { label: 'Orta', color: 'text-info', dots: '●●●○○' },
    strong: { label: 'Güçlü', color: 'text-success', dots: '●●●●○' },
    very_strong: { label: 'Çok Güçlü', color: 'text-honey-400', dots: '●●●●●' },
  }[hive.strength];

  const statusBadges = {
    active: <Badge variant="success">Aktif</Badge>,
    weak: <Badge variant="warning">Zayıf</Badge>,
    dead: <Badge variant="error">Ölü</Badge>,
    sold: <Badge variant="default">Satıldı</Badge>,
    merged: <Badge variant="info">Birleştirildi</Badge>,
  };

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-3 bg-neutral-900/50 backdrop-blur rounded-xl border border-neutral-700" onClick={onClick}>
        <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
          <Home className="w-5 h-5 text-neutral-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-50 truncate">{hive.name}</p>
          <p className="text-xs text-neutral-400">{hive.strain} • {hive.frameCount} çerçeve</p>
        </div>
        {statusBadges[hive.status]}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <Card variant="bordered" padding="md" className="flex items-center justify-between gap-4" onClick={onClick}>
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
            <Home className="w-6 h-6 text-neutral-400" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-50 truncate">{hive.name}</h3>
              {statusBadges[hive.status]}
            </div>
            <div className="flex items-center gap-3 text-sm text-neutral-400 mt-1">
              <span className="flex items-center gap-1">{hive.strain}</span>
              <span className="flex items-center gap-1"><Layout className="w-3.5 h-3.5" /> {hive.frameCount} çerçeve</span>
              <span className={cn('flex items-center gap-1', strengthConfig.color)}>
                <Circle className="w-2 h-2 rounded-full" /> {strengthConfig.label}
              </span>
              {hive.queen && (
                <span className="flex items-center gap-1 text-honey-400">
                  <Crown className="w-3.5 h-3.5" /> Ana arı var
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={onInspect} leftIcon={<ClipboardList className="w-4 h-4" />}>
            Muayene
          </Button>
          <Button variant="primary" size="sm" onClick={onClick} rightIcon={<ChevronRight className="w-4 h-4" />}>
            Detay
          </Button>
        </div>
      </Card>
    );
  }

  // Grid Variant
  return (
    <Card variant="interactive" padding="md" onClick={onClick} className="h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center">
            <Home className="w-5 h-5 text-neutral-400" />
          </div>
          <h3 className="font-semibold text-neutral-50 truncate">{hive.name}</h3>
        </div>
        {statusBadges[hive.status]}
      </div>

      <div className="flex-1 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-neutral-400">
          <Tag className="w-3.5 h-3.5" /> {hive.strain}
        </div>
        <div className="flex items-center gap-2 text-neutral-400">
          <Layout className="w-3.5 h-3.5" /> {hive.frameCount} çerçeve • {hive.boxType}
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('flex items-center gap-1', strengthConfig.color)}>
            <Circle className="w-2 h-2 rounded-full" />
            <span className="capitalize">{strengthConfig.label}</span>
          </span>
        </div>
        {hive.lastInspectionAt && (
          <div className="flex items-center gap-2 text-neutral-500">
            <Clock className="w-3.5 h-3.5" />
            Son muayene: {formatDistanceToNow(new Date(hive.lastInspectionAt), { addSuffix: true, locale: tr })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-neutral-700 flex gap-2">
        <Button variant="primary" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); onInspect(); }} leftIcon={<Mic className="w-3.5 h-3.5" />}>
          Hızlı Muayene
        </Button>
        <Button variant="outline" size="sm" fullWidth onClick={(e) => { e.stopPropagation(); onClick(); }} rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
          Detay
        </Button>
      </div>
    </Card>
  );
}
```

### 4.2 FrameGrid (Çerçeve Haritası - Petek Döngüsü)

```tsx
// components/hive/FrameGrid.tsx
interface FrameGridProps {
  frames: Frame[];
  boxType: BoxType; // langstroth(10), dadant(11), layens(12), flow(7), top_bar(0)
  onFrameClick: (frame: Frame) => void;
  editable?: boolean;
}

export function FrameGrid({ frames, boxType, onFrameClick, editable = true }: FrameGridProps) {
  const frameCount = FRAME_COUNT_BY_BOX[boxType] || 10;
  const cols = boxType === 'layens' ? 6 : boxType === 'top_bar' ? 5 : 5; // Responsive grid

  // Frame map by position
  const frameMap = useMemo(() => {
    const map = new Map<number, Frame>();
    frames.forEach(f => map.set(f.position, f));
    return map;
  }, [frames]);

  const getFrameTypeConfig = (type: FrameType) => {
    const configs = {
      brood: { label: 'Yumurtalık', color: 'bg-amber-500/20 border-amber-500/30 text-amber-400', icon: <Egg className="w-4 h-4" /> },
      honey: { label: 'Bal', color: 'bg-honey-400/20 border-honey-400/30 text-honey-400', icon: <Droplets className="w-4 h-4" /> },
      pollen: { label: 'Polen', color: 'bg-orange-500/20 border-orange-500/30 text-orange-400', icon: <CircleDot className="w-4 h-4" /> },
      foundation: { label: 'Perga', color: 'bg-neutral-500/20 border-neutral-500/30 text-neutral-400', icon: <Layout className="w-4 h-4" /> },
      empty: { label: 'Boş', color: 'bg-neutral-700/50 border-neutral-600/30 text-neutral-500', icon: <Square className="w-4 h-4" /> },
    };
    return configs[type] || configs.empty;
  };

  const isOldFrame = (frame: Frame) => {
    if (frame.waxAgeMonths && frame.waxAgeMonths > 36) return true; // 3 yıl
    if (frame.cyclesCompleted && frame.cyclesCompleted > 5) return true; // 5 döngü
    return false;
  };

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className={cn('grid gap-2', `grid-cols-${cols}`)}>
        {Array.from({ length: frameCount }, (_, i) => i + 1).map((pos) => {
          const frame = frameMap.get(pos);
          const config = frame ? getFrameTypeConfig(frame.frame_type) : getFrameTypeConfig('empty');
          const old = frame && isOldFrame(frame);

          return (
            <button
              key={pos}
              onClick={() => frame && onFrameClick(frame)}
              disabled={!editable || !frame}
              className={cn(
                'relative p-3 rounded-xl border-2 transition-all duration-200',
                'flex flex-col items-center gap-2 min-h-[100px]',
                config.color,
                editable && frame && 'hover:shadow-lg hover:-translate-y-1 cursor-pointer',
                !frame && 'border-dashed opacity-50',
                old && 'ring-2 ring-error ring-offset-2 ring-offset-neutral-900 animate-pulse-subtle'
              )}
              aria-label={`Çerçeve ${pos}: ${frame ? `${config.label}, ${frame.cyclesCompleted} döngü${frame.waxAgeMonths ? `, ${frame.waxAgeMonths} ay` : ''}` : 'Boş'}}`
            >
              <div className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-medium text-neutral-400">#{pos}</span>
                <div className="w-12 h-12 rounded-lg bg-neutral-950/50 flex items-center justify-center text-2xl">
                  {config.icon}
                </div>
                <span className="text-xs font-medium truncate w-full text-center">{config.label}</span>
                {frame && (
                  <>
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full font-mono">
                      🔄 {frame.cyclesCompleted}
                    </span>
                    {frame.waxAgeMonths && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded-full">
                        🕐 {frame.waxAgeMonths} ay
                      </span>
                    )}
                  </>
                )}
              </div>
              {old && (
                <Tooltip content="Eski petek — Değişim önerili (>3 yıl / >5 döngü)">
                  <AlertTriangle className="absolute top-1 right-1 w-4 h-4 text-error" />
                </Tooltip>
              )}
              {editable && frame && (
                <div className="absolute bottom-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="w-4 h-4 text-neutral-400" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* FrameCounter Chips (Alt bar) */}
      <FrameCounter frames={frames} compact={false} />

      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
        {['brood', 'honey', 'pollen', 'foundation', 'empty'].map(type => {
          const c = getFrameTypeConfig(type as FrameType);
          return (
            <span key={type} className="flex items-center gap-1 px-2 py-1 rounded-full border" style={{ borderColor: c.color.match(/border-(\S+)/)?.[1] }}>
              <span className="w-2 h-2 rounded" style={{ backgroundColor: c.color.match(/bg-(\S+)/)?.[1]?.replace('/20', '') }} />
              {c.label}
            </span>
          );
        })}
        <span className="flex items-center gap-1 px-2 py-1 rounded-full border border-error/30 text-error">
          <span className="w-2 h-2 rounded bg-error animate-pulse" /> Eski Petek
        </span>
      </div>
    </div>
  );
}
```

### 4.3 FrameDetailModal (Çerçeve Düzenleme)

```tsx
// components/hive/FrameDetailModal.tsx
interface FrameDetailModalProps {
  frame: Frame;
  hiveId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Frame>) => void;
}

export function FrameDetailModal({ frame, hiveId, isOpen, onClose, onSave }: FrameDetailModalProps) {
  const [form, setForm] = useState({
    frame_type: frame.frame_type,
    foundation_type: frame.foundation_type,
    status: frame.status,
    cycles_completed: frame.cycles_completed,
    wax_age_months: frame.wax_age_months,
    last_extracted_at: frame.last_extracted_at,
    notes: frame.notes,
  });

  const handleSave = () => {
    onSave({ ...form, id: frame.id });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Çerçeve #${frame.position} — Detay`} size="md">
      <div className="space-y-6">
        {/* Current Status Badge */}
        <div className="flex items-center gap-3 p-4 bg-neutral-800/50 rounded-xl">
          <FrameTypeBadge type={form.frame_type} className="text-lg" />
          <div className="flex-1">
            <p className="text-sm text-neutral-400">Döngü: {form.cycles_completed} • Yaş: {form.wax_age_months || '?'} ay</p>
            <p className="text-xs text-neutral-500">Son bal alımı: {form.last_extracted_at ? format(new Date(form.last_extracted_at), 'dd MMM yyyy', { locale: tr }) : 'Hiç'}</p>
          </div>
        </div>

        {/* Type Selector */}
        <FormField label="Çerçeve Tipi">
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Çerçeve tipi seçin">
            {['brood', 'honey', 'pollen', 'foundation', 'empty'].map(type => {
              const config = getFrameTypeConfig(type as FrameType);
              const selected = form.frame_type === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setForm({ ...form, frame_type: type as FrameType })}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all',
                    selected ? `${config.color.replace('/20', '/30')} border-${config.color.match(/border-(\S+)/)?.[1]} bg-${config.color.match(/bg-(\S+)/)?.[1]}30` : 'border-neutral-700 hover:border-honey-400'
                  )}
                >
                  {config.icon}
                  <span>{config.label}</span>
                </button>
              );
            })}
          </div>
        </FormField>

        {/* Foundation Type */}
        <FormField label="Perga Tipi">
          <Select value={form.foundation_type} onChange={v => setForm({ ...form, foundation_type: v })}>
            <SelectItem value="wax">Mum Perga</SelectItem>
            <SelectItem value="plastic">Plastik Perga</SelectItem>
            <SelectItem value="foundationless">Pergasız (Doğal)</SelectItem>
          </Select>
        </FormField>

        {/* Cycle & Age */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Tamamlanan Döngü">
            <Input
              type="number"
              min={0}
              max={20}
              value={form.cycles_completed}
              onChange={v => setForm({ ...form, cycles_completed: parseInt(v) || 0 })}
            />
          </FormField>
          <FormField label="Petek Yaşı (Ay)">
            <Input
              type="number"
              min={0}
              max={120}
              value={form.wax_age_months}
              onChange={v => setForm({ ...form, wax_age_months: parseInt(v) || undefined })}
            />
          </FormField>
        </div>

        {/* Last Extracted */}
        <FormField label="Son Bal Alım Tarihi">
          <Input
            type="date"
            value={form.last_extracted_at ? form.last_extracted_at.split('T')[0] : ''}
            onChange={v => setForm({ ...form, last_extracted_at: v ? new Date(v).toISOString() : undefined })}
            max={new Date().toISOString().split('T')[0]}
          />
        </FormField>

        {/* Status */}
        <FormField label="Durum">
          <Select value={form.status} onChange={v => setForm({ ...form, status: v })}>
            <SelectItem value="in_use">Kullanımda</SelectItem>
            <SelectItem value="extracted">Bal Alındı</SelectItem>
            <SelectItem value="cleaning">Temizleniyor</SelectItem>
            <SelectItem value="stored">Depoda</SelectItem>
            <SelectItem value="retired">Hurda/Değişim</SelectItem>
          </Select>
        </FormField>

        {/* Notes */}
        <FormField label="Notlar">
          <Textarea
            value={form.notes}
            onChange={v => setForm({ ...form, notes: v })}
            rows={3}
            placeholder="Temizlik notu, onarım, özel durum..."
          />
        </FormField>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button variant="outline" fullWidth onClick={onClose}>İptal</Button>
          <Button variant="primary" fullWidth onClick={handleSave} rightIcon={<Check className="w-4 h-4" />}>
            Kaydet
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

### 4.4 QueenCard (Ana Arı Yönetimi)

```tsx
// components/hive/QueenCard.tsx
interface QueenCardProps {
  queen: Queen | null;
  hiveId: string;
  onReplace: () => void;
  onEdit: () => void;
}

export function QueenCard({ queen, hiveId, onReplace, onEdit }: QueenCardProps) {
  if (!queen) {
    return (
      <Card variant="bordered" padding="md" className="bg-warning-bg/30 border-warning/30">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
          <div>
            <p className="font-medium text-neutral-50">Bu kovanda ana arı yok</p>
            <p className="text-sm text-neutral-400">Yeni ana arı eklemek için "Ana Arı Değiştir" butonunu kullanın.</p>
          </div>
          <Button variant="primary" size="sm" onClick={onReplace} className="ml-auto">
            <Plus className="w-4 h-4 mr-1" /> Ana Arı Ekle
          </Button>
        </div>
      </Card>
    );
  }

  const ageMonths = queen.birth_date ? Math.floor((Date.now() - new Date(queen.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 30)) : null;
  const colorYear = getQueenMarkingColor(queen.birth_date); // Beyaz/Sarı/Kırmızı/Yeşil/Mavi

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-honey-400/10 border border-honey-400/20 flex items-center justify-center">
            <Crown className="w-6 h-6 text-honey-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-neutral-50">Ana Arı</h3>
              <QueenMarkingDot color={colorYear} size="sm" />
              <Badge variant={queen.status === 'active' ? 'success' : 'default'}>
                {queen.status === 'active' ? 'Aktif' : queen.status}
              </Badge>
            </div>
            <p className="text-sm text-neutral-400 mt-0.5">
              {queen.strain} • {queen.source === 'bred' ? 'Kendi Yetiştirme' : queen.source === 'purchased' ? `Satın Alınan (${queen.supplier || ''})` : queen.source}
              {ageMonths !== null && ` • ${ageMonths} ay`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onEdit}><Edit className="w-4 h-4" /></Button>
          <Button variant="primary" size="sm" onClick={onReplace} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Değiştir
          </Button>
        </div>
      </div>

      {/* Performance & Details */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-3 bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-400">Performans</p>
          <p className="text-xl font-bold text-honey-400">{queen.performance_score ? (queen.performance_score * 100).toFixed(0) : '—'}/100</p>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-400">Doğum</p>
          <p className="font-medium text-neutral-50">{queen.birth_date ? format(new Date(queen.birth_date), 'dd MMM yyyy', { locale: tr }) : 'Bilinmiyor'}</p>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-400">İşaret Rengi</p>
          <p className="font-medium text-neutral-50 flex items-center gap-1">
            <QueenMarkingDot color={colorYear} size="xs" /> {colorYear}
          </p>
        </div>
        <div className="p-3 bg-neutral-800/50 rounded-xl">
          <p className="text-xs text-neutral-400">Maliyet</p>
          <p className="font-medium text-neutral-50">{queen.cost_try ? `${queen.cost_try} TL` : '—'}</p>
        </div>
      </div>

      {queen.notes && (
        <div className="mt-3 p-3 bg-neutral-800/50 rounded-xl text-sm text-neutral-400">
          {queen.notes}
        </div>
      )}
    </Card>
  );
}
```

---

## 5. Veri Modeli (IndexedDB + Supabase)

```typescript
// types/hive.ts
interface Hive {
  id: string; // UUIDv7
  apiaryId: string;
  userId: string;
  name: string; // "Kovan-01", "Anadolu-3"
  status: 'active' | 'weak' | 'dead' | 'sold' | 'merged';
  strain: 'anatolian' | 'caucasian' | 'carniolan' | 'italian' | 'hybrid';
  queenId?: string; // FK → queens
  boxType: 'langstroth' | 'dadant' | 'layens' | 'flow' | 'top_bar';
  frameCount: number; // 7-12
  positionInApiary: number; // Sıralama
  nfcTag?: string; // Unique NFC/QR code
  installedAt: string; // ISO date
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  // Computed (local)
  strength?: ColonyStrength;
  lastInspectionAt?: string;
  frameSummary?: FrameSummary; // { brood, honey, pollen, foundation, empty }
}

interface Frame {
  id: string;
  hiveId: string;
  position: number; // 1-12
  frameType: 'brood' | 'honey' | 'pollen' | 'foundation' | 'empty';
  foundationType: 'wax' | 'plastic' | 'foundationless';
  status: 'in_use' | 'extracted' | 'cleaning' | 'stored' | 'retired';
  cyclesCompleted: number; // Kaç kez bal alınıp yeniden kullanıldı
  lastExtractedAt?: string;
  waxAgeMonths?: number; // Petek yaşı
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface Queen {
  id: string;
  hiveId: string;
  strain: BeeStrain;
  birthDate: string; // ISO date
  source: 'bred' | 'purchased' | 'swarm' | 'supersedure' | 'emergency';
  supplier?: string;
  costTry?: number;
  markedColor: 'white' | 'yellow' | 'red' | 'green' | 'blue'; // Yıl renk kodu
  status: 'active' | 'superseded' | 'dead' | 'sold' | 'missing';
  performanceScore: number; // 0.00-1.00 AI hesaplamalı
  supersededAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Sync Operations
type HiveSyncOp =
  | { type: 'create_hive'; payload: Omit<Hive, 'id'>; localId: string }
  | { type: 'update_hive'; payload: Partial<Hive> & { id: string } }
  | { type: 'delete_hive'; payload: { id: string; deletedAt: string } }
  | { type: 'move_hives'; payload: { sourceApiaryId: string; targetApiaryId: string; hiveIds: string[] } }
  | { type: 'merge_hives'; payload: { survivorId: string; mergedIds: string[] } };
```

---

## 6. NFC/QR Entegrasyonu

### 6.1 Etiket Yazma Akışı

```
[Kovan Detay] → [NFC İkonu] → [Etiketi Yaz]
  │
  ▼
┌─────────────────────────────────────┐
│ NFC YAZICI MODALI                   │
│                                     │
│ Kovan: Kovan-12 (Eğil Yaylası)      │
│ Etiket ID: BM-2026-000123           │
│                                     │
│ [Telefonu Etikete Yaklaştır] 📱     │
│ (Web NFC API / Native Bridge)       │
│                                     │
│ Yazılacak Veri (JSON):              │
│ {                                   │
│   "type": "hive",                   │
│   "id": "uuid-v7",                  │
│   "name": "Kovan-12",               │
│   "apiary": "Eğil Yaylası",         │
│   "url": "beemaster.ai/h/uuid"      │
│ }                                   │
│                                     │
│ [Yaz] [İptal]                       │
└─────────────────────────────────────┘
```

### 6.2 Etiket Okuma (Web NFC / Camera QR)

```typescript
// lib/nfc.ts
export async function readHiveTag(): Promise<HiveTagData | null> {
  if (!('NDEFReader' in window)) {
    // Fallback: QR Camera
    return scanQRCode();
  }

  const reader = new NDEFReader();
  await reader.scan();
  
  return new Promise((resolve) => {
    reader.onreading = (event) => {
      const decoder = new TextDecoder();
      for (const record of event.message.records) {
        if (record.recordType === 'text') {
          try {
            const data = JSON.parse(decoder.decode(record.data));
            if (data.type === 'hive' && data.id) {
              resolve(data);
              return;
            }
          } catch {}
        }
      }
      resolve(null);
    };
    reader.onreadingerror = () => resolve(null);
    
    // Timeout 10s
    setTimeout(() => resolve(null), 10000);
  });
}

// Kullanım:
const tag = await readHiveTag();
if (tag) {
  navigate(`/hives/${tag.id}`);
} else {
  toast('Etiket okunamadı. Manuel seçin veya QR tara.');
}
```

---

## 7. Performans ve Optimizasyon

| Alan | Strateji |
|------|----------|
| **FrameGrid Render** | `React.memo` + `useMemo` für frameMap, sanal scroll yok (max 12) |
| **HiveList Virtualization** | `@tanstack/react-virtual` (100+ kovan) |
| **NFC** | Web NFC API (Chrome Android) + QR fallback (iOS Safari) |
| **Images** | Frame/Queen fotoları IndexedDB blob, lazy load, WebP |
| **Sync** | Batch 50 işlem, background sync, conflict resolution |

---

## 8. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **FrameGrid Klavye** | Arrow keys ile ızgara gezinme, Enter/Space ile modal açma |
| **Renk Körlüğü** | Frame tipleri: İkon + Metin + Şekil (sadece renk değil) |
| **NFC/QR** | "Etiketi tara" butonu `aria-label="NFC etiketi oku veya QR kodu tara"` |
| **Performans Skoru** | `aria-label="Ana arı performans skoru 85 üzerinden 100"` |
| **Odak Sırası** | Header → Summary Chips → Tabs → Tab Content → Actions |

---

## 9. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Yeni kovan oluştur (NFC yaz) | IndexedDB + Sync kuyruğu, NFC başarı/başarısız toast |
| Çerçeve tipini değiştir (Bal→Yumurtalık) | Döngü sayısı korunur, tip güncellenir, "Son bal alımı" temizlenir |
| Eski petek uyarısı (>3 yıl) | FrameGrid'de kırmızı ring + tooltip, FrameDetailModal'da uyarı banner |
| Kovan taşı (Üs A → Üs B) | Hive.apiaryId güncellenir, Frame/Queen/Inspection referansları tutulur |
| Kovan birleştir (Kovan 1 + 2 → 1) | Survivor kovan güçlenir, merged kovan `status: merged`, geçmiş birleştirilir |
| Ana arı değiştir | Eski kraliçe `status: superseded`, yeni kraliçe eklenir, performans skoru sıfırlanır |
| Offline muayene kaydet | IndexedDB'ye yaz, sync kuyruğu, online olunca push + pull |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **AR Çerçeve Tarama** | Telefon kamerasıyla petek üzerine gelen AR overlay: Yumurtalık alanı % hesapla, varroa say |
| **IoT Sensör Entegrasyonu** | Kovan altındaki ağırlık/sıcaklık/nem sensörü → FrameGrid'de gerçek zamanlı "Bal akışı" göstergesi |
| **Genetik/İrk Analizi** | Ana arı fotoğrafından CNN ile ırk/hibrit oranı tahmini |
| **Otomatik Petek Yaşlandırma** | Son bal alım tarihinden itibaren otomatik `waxAgeMonths` artırma (cron job) |
| **Kovan Ekonomi Modeli** | Kovan bazlı maliyet/gelir/kar projeksiyonu (ML tabanlı) |
| **Çoklu Dil NFC** | Etiket verisinde `lang: 'tr'|'en'|'ar'` → Açılan sayfa o dilde |