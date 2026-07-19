# BeeMaster AI — Dashboard Modülü v1.0

> **Amaç:** Kullanıcının uygulamayı açtığında ilk gördüğü ekran. Kovan portföyünün nabzını tutar, acil aksiyonları öne çıkarır, günlük iş akışını hızlandırır.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/` (Ana sayfa) |
| **Erişim** | Tüm kullanıcılar (Free/Pro/Enterprise) |
| **Veri Kaynağı** | IndexedDB (kovan özetleri, uyarılar), Supabase (hava, flora), Local AI (risk skorları) |
| **Offline** | %100 çalışır (cache'lenmiş veriler + local AI) |
| **Performans Hedefi** | TTI < 2s (4G), < 4s (3G), First Paint < 800ms |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| DH-01 | Arıcı olarak açıldığımda toplam kovan sayımı, aktif uyarıları ve bugünkü havaı görmek istiyorum | P0 |
| DH-02 | "Varroa eşiği aşıldı" uyarısına tıklayıp doğrudan muayene/tedavi sayfasına gitmek istiyorum | P0 |
| DH-03 | Hızlı aksiyonlarla (Muayene, Hasat, Besleme, Tedavi) 1 tıkta iş başlatmak istiyorum | P0 |
| DH-04 | Arı üssü değiştirip o üssün özel verilerini görmek istiyorum | P1 |
| DH-05 | Bu haftaki flora takvimini ve hava tahminini görmek istiyorum | P1 |
| DH-06 | Son muayenelerimden en son 5'inin özetini görmek istiyorum | P1 |
| DH-07 | Haftalık/aylık performans özeti (kar/zarar, verim trendi) görmek istiyorum (Pro) | P2 |

---

## 3. UI Yapısı (Component Tree)

```
DashboardPage
├── DashboardHeader (Sticky)
│   ├── ApiarySelector (Dropdown + "Tümü")
│   ├── SyncStatusIndicator (Online/Offline/Syncing + badge)
│   └── NotificationBell (Badge count)
│
├── SummaryCards (Grid 2x2, responsive)
│   ├── TotalHivesCard (count + trend)
│   ├── ActiveAlertsCard (critical/warning count + navigation)
│   ├── MonthlyHoneyCard (kg + vs önceki ay)
│   └── MonthlyTreatmentsCard (count + cost)
│
├── CriticalAlertsSection (Max 3, dismissible)
│   └── AlertCard[] (type, message, hive, action, timestamp)
│
├── QuickActionsBar (Horizontal scroll chips)
│   ├── ActionChip: + Muayene (Mic icon)
│   ├── ActionChip: + Hasat (Droplets icon)
│   ├── ActionChip: + Besleme (Utensils icon)
│   ├── ActionChip: + Tedavi (AlertTriangle icon)
│   ├── ActionChip: + Envanter (Package icon)
│   └── ActionChip: + Kovan (Plus icon)
│
├── WeatherFloraWidget (Card)
│   ├── CurrentWeather (temp, condition, humidity, wind)
│   ├── TodayFlora (dominant % + icon)
│   └── WeeklyForecast (7-day horizontal scroll)
│
├── RecentInspectionsSection
│   ├── SectionHeader: "Son Muayeneler" + "Tümünü Gör" link
│   └── InspectionCard[] (compact variant, max 5)
│
├── PerformanceSummaryCard (Pro+ only, collapsible)
│   ├── KPI Row: Net Kar, Ort. Verim, Maliyet/Kovan
│   └── Mini Charts: Honey trend, Cost trend
│
└── BottomNav (Dashboard active)
```

---

## 4. Bileşen Detayları

### 4.1 DashboardHeader

```tsx
// components/dashboard/DashboardHeader.tsx
interface DashboardHeaderProps {
  activeApiary: Apiary | null;
  onApiaryChange: (id: string | null) => void;
  syncStatus: 'online' | 'offline' | 'syncing' | 'error';
  pendingSyncCount: number;
  notificationCount: number;
  onNotificationsClick: () => void;
}

export function DashboardHeader({
  activeApiary,
  onApiaryChange,
  syncStatus,
  pendingSyncCount,
  notificationCount,
  onNotificationsClick,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-[100] bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 px-4 py-3">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {/* Arı Üssü Seçici */}
        <div className="flex-1 min-w-0">
          <ApiarySelector
            value={activeApiary?.id || 'all'}
            onChange={onApiaryChange}
            placeholder="Tüm Üssler"
            className="w-full"
          />
        </div>

        {/* Sağ Grup: Senkron + Bildirim */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Senkron Durumu */}
          <SyncStatusIndicator
            status={syncStatus}
            pendingCount={pendingSyncCount}
            className="hidden sm:flex"
          />

          {/* Bildirim Zili */}
          <button
            onClick={onNotificationsClick}
            className="relative p-2 rounded-xl text-neutral-400 hover:text-honey-400 hover:bg-neutral-800 transition-colors"
            aria-label={`Bildirimler${notificationCount > 0 ? `, ${notificationCount} yeni` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-5 px-1.5 bg-error text-neutral-50 text-[10px] font-bold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
```

### 4.2 SummaryCards (Özet Kartlar)

```tsx
// components/dashboard/SummaryCards.tsx
interface SummaryCardProps {
  title: string;
  value: string | number;
  trend?: { value: number; label: string }; // +12% vs önceki ay
  icon: React.ReactNode;
  color: 'honey' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  loading?: boolean;
}

export function SummaryCard({ title, value, trend, icon, color, onClick, loading }: SummaryCardProps) {
  const colorMap = {
    honey: 'bg-honey-400/10 border-honey-400/20 text-honey-400',
    success: 'bg-success-bg border-success-border text-success',
    warning: 'bg-warning-bg border-warning-border text-warning',
    error: 'bg-error-bg border-error-border text-error',
    info: 'bg-info-bg border-info-border text-info',
  };

  const trendColor = trend && trend.value > 0 ? 'text-success' : trend && trend.value < 0 ? 'text-error' : 'text-neutral-500';

  if (loading) {
    return (
      <Card variant="bordered" padding="md" className="animate-pulse">
        <div className="h-4 w-3/4 bg-neutral-800 rounded mb-2" />
        <div className="h-8 w-1/2 bg-neutral-800 rounded" />
      </Card>
    );
  }

  return (
    <Card
      variant="bordered"
      padding="md"
      className={cn('transition-all duration-200', onClick && 'cursor-pointer hover:border-honey-400 hover:shadow-lg')}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-bold text-neutral-50">{value}</p>
          {trend && (
            <p className={cn('text-xs font-medium mt-1 flex items-center gap-1', trendColor)}>
              {trend.value > 0 ? <TrendingUp className="w-3 h-3" /> : trend.value < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(trend.value)}% {trend.label}
            </p>
          )}
        </div>
        <div className={cn('p-2 rounded-xl', colorMap[color])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Kullanım:
<SummaryCardsGrid>
  <SummaryCard
    title="Toplam Kovan"
    value={stats.totalHives}
    trend={{ value: stats.hivesTrend, label: 'vs önceki ay' }}
    icon={<Home className="w-6 h-6" />}
    color="honey"
    onClick={() => navigate('/apiaries')}
  />
  <SummaryCard
    title="Aktif Uyarı"
    value={stats.criticalAlerts + stats.warningAlerts}
    trend={{ value: stats.alertsTrend, label: 'vs dün' }}
    icon={<AlertTriangle className="w-6 h-6" />}
    color={stats.criticalAlerts > 0 ? 'error' : 'warning'}
    onClick={() => navigate('/alerts')}
  />
  <SummaryCard
    title="Bu Ay Hasat"
    value={`${stats.monthlyHoneyKg} kg`}
    trend={{ value: stats.honeyTrend, label: 'vs önceki ay' }}
    icon={<Droplets className="w-6 h-6" />}
    color="success"
    onClick={() => navigate('/honey')}
  />
  <SummaryCard
    title="Bu Ay Tedavi"
    value={stats.monthlyTreatments}
    trend={{ value: stats.treatmentTrend, label: 'vs önceki ay' }}
    icon={<Pill className="w-6 h-6" />}
    color="info"
    onClick={() => navigate('/treatments')}
  />
</SummaryCardsGrid>
```

### 4.3 CriticalAlertsSection (Acil Uyarılar)

```tsx
// components/dashboard/CriticalAlertsSection.tsx
interface AlertCardProps {
  alert: Alert;
  onDismiss: (id: string) => void;
  onAction: (alert: Alert) => void;
}

export function AlertCard({ alert, onDismiss, onAction }: AlertCardProps) {
  const severityConfig = {
    critical: { bg: 'bg-error-bg', border: 'border-error', icon: <AlertCircle className="w-5 h-5" />, label: 'KRİTİK' },
    warning: { bg: 'bg-warning-bg', border: 'border-warning', icon: <AlertTriangle className="w-5 h-5" />, label: 'UYARI' },
    info: { bg: 'bg-info-bg', border: 'border-info', icon: <Info className="w-5 h-5" />, label: 'BİLGİ' },
  }[alert.severity];

  return (
    <Card variant="bordered" padding="md" className={cn(severityConfig.bg, severityConfig.border, 'animate-in slide-in-from-right')}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{severityConfig.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/10">{severityConfig.label}</span>
            <span className="text-xs text-neutral-500">{formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: tr })}</span>
          </div>
          <p className="text-sm text-neutral-50 mt-1">{alert.message}</p>
          {alert.hiveName && (
            <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
              <Home className="w-3 h-3" /> {alert.hiveName} {alert.apiaryName ? `· ${alert.apiaryName}` : ''}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {alert.action && (
            <Button size="sm" variant="outline" onClick={() => onAction(alert)} className="whitespace-nowrap">
              {alert.actionLabel || 'İncele'}
            </Button>
          )}
          <button
            onClick={() => onDismiss(alert.id)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
```

**Uyarı Türleri ve Öncelik Sırası:**

| Tür | Severity | Tetikleyici | Aksiyon |
|-----|----------|-------------|---------|
| Varroa eşiği aşıldı | critical | `varroa_count > threshold` (son muayene) | "Tedavi Planla" → Treatment Wizard |
| Ana arı yok (3+ gün) | critical | `queen_status != 'seen' > 3 days` | "Ana Arı Kontrolü" → Inspection Wizard |
| Kovan gücü çok zayıf | warning | `strength == 'very_weak'` | "Besleme Planla" → Feeding Wizard |
| Hava sıcaklığı > 35°C | warning | `weather.temp > 35` | "Gölge/Su Sağla" → Note" |
| Bal nemi > 18% | warning | `harvest.moisture > 18` | "Kurutma Başlat" → Note |
| Stok minimumun altındaysa | warning | `inventory.current <= inventory.min` | "Stok Yenile" → Inventory |
| Flora dönemi başladı | info | `flora_calendar.today.start` | "Muayene Yap" → Inspection |
| Haftalık özet hazır | info | `monday 09:00` | "Görüntüle" → Analytics |

### 4.4 QuickActionsBar (Hızlı Aksiyonlar)

```tsx
// components/dashboard/QuickActionsBar.tsx
const QUICK_ACTIONS: QuickAction[] = [
  { id: 'inspection', label: 'Muayene', icon: Mic, href: '/inspections/new', color: 'honey' },
  { id: 'harvest', label: 'Hasat', icon: Droplets, href: '/harvest/new', color: 'success' },
  { id: 'feeding', label: 'Besleme', icon: Utensils, href: '/feeding/new', color: 'warning' },
  { id: 'treatment', label: 'Tedavi', icon: AlertTriangle, href: '/treatments/new', color: 'error' },
  { id: 'inventory', label: 'Envanter', icon: Package, href: '/inventory/new', color: 'info' },
  { id: 'hive', label: 'Kovan', icon: Plus, href: '/hives/new', color: 'neutral' },
];

export function QuickActionsBar() {
  return (
    <div className="px-4 py-2" role="navigation" aria-label="Hızlı aksiyonlar">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide max-w-xl mx-auto">
        {QUICK_ACTIONS.map((action) => (
          <ActionChip key={action.id} action={action} />
        ))}
      </div>
    </div>
  );
}

function ActionChip({ action }: { action: QuickAction }) {
  const colorMap = {
    honey: 'bg-honey-400/10 text-honey-400 border-honey-400/20',
    success: 'bg-success-bg text-success border-success-border',
    warning: 'bg-warning-bg text-warning border-warning-border',
    error: 'bg-error-bg text-error border-error-border',
    info: 'bg-info-bg text-info border-info-border',
    neutral: 'bg-neutral-800 text-neutral-400 border-neutral-700',
  };

  return (
    <a
      href={action.href}
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium whitespace-nowrap',
        'transition-all duration-100 active:scale-[0.97]',
        colorMap[action.color]
      )}
    >
      <action.icon className="w-4 h-4" />
      <span>{action.label}</span>
    </a>
  );
}
```

### 4.5 WeatherFloraWidget (Hava + Flora)

```tsx
// components/dashboard/WeatherFloraWidget.tsx
interface WeatherFloraWidgetProps {
  weather: WeatherData | null;
  flora: FloraEvent[];
  loading?: boolean;
}

export function WeatherFloraWidget({ weather, flora, loading }: WeatherFloraWidgetProps) {
  if (loading) return <CardSkeleton variant="weather" />;

  const todayFlora = flora.find(f => isSameDay(new Date(f.date), new Date()));
  const weeklyFlora = flora.filter(f => isWithinInterval(new Date(f.date), { start: new Date(), end: addDays(new Date(), 7) }));

  return (
    <Card variant="bordered" padding="md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-neutral-50 flex items-center gap-2">
          <CloudSun className="w-5 h-5 text-honey-400" />
          Hava & Flora
        </h3>
        <a href="/weather" className="text-xs text-honey-400 hover:underline">Detay</a>
      </div>

      {/* Güncel Hava */}
      {weather && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-neutral-800/50 rounded-xl">
          <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-neutral-900 flex items-center justify-center">
            <WeatherIcon condition={weather.condition} className="w-8 h-8 text-honey-400" />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-neutral-50">{Math.round(weather.temp)}°C</p>
            <p className="text-sm text-neutral-400 capitalize">{weather.conditionText}</p>
          </div>
          <div className="flex flex-col gap-1 text-xs text-neutral-400 text-right">
            <span className="flex items-center gap-1"><Droplet className="w-3 h-3" /> %{weather.humidity}</span>
            <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> {weather.windKmh} km/s</span>
          </div>
        </div>
      )}

      {/* Bugün Flora */}
      {todayFlora && (
        <div className="mb-4 p-3 bg-honey-400/10 border border-honey-400/20 rounded-xl">
          <div className="flex items-center gap-2 text-sm">
            <Flower className="w-4 h-4 text-honey-400" />
            <span className="font-medium text-honey-400">Bugün Öne Çıkan:</span>
            <span className="text-neutral-400">{todayFlora.name} (%{todayFlora.intensity})</span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">{todayFlora.description}</p>
        </div>
      )}

      {/* Haftalık Flora Takvimi */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-neutral-400 uppercase tracking-wide">Bu Hafta</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {weeklyFlora.map((f) => (
            <FloraDayChip key={f.id} flora={f} />
          ))}
        </div>
      </div>
    </Card>
  );
}

function FloraDayChip({ flora }: { flora: FloraEvent }) {
  const isToday = isSameDay(new Date(flora.date), new Date());
  return (
    <div className={cn(
      'flex flex-col items-center gap-1 px-3 py-2 rounded-xl border whitespace-nowrap',
      'transition-all duration-100',
      isToday
        ? 'bg-honey-400/10 border-honey-400/30 text-honey-400'
        : 'bg-neutral-800/50 border-neutral-700 text-neutral-400'
    )}>
      <p className="text-xs font-medium">{format(new Date(flora.date), 'EEE', { locale: tr })}</p>
      <p className="text-[11px] truncate max-w-[60px]">{flora.name}</p>
      <div className="w-full h-1.5 bg-neutral-700 rounded-full overflow-hidden">
        <div className="h-full bg-honey-400" style={{ width: `${flora.intensity}%` }} />
      </div>
    </div>
  );
}
```

### 4.6 RecentInspectionsSection (Son Muayeneler)

```tsx
// components/dashboard/RecentInspectionsSection.tsx
interface RecentInspectionsSectionProps {
  inspections: Inspection[];
  onViewAll: () => void;
}

export function RecentInspectionsSection({ inspections, onViewAll }: RecentInspectionsSectionProps) {
  if (inspections.length === 0) {
    return (
      <Card variant="bordered" padding="lg" className="text-center">
        <ClipboardList className="w-12 h-12 mx-auto text-neutral-500 mb-3" />
        <h3 className="font-medium text-neutral-50 mb-1">Henüz Muayene Yok</h3>
        <p className="text-sm text-neutral-400 mb-4">İlk muayenenizi yaparak kovanlarınızı takip etmeye başlayın.</p>
        <Button onClick={() => navigate('/inspections/new')} leftIcon={<Plus className="w-4 h-4" />}>
          İlk Muayene
        </Button>
      </Card>
    );
  }

  return (
    <section>
      <div className="flex items-center justify-between px-4 mb-3">
        <h3 className="font-semibold text-neutral-50">Son Muayeneler</h3>
        <button onClick={onViewAll} className="text-sm text-honey-400 hover:underline flex items-center gap-1">
          Tümünü Gör <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2 px-4">
        {inspections.slice(0, 5).map((inspection) => (
          <InspectionCard key={inspection.id} inspection={inspection} variant="compact" />
        ))}
      </div>
    </section>
  );
}
```

---

## 5. Veri Gereksinimleri (Data Requirements)

### 5.1 IndexedDB Sorguları (Local-First)

```typescript
// lib/dashboard/queries.ts
export async function getDashboardData(apiaryId?: string): Promise<DashboardData> {
  const db = getDB();
  
  // Paralel sorgular
  const [
    hives,
    recentInspections,
    alerts,
    monthlyStats,
  ] = await Promise.all([
    // Kovanlar (filtreli)
    apiaryId 
      ? db.hives.where('apiary_id').equals(apiaryId).toArray()
      : db.hives.toArray(),
    
    // Son 5 muayene (tarih sıralı)
    db.inspections
      .orderBy('inspected_at')
      .reverse()
      .limit(5)
      .toArray(),
    
    // Aktif uyarılar (AI + kural tabanlı)
    generateAlerts(hives),
    
    // Bu ay istatistikleri
    calculateMonthlyStats(hives),
  ]);

  return {
    hives,
    recentInspections,
    alerts: alerts.sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity)).slice(0, 3),
    stats: monthlyStats,
  };
}

function generateAlerts(hives: Hive[]): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  for (const hive of hives) {
    const lastInspection = hive.inspections?.[0];
    if (!lastInspection) continue;

    // Varroa kritik
    if (lastInspection.varroa_count !== null && lastInspection.varroa_count > VARROA_THRESHOLD) {
      alerts.push({
        id: `varroa-${hive.id}`,
        type: 'varroa_high',
        severity: 'critical',
        message: `Varroa sayısı ${lastInspection.varroa_count} (eşik: ${VARROA_THRESHOLD})`,
        hiveName: hive.name,
        apiaryName: hive.apiary?.name,
        createdAt: lastInspection.inspected_at,
        action: 'treatment',
        actionLabel: 'Tedavi Planla',
      });
    }

    // Ana arı yok
    if (lastInspection.queen_status !== 'seen') {
      const daysSince = differenceInDays(now, new Date(lastInspection.inspected_at));
      if (daysSince >= 3) {
        alerts.push({
          id: `queen-${hive.id}`,
          type: 'queen_missing',
          severity: daysSince >= 7 ? 'critical' : 'warning',
          message: `Ana arı ${daysSince} gündür görülmedi`,
          hiveName: hive.name,
          apiaryName: hive.apiary?.name,
          createdAt: lastInspection.inspected_at,
          action: 'inspection',
          actionLabel: 'Muayene Yap',
        });
      }
    }

    // Kovan çok zayıf
    if (lastInspection.strength === 'very_weak') {
      alerts.push({
        id: `weak-${hive.id}`,
        type: 'colony_weak',
        severity: 'warning',
        message: 'Kovan gücü çok zayıf, besleme/destek gerekli',
        hiveName: hive.name,
        apiaryName: hive.apiary?.name,
        createdAt: lastInspection.inspected_at,
        action: 'feeding',
        actionLabel: 'Besleme Planla',
      });
    }
  }

  return alerts;
}
```

### 5.2 Sunucu Verileri (Hava + Flora)

```typescript
// lib/dashboard/serverData.ts
export async function fetchWeatherFlora(apiary: Apiary): Promise<{ weather: WeatherData; flora: FloraEvent[] }> {
  // Cache-first: 30 dk hava, 24 saat flora
  const cacheKey = `weather-flora-${apiary.id}`;
  const cached = await getCache(cacheKey);
  if (cached && !isStale(cached.timestamp, cached.type === 'weather' ? 30 : 1440)) {
    return cached.data;
  }

  try {
    const [weatherRes, floraRes] = await Promise.all([
      fetch(`/api/v1/weather?lat=${apiary.location.lat}&lon=${apiary.location.lng}`),
      fetch(`/api/v1/regions/${apiary.regionId}/flora-calendar`),
    ]);

    const weather = await weatherRes.json();
    const flora = await floraRes.json();

    await setCache(cacheKey, { weather, flora });
    return { weather, flora };
  } catch {
    // Fallback: cached data or defaults
    return getDefaultWeatherFlora(apiary.regionId);
  }
}
```

---

## 6. State Management (Zustand Store)

```typescript
// stores/dashboardStore.ts
interface DashboardState {
  activeApiaryId: string | null;
  setActiveApiary: (id: string | null) => void;
  
  data: DashboardData | null;
  setData: (data: DashboardData) => void;
  
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  syncStatus: 'online' | 'offline' | 'syncing' | 'error';
  setSyncStatus: (status: DashboardState['syncStatus']) => void;
  
  pendingSyncCount: number;
  setPendingSyncCount: (count: number) => void;
  
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  
  // Actions
  refresh: () => Promise<void>;
  dismissAlert: (alertId: string) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      activeApiaryId: null,
      setActiveApiary: (id) => set({ activeApiaryId: id }),
      
      data: null,
      setData: (data) => set({ data }),
      
      loading: true,
      setLoading: (loading) => set({ loading }),
      
      syncStatus: 'online',
      setSyncStatus: (status) => set({ syncStatus: status }),
      
      pendingSyncCount: 0,
      setPendingSyncCount: (count) => set({ pendingSyncCount: count }),
      
      notificationCount: 0,
      setNotificationCount: (count) => set({ notificationCount: count }),
      
      refresh: async () => {
        set({ loading: true });
        try {
          const data = await getDashboardData(get().activeApiaryId || undefined);
          set({ data, loading: false });
        } catch (err) {
          set({ loading: false });
          toast.error('Dashboard verileri yüklenemedi');
        }
      },
      
      dismissAlert: (alertId) => {
        set(state => ({
          data: state.data ? {
            ...state.data,
            alerts: state.data.alerts.filter(a => a.id !== alertId)
          } : null
        }));
      },
    }),
    { name: 'dashboard-store', partialize: s => ({ activeApiaryId: s.activeApiaryId }) }
  )
);
```

---

## 7. Performans Optimizasyonları

| Teknik | Açıklama |
|--------|----------|
| **Skeleton Loading** | Kartlar, grafikler, listeler için `CardSkeleton`, `ChartSkeleton` |
| **Lazy Load** | WeatherFloraWidget, PerformanceSummaryCard `React.lazy` + `Suspense` |
| **Virtualization** | Son muayeneler 5'ten fazlaysa `react-window` (MVP'de 5 sabit) |
| **Memoization** | `useMemo` ile `generateAlerts`, `calculateMonthlyStats` |
| **Parallel Fetch** | `Promise.all` ile IndexedDB + API çağrıları |
| **Cache Strategy** | Hava 30 dk, Flora 24 saat, Kovan verileri anlık (IndexedDB) |
| **Image Optimization** | Hava ikonları SVG, flora ikonları lazy-loaded WebP |

---

## 8. Erişilebilirlik (A11y)

| Özellik | Uygulama |
|---------|----------|
| **Odak Sırası** | Header → Özet kartlar (grid sırası) → Uyarılar → Aksiyonlar → Hava → Muayeneler |
| **ARIA** | `role="region" aria-label="Özet kartları"`, `aria-live="polite"` uyarılar için |
| **Renk Kontrastı** | Tüm metin 4.5:1, badge'ler 3:1 (WCAG AA) |
| **Ekran Okuyucu** | "Toplam kovan 12, artı 2 önceki aya göre", "3 kritik uyarı, Varroa eşiği aşıldı" |
| **Klavye Navigasyonu** | Tab ile tüm etkileşimli öğeler, Enter/Space ile aksiyon |
| **Hareket Azaltma** | `prefers-reduced-motion` → animasyonlar kapalı, skeleton pulse durdurulur |

---

## 9. Test Senaryoları

| Senaryo | Beklenen Sonuç |
|---------|----------------|
| İlk açılış (veri yok) | Boş durum: "Hoş Geldin" + "İlk Arı Üssü Oluştur" CTA |
| 50 kovan, 3 kritik uyarı | 3 uyarı kartı, en üstte Varroa kritik |
| Arı üssü değiştirildi | Tüm veriler (kovan, uyarı, istatistik) yeni üse filtrelenir |
| Offline mod | "Çevrimdışı" badge, son senkron verileri gösterilir, yazma kuyruğa alınır |
| Pull-to-refresh | Senkron tetiklenir, loading spinner, başarı/hat toast |
| Pro kullanıcı | PerformanceSummaryCard görünür, net kar/verim grafikleri |
| Free kullanıcı | PerformanceSummaryCard gizli, "Pro ile kilidini aç" tooltip |
| Ekran okuyucu ile navigasyon | Tüm kartlar, butonlar, linkler anlamlı etiketlerle okunur |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Widget Kişiselleştirme** | Kullanıcı kartları sürükle/bırak ile sıralar, gizler/gösterir |
| **AI Günlük Özeti** | "Bugün 3 kovan muayene etmeli, Kovan-12 varroa tedavisi kritik" |
| **Takvim Entegrasyonu** | Google/Apple Takvime hatırlatıcı ekleme (Besleme, Tedavi, Sayım) |
| **Sesli Özet** | "Hey BeeMaster, bugün ne var?" → TTS ile günlük rapor |
| **Karşılaştırma Modu** | "Bu yıl vs Geçen yıl", "Eğil vs Şanlıurfa" yan yana |
| **Export Dashboard** | PNG/PDF olarak paylaş (Mentor/Danışman için) |