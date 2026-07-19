# BeeMaster AI — Feeding (Besleme) Modülü v1.0

> **Amaç:** Kovan besleme programlarının planlanması, uygulanması, takibi ve maliyet analizi. Şekerli su (1:1, 2:1), paté/fondant, polen pastası, protein tozu, bal beslemesi. Stok entegrasyonu, mevsimsel takvim, AI destekli besleme önerileri.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/feeding` (Takvim/Liste), `/feeding/new` (Plan/Giriş), `/hives/:id/feeding` (Kovan bazlı) |
| **Erişim** | Tüm kullanıcılar |
| **Veri Kaynağı** | IndexedDB (feedings, inventory), Supabase Sync |
| **Offline** | %100 |
| **Performans** | Takvim < 500ms, Planlama sihirbazı < 1s |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| FD-01 | Besleme takviminde (aylık/haftalık) planlı beslemeleri görmek, bugünkü beslemeleri hızlı girmek | P0 |
| FD-02 | Besleme planı oluşturmak: Neden (Kış/Bahar/Açlık), Ne (Şekerli su/Paté), Ne kadar, Ne sıklıkta, Hang i kovanlar | P0 |
| FD-03 | Besleme uygularken stoktan otomatik düşme, maliyet hesaplama, tüketim takibi | P0 |
| FD-04 | Şekerli su oran hesaplayıcı: Su kg + Şeker kg → Oran (1:1, 2:1) + Toplam litre | P0 |
| FD-05 | Minimum stok altına düştüğünde uyarı (Şeker, paté, protein) | P1 |
| FD-06 | AI besleme önerisi: Kovan gücü + Mevsim + Hava + Flora → Ne zaman, ne, ne kadar | P1 |
| FD-07 | Besleme maliyet analizi: Kovan başına, üs başına, sezonluk toplam | P1 |
| FD-08 | Toplu besleme: "Tüm zayıf kovanlara 2:1 şekerli su 3L" tek seferde | P2 |

---

## 3. UI Yapısı

### 3.1 Besleme Takvimi (/feeding)

```
FeedingCalendarPage
├── Header: "Besleme Takvimi" + [Bugün] + [Bu Ay ▼] + [+ Plan] + [+ Hızlı Giriş]
├── View Toggle: [Ay] [Hafta] [Liste]
├── Monthly Calendar (Default)
│   ├── Header: Ay/Yıl navigasyonu
│   ├── Grid: 6 hafta x 7 gün
│   │   ├── Gün hücresi: Tarih + Nokta göstergeleri (Renkli)
│   │   │   🟢 Yeşil = Planlı besleme
│   │   │   🟡 Sarı = Uygulandı
│   │   │   🔴 Kırmızı = Kaçırıldı/Gecikti
│   │   │   🔵 Mavi = Tekrarlayan
│   │   └── Tıklama → Bottom Sheet: O günün beslemeleri
│   └── Legend
├── Weekly View (Alternatif)
│   └── 7 sütun, her gün: Besleme kartları (Saati, Tür, Miktar, Kovan)
├── List View
│   └── Virtualized: Tarih | Tür | Miktar | Kovanlar | Durum | Maliyet | Aksiyon
└── Bottom Sheet (Gün tıklandığında)
    ├── Planlı Beslemeler (Checkbox: ✓ Uygulandı)
    ├── Geçmiş Beslemeler (Bu kovan/üs)
    └── [+ Yeni Besleme Girişi]
```

### 3.2 Besleme Planı Sihirbazı (/feeding/new → Plan)

```
FeedingPlanWizard
├── ADIM 1: Neden? (Amaç)
│   ┌─────────────────────────────────────┐
│   │ [Kış Hazırlığı] [Bahar Gelişimi]    │
│   │ [Açlık Dönemi] [Ana Arı Yetiştirme] │
│   │ [Uyarıtma/Stimülasyon] [Diğer]      │
│   └─────────────────────────────────────┘
│
├── ADIM 2: Ne? (Besin Türü)
│   ┌─────────────────────────────────────┐
│   │ [Şekerli Su 1:1]  (Bahar/Yaz)       │
│   │ [Şekerli Su 2:1]  (Kış/Kuruma)      │
│   │ [Paté / Fondant]  (Kış/Soğuk)       │
│   │ [Polen Pastası]   (Protein/Eğitim)  │
│   │ [Protein Tozu]    (Karma besin)     │
│   │ [Bal]             (Acil/Doğal)      │
│   └─────────────────────────────────────┘
│
├── ADIM 3: Miktar ve Yöntem
│   ┌─────────────────────────────────────┐
│   │ Kovan Başına Miktar: [2] [Litre/kg] │
│   │ Yöntem: [Üst Besleyici ▼]           │
│   │         [Çerçeve Besleyici]         │
│   │         [Giriş Besleyici]           │
│   │         [Damlatma/Dribble]          │
│   └─────────────────────────────────────┘
│
├── ADIM 4: Zamanlama
│   ┌─────────────────────────────────────┐
│   │ Başlangıç: [15 Ekim] 📅             │
│   │ Bitiş: [30 Kasım] 📅                │
│   │ Sıklık: [Günde 1 ▼]                 │
│   │         [2 günde 1] [Haftada 1]     │
│   │         [Özel: ____]                │
│   │ Saat: [Akşam 18:00 ▼] (Opsiyonel)   │
│   └─────────────────────────────────────┘
│
├── ADIM 5: Kovan Seçimi
│   ┌─────────────────────────────────────┐
│   │ [Tüm Kovanlar] [Aktif Kovanlar]     │
│   │ [Zayıf Kovanlar (Güç<Orta)]         │
│   │ [Seçili Kovanlar ▼] (Checkbox list) │
│   │                                     │
│   │ Seçili: 12 kovan × 2L = 24L/toplam  │
│   └─────────────────────────────────────┘
│
├── ADIM 6: Maliyet ve Stok
│   ┌─────────────────────────────────────┐
│   │ Birim Maliyet: [25] TL/kg           │
│   │ Toplam Maliyet: [600] TL (Otomatik) │
│   │                                     │
│   │ STOK KONTROLÜ:                      │
│   │ ✓ Şeker: 50 kg (Gereken: 24 kg)     │
│   │ ⚠ Paté: 2 kg (Gereken: 5 kg) — DÜŞÜK│
│   │                                     │
│   │ [Stok Azaldığında Uyar] [Sipariş Ver]│
│   └─────────────────────────────────────┘
│
└── [PLANI KAYDET] → Takvime eklenir, hatırlatıcı oluşturulur
```

### 3.3 Hızlı Besleme Girişi (Günlük Uygulama)

```
[Feeding Calendar] → Bugün kartı → [Uygula] → BOTTOM SHEET

┌─────────────────────────────────────┐
│ BEŞLEME UYGULA — Kovan-12           │
├─────────────────────────────────────┤
│ Plan: Şekerli Su 2:1, 2 Litre       │
│ Yöntem: Üst Besleyici               │
│                                     │
│ Gerçekleşen:                        │
│ Miktar: [2.0] Litre 📝              │
│ Tüketilen: [1.8] Litre (Yarın kontrol)│
│ Maliyet: [50] TL (Otomatik)         │
│                                     │
│ Not: [Hızla tüketti, yarın tekrar]  │
│                                     │
│ [İptal]                    [Kaydet] │
└─────────────────────────────────────┘
```

### 3.4 Şekerli Su Hesaplayıcı (Yardımcı Araç)

```
[Feeding] → [Hesaplayıcı] (Header action) → MODAL

┌─────────────────────────────────────┐
│ ŞEKERLİ SU HESAPLAYICI              │
├─────────────────────────────────────┤
│                                     │
│ Hedef Oran: [2:1 ▼] (1:1, 2:1, 3:2, Özel)│
│                                     │
│ YÖNTEM 1: Şekerdan Suyu Hesapla     │
│ Şeker: [10] kg                      │
│ → Su: [5.0] Litre (1:1)             │
│ → Su: [10.0] Litre (2:1)            │
│ → Toplam: [15.0] Litre (2:1)        │
│                                     │
│ YÖNTEM 2: Toplam Hacimden Hesapla   │
│ Toplam: [20] Litre                  │
│ Oran: [2:1]                         │
│ → Şeker: [13.3] kg                  │
│ → Su: [6.7] Litre                   │
│                                     │
│ YÖNTEM 3: Suyu Ver, Şekeri Hesapla  │
│ Su: [10] Litre                      │
│ Oran: [2:1]                         │
│ → Şeker: [20] kg                    │
│                                     │
│ [Kopyala] [Plan Oluştur] [Kapat]    │
└─────────────────────────────────────┘
```

---

## 4. Bileşen Detayları

### 4.1 FeedingCalendar (Aylık Görünüm)

```tsx
// components/feeding/FeedingCalendar.tsx
export function FeedingCalendar({ 
  feedings, 
  plans, 
  onDayClick, 
  onPlanClick,
  currentMonth 
}: FeedingCalendarProps) {
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfWeek = getDayOfWeek(currentMonth, 1); // 0=Pazar, 1=Pazartesi
  
  // Beslemeleri güne göre grupla
  const feedingsByDay = useMemo(() => 
    groupBy(feedings, f => new Date(f.fed_at).getDate()), 
  [feedings]);
  
  const plansByDay = useMemo(() => 
    groupBy(plans, p => {
      const dates = getDatesInRange(p.start_date, p.end_date, p.frequency);
      return dates.map(d => d.getDate());
    }).flat(),
  [plans]);

  return (
    <Card variant="bordered" padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth(-1)} className="p-2 rounded-lg hover:bg-neutral-800">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-semibold text-neutral-50">
          {format(currentMonth, 'MMMM yyyy', { locale: tr })}
        </h3>
        <button onClick={() => navigateMonth(1)} className="p-2 rounded-lg hover:bg-neutral-800">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Hafta Başlıkları */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
          <div key={d} className="text-center text-xs text-neutral-500 py-1 font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Günler Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Boş hücreler (Ayın başı) */}
        {Array.from({ length: firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1 }).map((_, i) => (
          <div key={i} className="aspect-square" />
        ))}
        
        {/* Günler */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayFeedings = feedingsByDay[day] || [];
          const dayPlans = plansByDay[day] || [];
          const isToday = isTodayDate(currentMonth, day);
          
          const dots = [
            ...dayPlans.map(p => ({ color: 'green', type: 'plan' })),
            ...dayFeedings.filter(f => f.status === 'completed').map(f => ({ color: 'yellow', type: 'done' })),
            ...dayFeedings.filter(f => f.status === 'missed').map(f => ({ color: 'red', type: 'missed' })),
          ].slice(0, 4);

          return (
            <button
              key={day}
              onClick={() => onDayClick(day, dayFeedings, dayPlans)}
              className={cn(
                'relative aspect-square rounded-xl border flex flex-col items-center justify-start p-1.5',
                'transition-colors hover:bg-neutral-800/50',
                isToday ? 'border-honey-400 bg-honey-400/10 ring-1 ring-honey-400/20' : 'border-neutral-700',
                dayFeedings.some(f => f.status === 'missed') && 'border-error/30'
              )}
            >
              <span className={cn('text-sm font-medium', isToday ? 'text-honey-400' : 'text-neutral-50')}>
                {day}
              </span>
              
              {/* Nokta Göstergeleri */}
              {dots.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dots.map((dot, i) => (
                    <span 
                      key={i} 
                      className={cn('w-1.5 h-1.5 rounded-full', dotColor[dot.color])}
                      title={dot.type === 'plan' ? 'Planlı' : dot.type === 'done' ? 'Uygulandı' : 'Kaçırıldı'}
                    />
                  ))}
                </div>
              )}
              
              {/* Besleme Sayısı Badge */}
              {(dayFeedings.length + dayPlans.length) > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-5 px-1.5 bg-neutral-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {dayFeedings.length + dayPlans.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-neutral-800 text-xs text-neutral-400">
        <LegendDot color="green" label="Planlı" />
        <LegendDot color="yellow" label="Uygulandı" />
        <LegendDot color="red" label="Kaçırıldı" />
        <LegendDot color="blue" label="Tekrarlayan" />
      </div>
    </Card>
  );
}
```

### 4.2 FeedingPlanForm (Sihirbaz Adımları)

```tsx
// components/feeding/FeedingPlanForm.tsx
const PLAN_STEPS = [
  { id: 'purpose', title: 'Amaç', icon: Target },
  { id: 'feed_type', title: 'Besin Türü', icon: Utensils },
  { id: 'amount', title: 'Miktar/Yöntem', icon: Scale },
  { id: 'schedule', title: 'Zamanlama', icon: Calendar },
  { id: 'hives', title: 'Kovanlar', icon: Home },
  { id: 'cost', title: 'Maliyet/Stok', icon: Calculator },
];

export function FeedingPlanForm({ onComplete, onCancel, initialData }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FeedingPlanFormData>({
    purpose: '',
    feed_type: 'sugar_syrup_2_1',
    amount_per_hive: 2,
    unit: 'liter',
    method: 'top_feeder',
    frequency: 'daily',
    start_date: new Date().toISOString().split('T')[0],
    end_date: addDays(new Date(), 14).toISOString().split('T')[0],
    time: '18:00',
    hive_selection: 'weak',
    selected_hive_ids: [],
    cost_per_unit: 25,
    notify_low_stock: true,
  });

  const currentStep = PLAN_STEPS[step];

  return (
    <Modal isOpen onClose={onCancel} title="Yeni Besleme Planı" size="lg">
      <div className="space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between">
          {PLAN_STEPS.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  i < step ? 'bg-honey-400 text-neutral-950' :
                  i === step ? 'bg-honey-400/20 text-honey-400 border border-honey-400' :
                  'bg-neutral-800 text-neutral-500'
                )}>
                  {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                {i < PLAN_STEPS.length - 1 && (
                  <div className={cn('w-12 h-0.5', i < step ? 'bg-honey-400' : 'bg-neutral-700')} />
                )}
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={step} 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderStepContent(currentStep.id, form, setForm)}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-neutral-800">
          <Button variant="ghost" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
            <ChevronLeft className="w-4 h-4 mr-2" /> Geri
          </Button>
          <div className="flex gap-2">
            {step < PLAN_STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} rightIcon={<ChevronRight className="w-4 h-4" />}>
                İleri
              </Button>
            ) : (
              <Button variant="primary" onClick={() => onComplete(form)} rightIcon={<Check className="w-4 h-4" />}>
                Planı Kaydet
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function renderStepContent(stepId: string, form: FeedingPlanFormData, setForm: any) {
  switch (stepId) {
    case 'purpose':
      return (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">Bu besleme planının amacı ne?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FEEDING_PURPOSES.map(p => (
              <button
                key={p.value}
                onClick={() => setForm({...form, purpose: p.value})}
                className={cn(
                  'p-4 rounded-xl border-2 text-center transition-all',
                  form.purpose === p.value 
                    ? 'border-honey-400 bg-honey-400/10 text-honey-400' 
                    : 'border-neutral-700 hover:border-honey-400'
                )}
              >
                <p.icon className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      );
      
    case 'feed_type':
      return (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">Hangi besin türünü kullanacaksınız?</p>
          <div className="space-y-2">
            {FEED_TYPES.map(f => (
              <button
                key={f.value}
                onClick={() => setForm({...form, feed_type: f.value})}
                className={cn(
                  'w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left transition-all',
                  form.feed_type === f.value 
                    ? 'border-honey-400 bg-honey-400/10' 
                    : 'border-neutral-700 hover:border-honey-400'
                )}
              >
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center">
                  <f.icon className="w-6 h-6 text-honey-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-50">{f.label}</p>
                  <p className="text-xs text-neutral-400">{f.description}</p>
                  <p className="text-xs text-neutral-500 mt-1">En iyi: {f.best_season.join(', ')}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      );

    case 'amount':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Kovan Başına Miktar">
              <div className="flex gap-2">
                <Input type="number" step="0.1" min={0.1} max={20} value={form.amount_per_hive} onChange={v => setForm({...form, amount_per_hive: parseFloat(v)})} className="flex-1" />
                <Select value={form.unit} onChange={v => setForm({...form, unit: v})} className="w-24">
                  <SelectItem value="liter">Litre</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                </Select>
              </div>
            </FormField>
            <FormField label="Yöntem">
              <Select value={form.method} onChange={v => setForm({...form, method: v})}>
                <SelectItem value="top_feeder">Üst Besleyici</SelectItem>
                <SelectItem value="frame_feeder">Çerçeve Besleyici</SelectItem>
                <SelectItem value="entrance_feeder">Giriş Besleyici</SelectItem>
                <SelectItem value="dribble">Damlatma</SelectItem>
              </Select>
            </FormField>
          </div>
          
          {/* Şekerli su oranı hesaplayıcı (Eğer şekerli su seçildiyse) */}
          {form.feed_type.startsWith('sugar_syrup') && (
            <SugarSyrupCalculator 
              ratio={form.feed_type === 'sugar_syrup_1_1' ? '1:1' : '2:1'}
              amount={form.amount_per_hive}
              onRatioChange={r => setForm({...form, feed_type: `sugar_syrup_${r.replace(':', '_')}`})}
            />
          )}
        </div>
      );

    case 'schedule':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Başlangıç Tarihi">
              <Input type="date" value={form.start_date} onChange={v => setForm({...form, start_date: v})} min={new Date().toISOString().split('T')[0]} />
            </FormField>
            <FormField label="Bitiş Tarihi">
              <Input type="date" value={form.end_date} onChange={v => setForm({...form, end_date: v})} min={form.start_date} />
            </FormField>
          </div>
          <FormField label="Sıklık">
            <Select value={form.frequency} onChange={v => setForm({...form, frequency: v})}>
              <SelectItem value="daily">Günde 1</SelectItem>
              <SelectItem value="every_2_days">2 günde 1</SelectItem>
              <SelectItem value="weekly">Haftada 1</SelectItem>
              <SelectItem value="custom">Özel...</SelectItem>
            </Select>
          </FormField>
          <FormField label="Tercih Edilen Saat (Opsiyonel)">
            <Input type="time" value={form.time} onChange={v => setForm({...form, time: v})} />
          </FormField>
        </div>
      );

    case 'hives':
      return (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">Hangi kovanlar bu plan kapsamında?</p>
          <div className="space-y-2">
            {HIVE_SELECTION_OPTIONS.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all">
                <input type="radio" name="hive_selection" value={opt.value} checked={form.hive_selection === opt.value} onChange={e => setForm({...form, hive_selection: e.target.value, selected_hive_ids: []})} className="w-4 h-4 accent-honey-400" />
                <div className="flex-1">
                  <p className="font-medium text-neutral-50">{opt.label}</p>
                  <p className="text-xs text-neutral-400">{opt.description}</p>
                </div>
              </label>
            ))}
          </div>
          
          {form.hive_selection === 'selected' && (
            <FormField label="Kovanları Seçin">
              <HiveMultiSelect 
                value={form.selected_hive_ids} 
                onChange={v => setForm({...form, selected_hive_ids: v})}
                filterable
              />
            </FormField>
          )}
        </div>
      );

    case 'cost':
      return (
        <div className="space-y-4">
          <FormField label="Birim Maliyet (TL/kg veya TL/L)">
            <Input type="number" step="0.01" min={0} value={form.cost_per_unit} onChange={v => setForm({...form, cost_per_unit: parseFloat(v)})} />
          </FormField>
          
          {/* Stok Kontrolü Önizlemesi */}
          <StoKontrolPreview 
            feedType={form.feed_type} 
            totalAmount={form.amount_per_hive * getHiveCount(form)} 
            unit={form.unit}
          />
          
          <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={form.notify_low_stock} onChange={e => setForm({...form, notify_low_stock: e.target.checked})} className="w-4 h-4 accent-honey-400" />
            <div>
              <p className="font-medium text-neutral-50">Stok minimumun altına düştüğünde bildir</p>
              <p className="text-xs text-neutral-400">Push bildirimi gönderilir</p>
            </div>
          </label>
        </div>
      );
  }
}
```

### 4.3 SugarSyrupCalculator (Şekerli Su Hesaplayıcı)

```tsx
// components/feeding/SugarSyrupCalculator.tsx
export function SugarSyrupCalculator({ ratio, amount, onRatioChange }) {
  const [calcMode, setCalcMode] = useState<'sugar_to_water' | 'total_volume' | 'water_to_sugar'>('sugar_to_water');
  const [sugarKg, setSugarKg] = useState(amount || 10);
  const [waterL, setWaterL] = useState(0);
  const [totalL, setTotalL] = useState(0);
  
  const [ratioSugar, ratioWater] = ratio.split(':').map(Number);
  
  // Otomatik hesaplamalar
  useEffect(() => {
    if (calcMode === 'sugar_to_water') {
      setWaterL(sugarKg / ratioSugar * ratioWater);
      setTotalL(sugarKg + waterL);
    } else if (calcMode === 'total_volume') {
      const sugar = totalL * (ratioSugar / (ratioSugar + ratioWater));
      const water = totalL * (ratioWater / (ratioSugar + ratioWater));
      setSugarKg(sugar);
      setWaterL(water);
    } else if (calcMode === 'water_to_sugar') {
      setSugarKg(waterL / ratioWater * ratioSugar);
      setTotalL(sugarKg + waterL);
    }
  }, [calcMode, sugarKg, waterL, totalL, ratioSugar, ratioWater]);

  return (
    <Card variant="glass" padding="md" className="border-honey-400/20">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-honey-400 flex items-center gap-2">
          <Beaker className="w-4 h-4" />
          Şekerli Su Hesaplayıcı ({ratio})
        </h4>
        <Select value={ratio} onChange={onRatioChange} className="w-20 text-xs">
          <SelectItem value="1:1">1:1 (Bahar)</SelectItem>
          <SelectItem value="2:1">2:1 (Kış)</SelectItem>
          <SelectItem value="3:2">3:2 (Geçiş)</SelectItem>
        </Select>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <button 
          onClick={() => setCalcMode('sugar_to_water')} 
          className={cn('px-3 py-2 rounded-lg text-xs font-medium', calcMode === 'sugar_to_water' ? 'bg-honey-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400')}
        >
          Şekerdan → Su
        </button>
        <button 
          onClick={() => setCalcMode('total_volume')} 
          className={cn('px-3 py-2 rounded-lg text-xs font-medium', calcMode === 'total_volume' ? 'bg-honey-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400')}
        >
          Toplam Hacimden
        </button>
        <button 
          onClick={() => setCalcMode('water_to_sugar')} 
          className={cn('px-3 py-2 rounded-lg text-xs font-medium', calcMode === 'water_to_sugar' ? 'bg-honey-400 text-neutral-950' : 'bg-neutral-800 text-neutral-400')}
        >
          Sudan → Şeker
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <FormField label="Şeker (kg)">
          <Input type="number" step="0.1" min={0} value={sugarKg} onChange={v => setSugarKg(parseFloat(v))} disabled={calcMode !== 'sugar_to_water'} />
        </FormField>
        <FormField label="Su (Litre)">
          <Input type="number" step="0.1" min={0} value={waterL.toFixed(1)} onChange={v => setWaterL(parseFloat(v))} disabled={calcMode !== 'water_to_sugar'} />
        </FormField>
        <FormField label="Toplam (Litre)">
          <Input type="number" step="0.1" min={0} value={totalL.toFixed(1)} onChange={v => setTotalL(parseFloat(v))} disabled={calcMode !== 'total_volume'} />
        </FormField>
      </div>

      <div className="flex gap-2 mt-3">
        <Button variant="outline" size="sm" fullWidth onClick={() => navigator.clipboard.writeText(
          `Şekerli Su (${ratio}): ${sugarKg.toFixed(1)} kg şeker + ${waterL.toFixed(1)} L su = ${totalL.toFixed(1)} L`
        )}>
          <Copy className="w-3.5 h-3.5 mr-1" /> Kopyala
        </Button>
        <Button variant="primary" size="sm" fullWidth>
          <Plus className="w-3.5 h-3.5 mr-1" /> Plan Oluştur
        </Button>
      </div>
    </Card>
  );
}
```

---

## 5. Veri Modeli

```typescript
// types/feeding.ts
interface FeedingPlan {
  id: string; // UUIDv7
  userId: string;
  apiaryId?: string;
  
  // Plan Tanımı
  name?: string; // "Kış Hazırlığı 2024"
  purpose: 'winter_prep' | 'spring_build' | 'dearth' | 'queen_rearing' | 'stimulation' | 'emergency' | 'other';
  feed_type: 'sugar_syrup_1_1' | 'sugar_syrup_2_1' | 'sugar_syrup_3_2' | 'fondant' | 'pollen_patty' | 'protein_powder' | 'honey' | 'custom';
  custom_feed_name?: string;
  
  // Miktar ve Yöntem
  amount_per_hive: number;
  unit: 'liter' | 'kg';
  method: 'top_feeder' | 'frame_feeder' | 'entrance_feeder' | 'dribble' | 'spray';
  
  // Zamanlama
  start_date: string; // ISO date
  end_date: string;
  frequency: 'daily' | 'every_2_days' | 'every_3_days' | 'weekly' | 'custom';
  custom_frequency_days?: number;
  preferred_time?: string; // "18:00"
  
  // Kovan Seçimi
  hive_selection: 'all' | 'active' | 'weak' | 'selected';
  selected_hive_ids: string[];
  
  // Maliyet ve Stok
  cost_per_unit_try: number;
  estimated_total_cost: number; // Hesaplanan
  notify_low_stock: boolean;
  
  // Durum
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  
  // Meta
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface FeedingRecord {
  id: string;
  planId?: string; // Plan varsa
  hiveId: string;
  userId: string;
  
  // Uygulama
  fed_at: string; // ISO datetime
  feed_type: FeedingPlan['feed_type'];
  amount: number; // Gerçekleşen miktar
  unit: 'liter' | 'kg';
  method: FeedingPlan['method'];
  
  // Tüketim Takibi
  consumed_amount?: number; // Sonraki kontrolde girilir
  consumption_rate_pct?: number; // amount > 0 ? consumed/amount * 100
  
  // Maliyet
  cost_try: number; // Otomatik: amount * plan.cost_per_unit
  
  // Neden (Plan yoksa manuel)
  reason?: FeedingPlan['purpose'];
  
  // Meta
  notes?: string;
  weather_snapshot?: WeatherSnapshot;
  created_at: string;
  updated_at: string;
}

// Besin Türü Tanımları
const FEED_TYPES = [
  { 
    value: 'sugar_syrup_1_1', 
    label: 'Şekerli Su 1:1', 
    icon: Droplet, 
    description: 'Bahar gelişimi, uyarıtma, yay yapımı', 
    best_season: ['İlkbahar', 'Yaz'],
    sugar_water_ratio: '1:1',
  },
  { 
    value: 'sugar_syrup_2_1', 
    label: 'Şekerli Su 2:1', 
    icon: Droplet, 
    description: 'Kış hazırlığı, kuruma beslemesi, depolama', 
    best_season: ['Sonbahar', 'Kış'],
    sugar_water_ratio: '2:1',
  },
  { 
    value: 'sugar_syrup_3_2', 
    label: 'Şekerli Su 3:2', 
    icon: Droplet, 
    description: 'Geçiş dönemi, orta yoğunluk', 
    best_season: ['Geç Sonbahar', 'Erken İlkbahar'],
    sugar_water_ratio: '3:2',
  },
  { 
    value: 'fondant', 
    label: 'Paté / Fondant', 
    icon: Cookie, 
    description: 'Soğuk hava, üst besleyici, uzun süreli', 
    best_season: ['Kış'],
    sugar_water_ratio: 'N/A',
  },
  { 
    value: 'pollen_patty', 
    label: 'Polen Pastası', 
    icon: CircleDot, 
    description: 'Protein kaynağı, yumurtalık gelişimi, ana arı yetiştirme', 
    best_season: ['İlkbahar', 'Yaz'],
    sugar_water_ratio: 'N/A',
  },
  { 
    value: 'protein_powder', 
    label: 'Protein Tozu', 
    icon: FlaskConical, 
    description: 'Karma besin, suda eritilip şekerli suya eklenir', 
    best_season: ['Yıl Boyu'],
    sugar_water_ratio: 'N/A',
  },
  { 
    value: 'honey', 
    label: 'Bal Beslemesi', 
    icon: Wheat, 
    description: 'Acil durum, doğal, hastalık riski (AFB)', 
    best_season: ['Acil'],
    sugar_water_ratio: 'N/A',
  },
];
```

---

## 6. AI Entegrasyonu (FeedingAgent)

```typescript
// agents/feedingAgent.ts
interface FeedingRecommendationInput {
  hive: Hive;
  inspections: Inspection[];
  region: Region;
  season: Season;
  weather_forecast: WeatherForecast[];
  flora_calendar: FloraEvent[];
  inventory: InventoryItem[];
}

interface FeedingRecommendation {
  should_feed: boolean;
  feed_type: FeedingPlan['feed_type'];
  amount_per_hive: number;
  unit: 'liter' | 'kg';
  frequency: FeedingPlan['frequency'];
  duration_days: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  reasoning: string;
  start_date: string;
  estimated_cost: number;
  stock_check: { sufficient: boolean; missing_items: string[] };
  references: string[];
}

export async function getFeedingRecommendation(input: FeedingRecommendationInput): Promise<FeedingRecommendation> {
  const { hive, inspections, region, season, weather_forecast, flora_calendar, inventory } = input;
  const lastInsp = inspections[0];
  
  // 1. Kış Hazırlığı (Ekim-Kasım)
  if (season === 'autumn' && lastInsp?.strength !== 'very_strong') {
    const honeyStores = estimateHoneyStores(hive, inspections);
    if (honeyStores < 15) { // kg
      return {
        should_feed: true,
        feed_type: 'sugar_syrup_2_1',
        amount_per_hive: 15 - honeyStores,
        unit: 'kg',
        frequency: 'every_2_days',
        duration_days: 14,
        priority: 'high',
        reasoning: `Kovan bal deposu ~${honeyStores} kg (minimum 15-20 kg gerekli). Kış geçirimi için 2:1 şekerli su takviyesi önerilir.`,
        start_date: new Date().toISOString().split('T')[0],
        estimated_cost: (15 - honeyStores) * 25,
        stock_check: checkStock(inventory, 'sugar', 15 - honeyStores),
        references: ['Anadolu Arısı Kış Hazırlığı', 'TÜBİTAK Besleme Rehberi'],
      };
    }
  }
  
  // 2. Bahar Gelişimi (Mart-Nisan)
  if (season === 'spring' && lastInsp?.strength === 'weak') {
    return {
      should_feed: true,
      feed_type: 'sugar_syrup_1_1',
      amount_per_hive: 1,
      unit: 'liter',
      frequency: 'daily',
      duration_days: 10,
      priority: 'medium',
      reasoning: 'Zayıf kovan bahar gelişimi için 1:1 şekerli su ile uyarıtılmalı. Pollen pastası eklenirse protein desteklenir.',
      start_date: new Date().toISOString().split('T')[0],
      estimated_cost: 10 * 20,
      stock_check: checkStock(inventory, 'sugar', 10),
      references: ['Bahar Besleme Protokolü'],
    };
  }
  
  // 3. Açlık Dönemi (Flora arası)
  const floraGap = detectFloraGap(flora_calendar, weather_forecast);
  if (floraGap > 7) { // 1 haftadan uzun boşluk
    return {
      should_feed: true,
      feed_type: 'sugar_syrup_1_1',
      amount_per_hive: 0.5,
      unit: 'liter',
      frequency: 'daily',
      duration_days: floraGap,
      priority: 'high',
      reasoning: `Bölgede ${floraGap} gün çiçeklenme aralığı var. Kovanlar açlık çekmemesi için günlük hafif besleme.`,
      start_date: flora_calendar.find(f => f.gap_after)?.date || new Date().toISOString().split('T')[0],
      estimated_cost: floraGap * 0.5 * 20,
      stock_check: checkStock(inventory, 'sugar', floraGap * 0.5),
      references: ['Açlık Dönemi Yönetimi'],
    };
  }
  
  // 4. Ana Arı Yetiştirme
  if (hive.queen_status === 'rearing') {
    return {
      should_feed: true,
      feed_type: 'pollen_patty',
      amount_per_hive: 0.5,
      unit: 'kg',
      frequency: 'every_2_days',
      duration_days: 21,
      priority: 'high',
      reasoning: 'Ana arı yetiştirme için yüksek protein (polen pastası) şart. Yumurtalık beslenmesi doğrudan kraliçe kalitesini etkiler.',
      start_date: new Date().toISOString().split('T')[0],
      estimated_cost: 10 * 80, // Polen pastası pahalı
      stock_check: checkStock(inventory, 'pollen_patty', 10),
      references: ['Kraliçe Yetiştirme Beslemesi', 'Doolittle Method'],
    };
  }
  
  // Varsayılan: Besleme gerekmiyor
  return {
    should_feed: false,
    feed_type: 'sugar_syrup_1_1',
    amount_per_hive: 0,
    unit: 'liter',
    frequency: 'weekly',
    duration_days: 0,
    priority: 'low',
    reasoning: 'Mevsimsel koşullar ve kovan durumu besleme gerektirmiyor. Düzenli muayene yeterli.',
    start_date: '',
    estimated_cost: 0,
    stock_check: { sufficient: true, missing_items: [] },
    references: [],
  };
}

function estimateHoneyStores(hive: Hive, inspections: Inspection[]): number {
  const lastInsp = inspections[0];
  if (!lastInsp) return 0;
  // Basit tahmin: Bal alanı % * çerçeve sayısı * 2.5kg/çerçeve
  const honeyFrames = (lastInsp.honey_area_pct || 0) / 100 * (hive.frame_count || 10);
  return honeyFrames * 2.5;
}

function detectFloraGap(flora: FloraEvent[], weather: WeatherForecast[]): number {
  // Basit: Son çiçeklenme bitişi - bir sonraki başlangıcı
  // Gerçek implementasyonda AI tahmin modeli kullanılır
  return 0;
}

function checkStock(inventory: InventoryItem[], itemType: string, needed: number): { sufficient: boolean; missing_items: string[] } {
  const item = inventory.find(i => i.category === itemType || i.name.toLowerCase().includes(itemType));
  if (!item) return { sufficient: false, missing_items: [itemType] };
  return { 
    sufficient: item.current_stock >= needed, 
    missing_items: item.current_stock >= needed ? [] : [`${item.name}: ${item.current_stock}/${needed} ${item.unit}`] 
  };
}
```

---

## 7. Offline ve Senkronizasyon

| İşlem | Offline | Senkron |
|-------|---------|---------|
| Plan oluştur | ✅ | `create_feeding_plan` |
| Plan güncelle | ✅ | `update_feeding_plan` |
| Besleme kaydı gir | ✅ | `create_feeding_record` |
| Tüketim gir | ✅ | `update_feeding_record` |
| Stok düş | ✅ Local inventory | `update_inventory` (batch) |
| Hatırlatıcı | Local notification | Push token ile server'dan da |

---

## 8. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **Takvim Klavye** | Arrow keys ile günler arası, Enter ile detay, Escape ile kapat |
| **Miktar Girişi** | `inputmode="decimal"`, step=0.1, min/max |
| **Stok Uyarısı** | `aria-live="assertive"` kritik stok için |
| **Renk Körlüğü** | Takvim noktaları: Şekil (●) + Renk + Tooltip metni |
| **Ekran Okuyucu** | "15 Ekim, 2 planlı besleme: Şekerli su 2:1, 2 litre, 12 kovan" |

---

## 9. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Plan: Kış hazırlığı, 2:1, 15kg, 10 kovan | Toplam 150kg şeker, maliyet hesaplanır, stok kontrolü |
| Şekerli su hesaplayıcı: 10kg şeker, 2:1 | Su: 5L, Toplam: 15L |
| Stokta 5kg şeker, plan 10kg gerektiriyor | Kırmızı uyarı "Stok yetersiz: Şeker 5/10 kg" |
| Besleme uygula: Plan 2L, Gerçek 1.8L | Tüketim %90, stoktan 1.8L düşer |
| Takvimde bugün 3 besleme | 3 nokta (yeşil/sarı/kırmızı), tıklayınca bottom sheet |
| Offline besleme girişi → Online | Senkron, stok güncellenir, plan progress güncellenir |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Otomatik Besleme Makinesi Entegrasyonu** | IoT besleyici → Miktar/zaman logu otomatik, uzaktan başlatma |
| **Besleme Optimizasyonu (ML)** | Geçmiş verim/besleme verisi → Optimal miktar/tipi/tarz tahmini |
| **Protein İhtiyaç Hesaplayıcı** | Kovan gücü + Yumurtalık alanı + Mevsim → Gerekli protein (gr/gün) |
| **Bölgesel Besleme Takvimi** | "Eğil'de kış beslemi 15 Ekim-30 Kasım" gibi bölge şablonları |
| **Besleme Maliyet Tahmini (Yıllık)** | Sezon başında toplam maliyet bütçesi, aylık nakit akışı |
| **Organik Sertifikasyon Uyumu** | Organik şeker/paté takibi, sertifika belgeleri, denetim raporu |