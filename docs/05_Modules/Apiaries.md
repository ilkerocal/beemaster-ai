# BeeMaster AI — Apiaries Modülü v1.0

> **Amaç:** Arı üssü (apiary) yaşam döngüsünün merkezi yönetim noktası. Üss oluşturma, harita görselleştirme, mikroiklim analizi, kovan taşıma planlaması ve üss bazlı raporlama.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/apiaries` |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (apiaries, hives), Supabase (hava, flora, bölge verisi) |
| **Offline** | %100 (CRUD lokal, senkron kuyruğu) |
| **Performans** | Harita < 2s yüklenme, 100+ pin clustering |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| AP-01 | Arıcı olarak arı üsslerimi listeleyip, haritada görmek istiyorum | P0 |
| AP-02 | Yeni üs oluştururken konumu haritada pinleyip, mikroiklim notları eklemek istiyorum | P0 |
| AP-03 | Üssler arası kovan taşıma planı yapmak (rota, mesafe, süre, kontrol listesi) istiyorum | P1 |
| AP-04 | Üss bazlı özet: kovan sayısı, ortalama güç, toplam hasat, aktif uyarılar görmek istiyorum | P0 |
| AP-05 | Üssün flora takvimini ve hava durumunu görmek istiyorum | P1 |
| AP-06 | Üss ayarlarını (varsayılan kutu tipi, çerçeve sayısı) yapılandırmak istiyorum | P2 |
| AP-07 | Üssü silmek/arşivlemek ve kovalarını diğer üse taşımak istiyorum | P1 |

---

## 3. UI Yapısı

```
ApiariesPage
├── PageHeader
│   ├── Title: "Arı Üssleri"
│   └── Actions: [+ Yeni Üs] (Primary Button)
│
├── ViewToggle: [Liste] [Harita] (Segmented Control)
│
├── Liste Görünümü (Default)
│   ├── SearchBar (İsim, İl, İlçe filtre)
│   ├── FilterChips: [Aktif] [Arşiv] [Tümü]
│   └── VirtualizedList
│       └── ApiaryCard[] (swipe actions: Düzenle, Taşı, Sil)
│
├── Harita Görünümü
│   ├── MapContainer (Leaflet/MapLibre)
│   │   ├── TileLayer (OpenStreetMap / MapTiler)
│   │   ├── MarkerClusterGroup
│   │   │   └── ApiaryMarker[] (Custom: aktif=gold, pasif=gray)
│   │   ├── UserLocationButton
│   │   └── ScaleControl
│   └── BottomSheet (Marker tıklandığında)
│       ├── ApiaryMiniCard (İsim, Kovan Sayısı, Son Aktivite)
│       └── Actions: [Git] [Kovanlar] [Düzenle]
│
└── EmptyState (Hiç üs yok)
    ├── Illustration
    ├── "Henüz arı üssünüz yok"
    └── [+ İlk Üssü Oluştur]
```

---

## 4. Bileşen Detayları

### 4.1 ApiaryCard (Liste Öğesi)

```tsx
// components/apiary/ApiaryCard.tsx
interface ApiaryCardProps {
  apiary: Apiary;
  hiveCount: number;
  lastActivity: string | null;
  alertsCount: number;
  onEdit: () => void;
  onNavigate: () => void;
  onMoveHives: () => void;
  onDelete: () => void;
}

export function ApiaryCard({ apiary, hiveCount, lastActivity, alertsCount, onEdit, onNavigate, onMoveHives, onDelete }: ApiaryCardProps) {
  return (
    <Card variant="bordered" padding="md" className="flex items-center gap-4 relative">
      {/* Sol: İkon + Renkli indikatör */}
      <div className="relative w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
        <MapPin className="w-6 h-6 text-neutral-400" />
        {alertsCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-5 px-1.5 bg-error text-neutral-50 text-[10px] font-bold rounded-full flex items-center justify-center">
            {alertsCount > 9 ? '9+' : alertsCount}
          </span>
        )}
      </div>

      {/* Orta: Bilgiler */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-neutral-50 truncate">{apiary.name}</h3>
          {apiary.isDefault && <Badge variant="honey" className="text-[10px]">Varsayılan</Badge>}
        </div>
        <p className="text-sm text-neutral-400 truncate mt-0.5">{apiary.address || `${apiary.district}, ${apiary.province}`}</p>
        <div className="flex items-center gap-3 mt-2 text-xs text-neutral-500">
          <span className="flex items-center gap-1"><Home className="w-3 h-3" /> {hiveCount} kovan</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {lastActivity || 'Aktivite yok'}</span>
          {apiary.elevation && <span className="flex items-center gap-1"><Mountain className="w-3 h-3" /> {apiary.elevation}m</span>}
        </div>
      </div>

      {/* Sağ: Aksiyonlar */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button variant="ghost" size="sm" onClick={onNavigate} aria-label="Üs detayı">
          <ChevronRight className="w-5 h-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Daha fazla">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end">
            <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Düzenle</DropdownMenuItem>
            <DropdownMenuItem onClick={onMoveHives}><Truck className="w-4 h-4 mr-2" /> Kovaları Taşı</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-error" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" /> Sil / Arşivle</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
```

### 4.2 ApiaryMarker (Harita Pin'i)

```tsx
// components/apiary/ApiaryMarker.tsx
interface ApiaryMarkerProps {
  apiary: Apiary;
  isActive: boolean;
  hiveCount: number;
  onClick: () => void;
}

export function ApiaryMarker({ apiary, isActive, hiveCount, onClick }: ApiaryMarkerProps) {
  return (
    <div className="flex flex-col items-center" onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className={cn(
        'w-10 h-10 rounded-full border-3 flex items-center justify-center cursor-pointer transition-all duration-200',
        'shadow-lg',
        isActive
          ? 'bg-honey-400 border-neutral-950 scale-110 shadow-[0_0_0_3px_rgba(251,191,36,0.4)]'
          : 'bg-neutral-800 border-neutral-600 hover:scale-110'
      )}>
        <MapPin className={cn('w-5 h-5', isActive ? 'text-neutral-950' : 'text-neutral-400')} />
      </div>
      {hiveCount > 0 && (
        <span className={cn(
          'absolute -bottom-2 left-1/2 -translate-x-1/2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center',
          isActive ? 'bg-honey-400 text-neutral-950' : 'bg-neutral-900 text-neutral-50 border border-neutral-700'
        )}>
          {hiveCount}
        </span>
      )}
    </div>
  );
}
```

### 4.3 Yeni Üs Sihirbazı (Create Apiary Wizard)

```tsx
// components/apiary/CreateApiaryWizard.tsx
const STEPS = [
  { id: 'basic', title: 'Temel Bilgiler', icon: Edit },
  { id: 'location', title: 'Konum', icon: MapPin },
  { id: 'microclimate', title: 'Mikroiklim', icon: CloudSun },
];

export function CreateApiaryWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Partial<ApiaryFormData>>({});

  const stepsConfig = [
    {
      id: 'basic',
      title: 'Temel Bilgiler',
      fields: (
        <div className="space-y-4">
          <FormField label="Üs Adı *" required>
            <Input
              placeholder="Örn: Eğil Yaylası, Karacadağ Güneyi"
              value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v })}
              autoFocus
            />
          </FormField>
          <FormField label="Açıklama">
            <Textarea
              placeholder="Notlar, erişim bilgileri, özel durumlar..."
              value={formData.description}
              onChange={(v) => setFormData({ ...formData, description: v })}
              rows={3}
            />
          </FormField>
        </div>
      ),
    },
    {
      id: 'location',
      title: 'Konum (Harita)',
      fields: (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">Haritada pin'i sürükleyin veya konumunuzu kullanın.</p>
          <MapPicker
            initialPosition={formData.location}
            onSelect={(loc) => setFormData({ ...formData, location: loc })}
            height={300}
          />
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Yükseklik (m)" hint="Otomatik doldurulur">
              <Input type="number" value={formData.elevation} onChange={(v) => setFormData({ ...formData, elevation: Number(v) })} readOnly />
            </FormField>
            <FormField label="Adres" hint="Reverse geocode">
              <Input value={formData.address} onChange={(v) => setFormData({ ...formData, address: v })} readOnly />
            </FormField>
          </div>
        </div>
      ),
    },
    {
      id: 'microclimate',
      title: 'Mikroiklim (Opsiyonel)',
      fields: (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">Bu bilgiler flora/hava analizi ve taşıma planlaması için kullanılır.</p>
          <FormField label="Yön (Aspect)">
            <Select value={formData.aspect} onChange={(v) => setFormData({ ...formData, aspect: v })}>
              <SelectItem value="N">Kuzey</SelectItem>
              <SelectItem value="NE">Kuzey-Doğu</SelectItem>
              <SelectItem value="E">Doğu</SelectItem>
              <SelectItem value="SE">Güney-Doğu</SelectItem>
              <SelectItem value="S">Güney</SelectItem>
              <SelectItem value="SW">Güney-Batı</SelectItem>
              <SelectItem value="W">Batı</SelectItem>
              <SelectItem value="NW">Kuzey-Batı</SelectItem>
            </Select>
          </FormField>
          <FormField label="Eğim (%)">
            <Input type="number" min={0} max={90} value={formData.slope} onChange={(v) => setFormData({ ...formData, slope: Number(v) })} />
          </FormField>
          <FormField label="Rüzgar Maruziyeti">
            <Select value={formData.windExposure} onChange={(v) => setFormData({ ...formData, windExposure: v })}>
              <SelectItem value="low">Düşük (Korunaklı)</SelectItem>
              <SelectItem value="medium">Orta</SelectItem>
              <SelectItem value="high">Yüksek (Açık)</SelectItem>
            </Select>
          </FormField>
          <FormField label="Su Kaynağı Mesafesi (m)">
            <Input type="number" min={0} value={formData.waterDistance} onChange={(v) => setFormData({ ...formData, waterDistance: Number(v) })} />
          </FormField>
          <FormField label="Gölge Oranı (%)">
            <Input type="number" min={0} max={100} value={formData.shadeRatio} onChange={(v) => setFormData({ ...formData, shadeRatio: Number(v) })} />
          </FormField>
        </div>
      ),
    },
  ];

  const currentStep = stepsConfig[step];

  return (
    <Modal isOpen={true} onClose={onCancel} size="lg" title="Yeni Arı Üssü Oluştur">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  i < step ? 'bg-honey-400 text-neutral-950' :
                  i === step ? 'bg-honey-400/20 text-honey-400 border border-honey-400' :
                  'bg-neutral-800 text-neutral-500'
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={cn('w-12 h-0.5', i < step ? 'bg-honey-400' : 'bg-neutral-700')} />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="animate-in fade-in slide-in-from-right-2 duration-200">
          <h3 className="text-lg font-semibold text-neutral-50 mb-4">{currentStep.title}</h3>
          {currentStep.fields}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-neutral-800">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Geri
          </Button>
          <div className="flex gap-2">
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                İleri
              </Button>
            ) : (
              <Button variant="primary" onClick={() => onComplete(formData)} rightIcon={<Check className="w-4 h-4" />}>
                Oluştur
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
```

### 4.4 Kovan Taşıma Planlayıcı (Move Hives Wizard)

```tsx
// components/apiary/MoveHivesWizard.tsx
export function MoveHivesWizard({ sourceApiaryId, onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<MovePlan>({
    targetApiaryId: '',
    hiveIds: [],
    transportDate: '',
    transportTime: 'night',
    notes: '',
  });

  // Adım 1: Hedef Üs Seç
  // Adım 2: Kovanları Seç (checkbox list, filtre: güçlü/hepsi)
  // Adım 3: Tarih/Saat + Rota (Harita) + Kontrol Listesi
  // Adım 4: Özet + Kaydet

  // Rota hesaplama: OSRM / Mapbox Directions API
  // Mesafe, süre, yakıt tahmini
  // Gece taşıma önerisi (arıların uçuşmaması için)
}
```

---

## 5. Apiary Detay Sayfası (/apiaries/:id)

```
ApiaryDetailPage
├── StickyHeader
│   ├── Back, Name, Status Badge, 3-dot Menu
│   └── Actions: [Kovan Ekle] [Taşıma Planla] [Rapor]
│
├── SummaryRow (Scrollable chips)
│   ├── Toplam Kovan: 24
│   ├── Ort. Güç: [●●●○○] Orta
│   ├── Bu Sezon Hasat: 680 kg
│   ├── Aktif Uyarı: 3
│   └── Son Muayene: 2 gün önce
│
├── Tabs: [Kovanlar] [Harita] [Analitik] [Ayarlar]
│
├── KOVANLAR SEKMESİ
│   ├── ViewToggle: [Grid] [Liste]
│   ├── Search/Filter: İsim, Durum, İrk, Güç
│   └── HiveCard[] (Grid: 2 kolon mobil, 3 tablet, 4 desktop)
│
├── HARİTA SEKMESİ
│   ├── Üs konumu (büyük pin)
│   ├── Kovan konumları (küçük pin, varsa GPS/NFC)
│   ├── Su kaynakları, gölge alanları (overlay)
│   └── Layer toggle: [Uydu] [Topo] [Yollar]
│
├── ANALİTİK SEKMESİ
│   ├── KPI Cards: Verim/Kovan, Maliyet, Kar
│   ├── Charts: Aylık Hasat, Güç Dağılımı, Varroa Trendi
│   └── Tablo: Kovan Bazlı Performans
│
└── AYARLAR SEKMESİ
    ├── Temel: İsim, Açıklama, Varsayılan mı?
    ├── Varsayılanlar: Kutu Tipi, Çerçeve Sayısı, İrk Tercihi
    ├── Mikroiklim: Yön, Eğim, Rüzgar, Su, Gölge
    ├── Bölge: Flora takvimi kaynağı, Hava istasyonu
    └── Tehlikeli Bölge: Sil / Arşivle (Modal onay)
```

---

## 6. Veri Modeli (IndexedDB + Supabase Sync)

```typescript
// types/apiary.ts
interface Apiary {
  id: string; // UUIDv7
  userId: string;
  name: string;
  description?: string;
  location: GeoPoint; // { lat, lng }
  address?: string;
  elevation?: number; // metres
  microclimate?: MicroclimateData;
  regionId: string; // Bölge ID (flora/hava için)
  isDefault: boolean;
  status: 'active' | 'archived';
  createdAt: string; // ISO
  updatedAt: string;
  deletedAt?: string;
  // Computed (local)
  hiveCount?: number;
  lastActivity?: string;
  alertsCount?: number;
}

interface MicroclimateData {
  aspect?: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  slope?: number; // 0-90
  windExposure?: 'low' | 'medium' | 'high';
  waterDistance?: number; // metres
  shadeRatio?: number; // 0-100
}

interface GeoPoint {
  lat: number;
  lng: number;
}
```

### Sync Queue Operations

| İşlem | Payload | Conflict Strategy |
|-------|---------|-------------------|
| `create` | Apiary (localId) | Server wins ID mapping |
| `update` | Partial<Apiary> + localId | Last-write-wins (timestamp) |
| `delete` | { id, deletedAt } | Soft delete merge |
| `move_hives` | { sourceApiaryId, targetApiaryId, hiveIds[] } | Hive-level conflict check |

---

## 7. Performans ve Optimizasyon

| Alan | Strateji |
|------|----------|
| **Harita Yükleme** | Lazy load Leaflet/MapLibre; tile cache (Service Worker) |
| **Marker Clustering** | `leaflet.markercluster` / MapLibre Supercluster |
| **Liste Virtualization** | `@tanstack/react-virtual` (100+ üs) |
| **Resim Optimizasyonu** | Üs fotoğrafları WebP, max 800px, blur placeholder |
| **Veri Önbelleği** | SWR/TanStack Query: stale-while-revalidate 5dk |
| **Offline First** | Tüm CRUD IndexedDB → background sync |

---

## 8. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Harita Klavye** | Tab ile pin'ler arası gezinme, Enter/Space ile bottom sheet açma |
| **Pin Etiketleri** | `aria-label="Eğil Yaylası, 24 kovan, 3 uyarı"` |
| **Renk Körlüğü** | Pin'ler şekil+renk kombinasyonu (aktif= yıldız şeklinde + altın) |
| **Odak Sırası** | Header → View Toggle → Liste/Harita → Kartlar/Markerlar → Footer |
| **Ekran Okuyucu** | "Liste görünümü, 12 üs. İlk üs: Eğil Yaylası, 24 kovan, 3 uyarı" |

---

## 9. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Yeni üs oluştur (tüm adımlar) | IndexedDB'ye yazılır, sync kuyruğu, toast "Oluşturuldu" |
| Üs oluştur offline | Lokal kaydedilir, online olunca push, server ID ile merge |
| Haritada pin sürükle | Koordinatlar güncellenir, reverse geocode adres/elevation doldurur |
| Üs sil (kovar varsa) | Modal: "Kovanlar ne olacak? [Taşı] [Arşivle] [Sil]" |
| Taşıma planı oluştur | Rota hesaplanır, kontrol listesi, PDF export |
| 2 cihazda aynı üs güncellendi | Timestamp bazlı merge, conflict UI |
| Bölge değiştirildi | Flora takvimi ve hava kaynağı otomatik güncellenir |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Drone/UAV Entegrasyonu** | Üs haritalama, flora analizi, kovan sayımı |
| **Toprak/İklim Verisi** | NASA POWER, ECMWF entegrasyonu (mikroiklim modelleme) |
| **Kooperatif Paylaşımı** | Üssü kooperatifle paylaş (salt okunur / düzenleme) |
| **Çoklu Dil Harita** | MapLibre GL + i18n etiketler |
| **AR Görünüm** | Telefon kamerasıyla üs üstünde kovan pozisyonları |
| **Otomatik Taşıma Önerisi** | "Eğil'de geven bitiyor, Karacadağ'a taşıma önerisi" |