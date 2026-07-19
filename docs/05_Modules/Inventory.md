# BeeMaster AI — Inventory (Envanter) Modülü v1.0

> **Amaç:** Arıcılık malzemeleri, ilaçlar, besinler, koruyucu ekipmanlar, hasat ekipmanları, ambalaj malzemelerinin stok takibi. Minimum stok uyarıları, barkod/QR okuma, maliyet analizi, tedarikçi yönetimi.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/inventory` (Liste), `/inventory/new` (Ekle), `/inventory/:id` (Detay/Hareketler) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (inventory_items, inventory_movements), Supabase Sync |
| **Offline** | %100 |
| **Performans** | Liste < 500ms, Barkod tarama < 1s |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| IV-01 | Envanter listesini kategorilere göre görmek, arama/filtre yapmak | P0 |
| IV-02 | Yeni öğe eklerken: İsim, kategori, birim, min/max stok, maliyet, tedarikçi, barkod | P0 |
| IV-03 | Stok hareketi girmek: Giriş (Alım) / Çıkış (Kullanım), miktar, maliyet, ilgili kovan/işlem | P0 |
| IV-04 | Minimum stok altına düştüğünde anında uyarı almak (Push + In-app) | P0 |
| IV-05 | Barkod/QR kamerayla tarayıp hızlı giriş/çıkış yapmak | P1 |
| IV-06 | Envanter maliyet analizi: Toplam değer, aylık gider, kovan başına maliyet | P1 |
| IV-07 | Tedarikçi yönetimi: İletişim, ödeme şartları, favori ürünler | P1 |
| IV-08 | Son kullanma tarihi takibi (İlaç, besin, perga) | P1 |

---

## 3. UI Yapısı

### 3.1 Envanter Listesi (/inventory)

```
InventoryPage
├── Header: "Envanter" + [Kategori Tabs] + [Arama] + [Filtre] + [+ Yeni] + [Barkod Tara]
├── Kategori Tabs (Scrollable)
│   [Tümü] [Ekipman] [İlaç] [Besin] [Koruyucu] [Hasat] [Ambalaj] [Diğer]
├── Filtre Bar (Collapsible)
│   Stok: [Normal] [Düşük] [Bitti] | Tedarikçi: [Tümü ▼] | Min-Max Maliyet
├── Liste (Virtualized Cards)
│   └── InventoryCard[]
│       ├── İkon + İsim
│       ├── Kategori + Birim
│       ├── Stok: Mevcut / Min (Renkli: 🟢/🟡/🔴)
│       ├── Birim Maliyet + Toplam Değer
│       ├── Tedarikçi (İlk harf avatar)
│       ├── Son Kullanma (Varsa - Renkli)
│       └── Aksiyonlar: [Düzenle] [Hareket Ekle] [Detay] [Sil]
├── Empty State: "Envanter boş" → [İlk Öğeyi Ekle]
└── Floating Summary (Bottom)
    Toplam Değer: 45,000 TL | Düşük Stok: 3 | Biten: 1
```

### 3.2 Envanter Öğesi Detayı (/inventory/:id)

```
InventoryDetailPage
├── StickyHeader: İsim, Kategori Badge, 3-nokta Menü
├── SummaryChips
│   ├── Mevcut Stok: [15] / Min: [5] [🟢 Normal]
│   ├── Birim: kg
│   ├── Birim Maliyet: 25 TL/kg
│   ├── Toplam Değer: 375 TL
│   ├── Tedarikçi: Apimed
│   └── Son Kullanma: 15 Ara 2025 [🟢 6 ay]
├── Tabs: [Hareketler] [Analitik] [Tedarikçi] [Notlar]
│
├── HAREKETLER SEKMESİ
│   ├── Filtre: [Tümü] [Giriş] [Çıkış] | Tarih Aralığı
│   ├── Tablo: Tarih | Tür | Miktar | Birim Maliyet | Toplam | İlgili Kovan/İşlem | Not
│   │ 15 Tem | Giriş | 20 kg | 25 TL | 500 TL | Tedarik: Apimed | Fatura #123
│   │ 20 Tem | Çıkış | 5 kg | 25 TL | 125 TL | Kovan-12 | Varroa tedavisi
│   ├── Toplam Giriş: 50 kg | Toplam Çıkış: 35 kg | Net: +15 kg
│   └── [CSV Export] [PDF Raporu]
│
├── ANALİTİK SEKMESİ
│   ├── Stok Trendi (Çizgi grafiği - 12 ay)
│   ├── Aylık Giriş/Çıkış (Yığın çubuk)
│   ├── Maliyet Trendi
│   └── Kovan Bazlı Tüketim (En çok tüketen kovanlar)
│
├── TEDARİKÇİ SEKMESİ
│   ├── Tedarikçi Kartı: İsim, Telefon, Email, Adres, Ödeme Şartları
│   ├── Bu Tedarikçiden Alınanlar Listesi
│   └── [Yeni Sipariş Oluştur] → Sipariş modülüne (v1.5+)
│
└── NOTLAR SEKMESİ
    └── Serbest metin
```

### 3.3 Yeni Envanter Öğesi (/inventory/new)

```
InventoryFormModal
├── Temel Bilgiler
│   ├── İsim: [Okzalik Asidi Dihidrat] *
│   ├── Kategori: [İlaç ▼] *
│   │   [Ekipman] [İlaç] [Besin] [Koruyucu] [Hasat] [Ambalaj] [Diğer]
│   ├── Birim: [Adet ▼] *
│   │   [Adet] [kg] [Litre] [Metre] [Kutu] [Paket] [M2]
│   ├── Barkod: [📷 Tara] [8691234567890]
│   └── Açıklama: [Buhar makinesi için okzalik asidi...]
├── Stok Yönetimi
│   ├── Mevcut Stok: [10] *
│   ├── Minimum Stok: [3] * ← Uyarı eşiği
│   ├── Maksimum Stok: [50] (Opsiyonel - Kapasite)
│   └── Depo Konumu: [Ana Depo / Araç / Eğil Üssü]
├── Maliyet ve Tedarik
│   ├── Birim Maliyet: [15] TL *
│   ├── Tedarikçi: [Apimed ▼] [+ Yeni Tedarikçi]
│   ├── Son Alım Fiyatı: [15] TL (Otomatik)
│   └── Para Birimi: [TL ▼]
├── Tarihler (İlaç/Besin/Perga için)
│   ├── Son Kullanma: [2025-12-15] 📅
│   ├── Üretim Tarihi: [2024-01-10] 📅
│   └── Lot/Seri No: [LOT-2024-001]
├── Uyarılar
│   ☑ Stok minimum altına düştüğünde bildir
│   ☑ Son kullanma tarihi yaklaştığında bildir (30 gün öncesi)
│   ☑ Maksimum stok aşıldığında bildir
└── [İptal] [Kaydet]
```

### 3.4 Stok Hareketi Girişi (Inventory Movement)

```
[InventoryCard] → Swipe [Hareket] veya Detaydan [+ Hareket]

MovementEntryModal
├── Tür: [Giriş (Alım) ▼] [Çıkış (Kullanım)]
├── Miktar: [5] *
├── Birim Maliyet: [15] TL (Girişse düzenlenebilir, çıkışta son maliyet)
├── İlgili Kovan/Üss: [Kovan-12 ▼] (Opsiyonel)
├── İlgili İşlem: 
│   [Tedavi ▼] [Besleme] [Hasat] [Bakım] [Kurulum] [Diğer]
├── Tedarikçi (Girişse): [Apimed ▼]
├── Fatura/İrsaliye No: [FTR-2024-00123]
├── Tarih: [Bugün ▼] *
├── Not: [Varroa tedavisi için okzalik asidi]
└── [İptal] [Kaydet]
```

---

## 4. Bileşen Detayları

### 4.1 InventoryCard

```tsx
// components/inventory/InventoryCard.tsx
export function InventoryCard({ item, onEdit, onMovement, onClick, onDelete }: InventoryCardProps) {
  const stockStatus = item.current_stock <= 0 ? 'empty' : 
                      item.current_stock <= item.min_stock ? 'low' : 'normal';
  
  const statusConfig = {
    normal: { color: 'text-success', bg: 'bg-success-bg', label: 'Normal' },
    low: { color: 'text-warning', bg: 'bg-warning-bg', label: 'Düşük' },
    empty: { color: 'text-error', bg: 'bg-error-bg', label: 'Bitti' },
  }[stockStatus];

  const expiryStatus = item.expiry_date ? getExpiryStatus(item.expiry_date) : null;

  return (
    <Card variant="bordered" padding="md" className="flex flex-col gap-3" onClick={onClick}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', CATEGORY_COLORS[item.category])}>
            <CATEGORY_ICONS[item.category] className="w-6 h-6 text-neutral-50" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-neutral-50 truncate">{item.name}</h3>
            <p className="text-xs text-neutral-400 flex items-center gap-1">
              <Tag className="w-3 h-3" /> {CATEGORY_LABELS[item.category]} • {item.unit}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><MoreHorizontal className="w-5 h-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Düzenle</DropdownMenuItem>
              <DropdownMenuItem onClick={onMovement}><Package className="w-4 h-4 mr-2" /> Hareket Ekle</DropdownMenuItem>
              <DropdownMenuItem onClick={onClick}><Eye className="w-4 h-4 mr-2" /> Detay</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-error" onClick={onDelete}><Trash2 className="w-4 h-4 mr-2" /> Sil</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stok Durumu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('font-mono text-lg', statusConfig.color)}>{item.current_stock}</span>
          <span className="text-neutral-400">/</span>
          <span className="text-neutral-500 font-mono">{item.min_stock}</span>
          <Badge variant={stockStatus === 'normal' ? 'success' : stockStatus === 'low' ? 'warning' : 'error'} className="text-[10px]">
            {statusConfig.label}
          </Badge>
        </div>
        
        {expiryStatus && (
          <Badge variant={expiryStatus.color} className="text-[10px]">
            {expiryStatus.label} {format(new Date(item.expiry_date!), 'dd MMM', { locale: tr })}
          </Badge>
        )}
      </div>

      {/* Maliyet */}
      <div className="flex items-center justify-between text-sm text-neutral-400 border-t border-neutral-800 pt-3">
        <span>Birim: <span className="text-neutral-50 font-mono">{item.unit_cost_try} TL/{item.unit}</span></span>
        <span className="font-medium text-honey-400">Toplam: {(item.current_stock * item.unit_cost_try).toLocaleString('tr-TR')} TL</span>
      </div>

      {/* Tedarikçi */}
      {item.supplier && (
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <Building className="w-3.5 h-3.5" />
          <span className="truncate">{item.supplier}</span>
        </div>
      )}
    </Card>
  );
}

const CATEGORY_LABELS = {
  equipment: 'Ekipman',
  medication: 'İlaç',
  feed: 'Besin',
  protective: 'Koruyucu',
  extraction: 'Hasat',
  packaging: 'Ambalaj',
  other: 'Diğer',
};

const CATEGORY_COLORS = {
  equipment: 'bg-blue-500/20',
  medication: 'bg-red-500/20',
  feed: 'bg-green-500/20',
  protective: 'bg-orange-500/20',
  extraction: 'bg-honey-400/20',
  packaging: 'bg-purple-500/20',
  other: 'bg-neutral-500/20',
};
```

### 4.2 StockStatusIndicator (Stok Durumu Göstergesi)

```tsx
// components/inventory/StockStatusIndicator.tsx
export function StockStatusIndicator({ 
  current, 
  min, 
  max, 
  unit,
  compact 
}: StockStatusIndicatorProps) {
  const pct = max ? Math.min(100, (current / max) * 100) : 100;
  const isLow = current <= min;
  const isEmpty = current <= 0;
  
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', 
            isEmpty ? 'bg-error' : isLow ? 'bg-warning' : 'bg-success'
          )} style={{ width: `${pct}%` }} />
        </div>
        <span className={cn('text-xs font-mono', isEmpty ? 'text-error' : isLow ? 'text-warning' : 'text-success')}>
          {current}/{min} {unit}
        </span>
      </div>
    );
  }

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-neutral-50">Stok Durumu</h4>
        <Badge variant={isEmpty ? 'error' : isLow ? 'warning' : 'success'}>
          {isEmpty ? 'Bitti' : isLow ? 'Düşük' : 'Normal'}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-neutral-400">Mevcut Stok</span>
            <span className="font-mono text-neutral-50">{current} {unit}</span>
          </div>
          <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
            <div className={cn('h-full rounded-full transition-all',
              isEmpty ? 'bg-error' : isLow ? 'bg-warning' : 'bg-success'
            )} style={{ width: `${pct}%` }} />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-neutral-800/50 rounded-xl">
            <p className="text-xs text-neutral-400">Minimum</p>
            <p className="font-mono text-warning">{min} {unit}</p>
          </div>
          <div className="p-2 bg-neutral-800/50 rounded-xl">
            <p className="text-xs text-neutral-400">Mevcut</p>
            <p className="font-mono text-neutral-50">{current} {unit}</p>
          </div>
          {max && (
            <div className="p-2 bg-neutral-800/50 rounded-xl">
              <p className="text-xs text-neutral-400">Maksimum</p>
              <p className="font-mono text-info">{max} {unit}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
```

### 4.3 Barkod Tarayıcı (Barcode Scanner)

```tsx
// components/inventory/BarcodeScanner.tsx
export function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [scanning, setScanning] = useState(true);
  const [torch, setTorch] = useState(false);

  return (
    <Modal isOpen onClose={onClose} title="Barkod/QR Tara" size="full" showCloseButton>
      <div className="relative h-[60vh] min-h-[400px]">
        <BarcodeScannerView
          onBarcodeRead={handleBarcodeRead}
          torch={torch}
          cameraFacing="back"
          scanInterval={2000}
          paused={!scanning}
        />
        
        {/* Tarama Alanı Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-32 border-2 border-honey-400 rounded-xl relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-honey-400 text-neutral-950 px-2 py-0.5 rounded text-xs font-medium">
              Barkod buraya
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-neutral-900/80 text-neutral-50 px-2 py-0.5 rounded text-xs">
              Kamera pozisyonunu ayarlayın
            </div>
            {/* Köşe İşaretleyiciler */}
            {['tl', 'tr', 'bl', 'br'].map(pos => (
              <div key={pos} className={cn(
                'absolute w-4 h-4 border-2 border-honey-400',
                pos.includes('t') ? 'top-0' : 'bottom-0',
                pos.includes('l') ? 'left-0' : 'right-0'
              )} />
            ))}
          </div>
        </div>

        {/* Kontroller */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
          <Button variant="ghost" size="lg" onClick={() => setTorch(!torch)} className="w-12 h-12 rounded-full">
            {torch ? <FlashlightOff className="w-6 h-6" /> : <Flashlight className="w-6 h-6" />}
          </Button>
          <Button variant="primary" size="lg" onClick={() => setScanning(!scanning)} className="w-12 h-12 rounded-full">
            {scanning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="ghost" size="lg" onClick={onClose} className="w-12 h-12 rounded-full">
            <X className="w-6 h-6" />
          </Button>
        </div>
      </div>
      
      <div className="mt-4 text-center text-sm text-neutral-400">
        <p>Desteklenen: EAN-13, EAN-8, UPC-A, UPC-E, Code-128, Code-39, QR Code, Data Matrix</p>
      </div>
    </Modal>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/inventory.ts
interface InventoryItem {
  id: string; // UUIDv7
  userId: string;
  
  // Temel
  name: string;
  category: 'equipment' | 'medication' | 'feed' | 'protective' | 'extraction' | 'packaging' | 'other';
  description?: string;
  
  // Birim
  unit: 'piece' | 'kg' | 'liter' | 'meter' | 'box' | 'pack' | 'm2' | 'custom';
  custom_unit_name?: string;
  
  // Stok
  current_stock: number;
  min_stock: number;
  max_stock?: number; // Depo kapasitesi
  location?: string; // "Ana Depo", "Araç", "Eğil Üssü"
  
  // Maliyet
  unit_cost_try: number; // Son bilinen maliyet
  avg_cost_try?: number; // Ağırlıklı ortalama maliyet (FIFO/LIFO)
  currency: 'TRY' | 'USD' | 'EUR';
  
  // Tedarik
  supplier?: string;
  supplier_contact?: string; // Telefon/Email
  supplier_payment_terms?: string; // "Peşin", "30 gün", "60 gün"
  last_purchase_date?: string;
  last_purchase_price?: number;
  
  // Barkod
  barcode?: string; // EAN-13, QR, etc.
  barcode_type?: 'ean13' | 'ean8' | 'upca' | 'upce' | 'code128' | 'code39' | 'qr' | 'datamatrix';
  
  // Tarihler (İlaç/Besin/Perga için kritik)
  expiry_date?: string; // ISO date
  manufacture_date?: string;
  lot_number?: string;
  
  // Uyarılar
  notify_low_stock: boolean;
  notify_expiry: boolean;
  notify_max_stock: boolean;
  expiry_warning_days: number; // Default: 30
  
  // Meta
  notes?: string;
  tags?: string[]; // "kış", "acil", "organik"
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface InventoryMovement {
  id: string;
  itemId: string;
  userId: string;
  
  // Hareket
  type: 'in' | 'out'; // Giriş / Çıkış
  quantity: number; // Pozitif
  unit_cost_try: number; // Girişte: alım fiyatı, Çıkışta: ortalama maliyet
  total_cost_try: number; // quantity * unit_cost
  
  // Bağlam
  hiveId?: string;
  apiaryId?: string;
  related_operation?: 'treatment' | 'feeding' | 'harvest' | 'maintenance' | 'setup' | 'sale' | 'transfer' | 'loss' | 'adjustment' | 'other';
  related_operation_id?: string; // Treatment ID, Feeding ID, etc.
  
  // Tedarikçi (Girişse)
  supplier?: string;
  invoice_number?: string;
  
  // Tarih
  date: string; // ISO datetime
  
  // Not
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// Stok Hesaplama (Local)
interface InventoryComputed {
  total_value: number; // current_stock * unit_cost
  days_of_stock: number | null; // Ortalama günlük tüketime göre
  stock_turnover_rate: number; // Yıllık devir hızı
  reorder_point: number; // min_stock + güvenlik stoku
  is_reorder_needed: boolean;
}
```

---

## 6. Stok Değerleme Yöntemleri

| Yöntem | Açıklama | BeeMaster'da Kullanım |
|--------|----------|----------------------|
| **Moving Average (Hareketli Ortalama)** | Her girişte: `(eski_stok * eski_maliyet + yeni_miktar * yeni_maliyet) / yeni_toplam_stok` | **Varsayılan** - Basit, gerçekçi |
| **FIFO (İlk Giren İlk Çıkar)** | En eski maliyetten çıkış yapılır | İlaç/Gıda için opsiyonel |
| **LIFO (Son Giren İlk Çıkar)** | En yeni maliyetten çıkış yapılır | Enflasyon ortamında vergi avantajı |
| **Standard Cost (Standart Maliyet)** | Sabit planlanan maliyet | Bütçe karşılaştırması için |

```typescript
// Moving Average Hesaplama (Girişte)
function updateMovingAverage(item: InventoryItem, movement: InventoryMovement): number {
  if (movement.type === 'in') {
    const totalValue = item.current_stock * item.unit_cost_try + movement.quantity * movement.unit_cost_try;
    const newStock = item.current_stock + movement.quantity;
    return newStock > 0 ? totalValue / newStock : movement.unit_cost_try;
  }
  // Çıkışta maliyet değişmez (ortalama maliyet kullanılır)
  return item.unit_cost_try;
}
```

---

## 7. AI Entegrasyonu (InventoryAgent)

```typescript
// agents/inventoryAgent.ts
interface InventoryRecommendation {
  itemId: string;
  action: 'reorder' | 'reduce' | 'transfer' | 'check_expiry' | 'switch_supplier';
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  suggested_quantity: number;
  estimated_cost: number;
  suggested_supplier?: string;
  due_date: string;
}

export async function analyzeInventory(input: InventoryAgentInput): Promise<InventoryRecommendation[]> {
  const recommendations: InventoryRecommendation[] = [];
  
  for (const item of input.items) {
    // 1. Kritik Stok
    if (item.current_stock <= 0) {
      recommendations.push({
        itemId: item.id,
        action: 'reorder',
        priority: 'critical',
        reasoning: `Stok tamamen bitti: ${item.name}. Acil sipariş gerekli.`,
        suggested_quantity: item.max_stock || item.min_stock * 3,
        estimated_cost: (item.max_stock || item.min_stock * 3) * item.unit_cost_try,
        suggested_supplier: item.supplier,
        due_date: new Date().toISOString().split('T')[0],
      });
    } else if (item.current_stock <= item.min_stock) {
      recommendations.push({
        itemId: item.id,
        action: 'reorder',
        priority: 'high',
        reasoning: `Minimum stok altına düştü: ${item.current_stock}/${item.min_stock} ${item.unit}.`,
        suggested_quantity: (item.max_stock || item.min_stock * 3) - item.current_stock,
        estimated_cost: ((item.max_stock || item.min_stock * 3) - item.current_stock) * item.unit_cost_try,
        suggested_supplier: item.supplier,
        due_date: addDays(new Date(), 3).toISOString().split('T')[0],
      });
    }
    
    // 2. Son Kullanma Tarihi Yaklaşıyor
    if (item.expiry_date) {
      const daysToExpiry = differenceInDays(new Date(item.expiry_date), new Date());
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        recommendations.push({
          itemId: item.id,
          action: 'check_expiry',
          priority: daysToExpiry <= 7 ? 'high' : 'medium',
          reasoning: `${item.name} son kullanma tarihi ${daysToExpiry} gün sonra doluyor (${format(new Date(item.expiry_date), 'dd MMM yyyy', { locale: tr })}).`,
          suggested_quantity: 0,
          estimated_cost: 0,
          due_date: addDays(new Date(), Math.max(1, daysToExpiry - 7)).toISOString().split('T')[0],
        });
      } else if (daysToExpiry <= 0) {
        recommendations.push({
          itemId: item.id,
          action: 'check_expiry',
          priority: 'critical',
          reasoning: `${item.name} SON KULLANMA TARİHİ GEÇMİŞ! (${format(new Date(item.expiry_date), 'dd MMM yyyy', { locale: tr })}) Kullanmayın, güvenli bir şekilde imha edin.`,
          suggested_quantity: 0,
          estimated_cost: item.current_stock * item.unit_cost_try, // Zarar
          due_date: new Date().toISOString().split('T')[0],
        });
      }
    }
    
    // 3. Aşırı Stok (Maksimum aşıldı)
    if (item.max_stock && item.current_stock > item.max_stock) {
      recommendations.push({
        itemId: item.id,
        action: 'transfer',
        priority: 'low',
        reasoning: `Maksimum stok aşıldı: ${item.current_stock}/${item.max_stock} ${item.unit}. Fazlasını başka depoya/üssü transfer edin.`,
        suggested_quantity: item.current_stock - item.max_stock,
        estimated_cost: 0,
        due_date: addDays(new Date(), 14).toISOString().split('T')[0],
      });
    }
    
    // 4. Düşük Devir Hızı (6 ay hareketsiz)
    const lastMovement = input.movements.find(m => m.itemId === item.id);
    if (lastMovement && differenceInDays(new Date(), new Date(lastMovement.date)) > 180) {
      recommendations.push({
        itemId: item.id,
        action: 'reduce',
        priority: 'low',
        reasoning: `${item.name} 6 aydır hareketsiz. Stok azaltılabilir veya satılabilir.`,
        suggested_quantity: Math.floor(item.current_stock * 0.5),
        estimated_cost: 0,
        due_date: addDays(new Date(), 30).toISOString().split('T')[0],
      });
    }
  }
  
  return recommendations.sort((a, b) => PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority]);
}
```

---

## 8. Offline ve Senkronizasyon

| İşlem | Offline | Senkron |
|-------|---------|---------|
| Öğe ekle/düzenle | ✅ | `create_inventory_item` / `update_inventory_item` |
| Hareket girişi | ✅ | `create_inventory_movement` (batch) |
| Barkod tara | ✅ Local DB lookup | Server'da yoksa yeni öğe taslağı |
| Stok uyarısı | Local notification | Push token ile server'dan da |
| Stok değeri | Local hesaplama | Analitik için sync |

---

## 9. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Stok Durumu** | `aria-label="Okzalik Asidi, mevcut stok 10 kg, minimum 3 kg, normal seviye"` |
| **Barkod Tarayıcı** | `aria-label="Barkod tarayıcı, kamerayı barkoda yönlendirin"` + Sesli geri bildirim (beep) |
| **Hareket Formu** | `inputmode="decimal"`, `aria-describedby` birim/maliyet için |
| **Renk Körlüğü** | Stok: İkon (✓/⚠/✗) + Metin + Renk |
| **Ekran Okuyucu** | "Envanterde 3 kritik uyarı: Okzalik asidi stokta yok, Mum perga 7 günde doluyor" |

---

## 10. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Yeni ilaç ekle: Son kullanma 30 gün | "Son kullanma yaklaşıyor" uyarısı (30, 14, 7, 1 gün) |
| Çıkış hareketi: Stok 5 → 2, Min 3 | Warning badge "Düşük", push bildirimi |
| Barkod tara: Sistemde yok | "Bu barkod kayıtlı değil. Yeni öğe oluştur?" modal |
| Giriş hareketi: 20 kg @ 25 TL, eski 10 kg @ 20 TL | Yeni ortalama maliyet: 23.33 TL/kg |
| Maksimum stok 50, mevcut 55 | "Aşırı stok" önerisi: Transfer et |
| Offline hareket girişi → Online | Batch sync, stok değerleri merge |

---

## 11. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Sipariş Yönetimi** | Tedarikçilere sipariş oluşturma, takip, fatura eşleştirme |
| **RFID/NFC Envanter** | Depodaki malzemeler NFC etiketli, telefonla toplu sayım |
| **Otomatik Yeniden Sipariş** | Minimum stok → Favori tedarikçiye otomatik sipariş taslağı |
| **Maliyet Optimizasyonu** | Tedarikçi fiyat karşılaştırması, toplu alım indirimi hesaplama |
| **Ambalaj/Yarı Mamul Takibi** | Kavanoz, etiket, kapak stokları → Hasat planına göre otomatik rezervasyon |
| **Sigorta Değer Raporu** | Depodaki toplam envanter değeri (Sigorta için) |