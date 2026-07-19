# BeeMaster AI — Mobile-First & PWA Mimarisi v1.0

> **Amaç:** Mobil cihazlarda (telefon, tablet) mükemmel deneyim, offline-first çalışma, native uygulama hissiyatı, performans ve erişilebilirlik standartları.

---

## 1. Mobil-First Prensipleri

| Prensip | Uygulama |
|---------|----------|
| **Tek Kod Tabanı** | PWA (Progressive Web App) — iOS, Android, Desktop tek build |
| **Alt Navigasyon** | Bottom Navigation Bar (Safe Area uyumlu) — Parmakla erişim |
| **Dokunma Hedefleri** | Minimum 44×44px (Apple/Google standartları) |
| **Dikey Ritim** | Kaydırma (scroll) ana etkileşim, modal/bottom sheet tercih |
| **Tek El Kullanımı** | Önemli aksiyonlar ekranın alt yarısında |
| **Görsel Geri Bildirim** | Haptic (titresim), loading skeleton, mikro animasyonlar |
| **Koyu Tema Varsayılan** | Güneş ışığında okunabilirlik, pil tasarrufu |

---

## 2. PWA Gereksinimleri

### 2.1 Manifest (manifest.json)

```json
{
  "name": "BeeMaster AI",
  "short_name": "BeeMaster",
  "description": "Arıcılık Bilimi, Yapay Zeka ile Buluşuyor",
  "start_url": "/?source=pwa",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0a0a0a",
  "theme_color": "#0a0a0a",
  "scope": "/",
  "lang": "tr",
  "dir": "ltr",
  "icons": [
    { "src": "/icons/icon-72.png", "sizes": "72x72", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-96.png", "sizes": "96x96", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-128.png", "sizes": "128x128", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-144.png", "sizes": "144x144", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-152.png", "sizes": "152x152", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-384.png", "sizes": "384x384", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "screenshots": [
    { "src": "/screenshots/dashboard-wide.png", "sizes": "1280x720", "type": "image/png", "form_factor": "wide", "label": "Dashboard" },
    { "src": "/screenshots/inspection-narrow.png", "sizes": "750x1334", "type": "image/png", "form_factor": "narrow", "label": "Muayene Sihirbazı" }
  ],
  "categories": ["productivity", "agriculture", "education"],
  "shortcuts": [
    {
      "name": "Yeni Muayene",
      "short_name": "Muayene",
      "description": "Hızlı muayene başlat",
      "url": "/inspections/new",
      "icons": [{ "src": "/icons/shortcut-mic.png", "sizes": "96x96" }]
    },
    {
      "name": "Hasat Gir",
      "short_name": "Hasat",
      "description": "Bal hasadı kaydet",
      "url": "/harvest/new",
      "icons": [{ "src": "/icons/shortcut-honey.png", "sizes": "96x96" }]
    }
  ],
  "prefer_related_applications": false
}
```

### 2.2 Service Worker (Workbox) Stratejisi

```javascript
// sw.js — Workbox v7
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

const CACHE_NAME = 'beemaster-v1.0.0';

// 1. API Calls — NetworkFirst (Veri her zaman güncel olmalı)
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [
      new ExpirationPlugin({ maxEntries: 500, maxAgeSeconds: 24 * 60 * 60 }),
      new BackgroundSyncPlugin('api-mutations', { maxRetentionTime: 24 * 60 })
    ]
  })
);

// 2. Static Assets (JS, CSS, Images, Fonts) — StaleWhileRevalidate
registerRoute(
  ({ request }) => ['script', 'style', 'image', 'font'].includes(request.destination),
  new StaleWhileRevalidate({
    cacheName: 'static-assets',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 })]
  })
);

// 3. AI Models — CacheFirst (Büyük dosyalar, nadiren değişir)
registerRoute(
  ({ url }) => url.pathname.startsWith('/models/'),
  new CacheFirst({
    cacheName: 'models-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 })]
  })
);

// 4. Offline Fallback
setCatchHandler(({ event }) => {
  if (event.request.destination === 'document') {
    return caches.match('/offline.html');
  }
  return Response.error();
});

// 5. Skip Waiting & Clients Claim (Anında güncelleme)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  // Eski cache'leri temizle
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});
```

---

## 3. UI/UX Mobil Desenleri

### 3.1 Layout Yapısı

```
<AppShell>
  <Header (Sticky, z-100)>
    - Apiary Selector
    - Sync Status
    - Notification Bell
  </Header>
  
  <Main (flex-1, pb-20, pt-safe-area)>
    <Container (max-w-xl, mx-auto, px-4)>
      {Page Content}
    </Container>
  </Main>
  
  <BottomNav (Fixed, z-300, Safe Area Inset Bottom)>
    - Dashboard
    - Apiaries
    - Inspections
    - Analytics
    - More
  </BottomNav>
  
  <Modals / BottomSheets (Portal, z-500)>
  <Toasts (Fixed, z-700, Bottom-Right)>
</AppShell>
```

### 3.2 Safe Area Desteği (iOS Notch / Android Gesture Bar)

```css
/* global.css */
:root {
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
  --safe-left: env(safe-area-inset-left);
  --safe-right: env(safe-area-inset-right);
}

.app-shell {
  padding-top: var(--safe-top);
  padding-bottom: calc(var(--space-20) + var(--safe-bottom));
}

.bottom-nav {
  padding-bottom: calc(var(--space-4) + var(--safe-bottom));
}

.modal-content {
  padding-bottom: calc(var(--space-4) + var(--safe-bottom));
}
```

### 3.3 Bottom Navigation (Ana Navigasyon)

```tsx
// components/ui/BottomNav.tsx
export function BottomNav({ items, activeId, onChange, hidden }) {
  if (hidden) return null;

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-[300]',
      'bg-neutral-950/95 backdrop-blur-md border-t border-neutral-700',
      'animate-in slide-in-from-bottom-full duration-300',
      hidden && 'animate-out slide-out-to-bottom-full'
    )}>
      <div className="grid grid-cols-5 gap-1 px-2 pb-2 pt-1.5 max-w-xl mx-auto">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                'relative flex flex-col items-center gap-1 px-2 py-2 rounded-xl',
                'transition-all duration-200 active:scale-[0.98]',
                isActive ? 'text-honey-400' : 'text-neutral-500 hover:text-neutral-300'
              )}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <div className="relative">
                {isActive && item.activeIcon ? item.activeIcon : item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-5 px-1.5 bg-honey-400 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={cn('text-[11px] font-medium', isActive ? 'text-honey-400' : 'text-neutral-500')}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-6 h-1 bg-honey-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
```

### 3.4 Bottom Sheet (Modal Yerine)

```tsx
// components/ui/BottomSheet.tsx
export function BottomSheet({ isOpen, onClose, title, children, size = 'md' }) {
  const heights = { sm: '40%', md: '60%', lg: '80%', full: '95%' };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[400]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn('fixed bottom-0 left-0 right-0 z-[500] rounded-t-2xl bg-neutral-900 border-t border-neutral-700', heights[size])}
          >
            <div className="flex items-center justify-between p-4 border-b border-neutral-800 sticky top-0 bg-neutral-900/95 backdrop-blur z-10 rounded-t-2xl">
              <h2 className="text-lg font-semibold text-neutral-50">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-neutral-400 hover:text-neutral-50 hover:bg-neutral-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-[calc(100%-80px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## 4. Performans Optimizasyonları

### 4.1 Yükleme Stratejileri

| Teknik | Açıklama | Etki |
|--------|----------|------|
| **Code Splitting** | `React.lazy` + `Suspense` per route | Initial bundle < 150KB gzipped |
| **Route Prefetching** | `react-router` `prefetch` on hover | Sayfa geçişi < 200ms |
| **Image Optimization** | WebP, `srcset`, `sizes`, lazy loading | LCP < 2.5s |
| **Font Loading** | `font-display: swap`, subset (Latin + TR) | CLS < 0.1 |
| **CSS Critical** | Inline critical CSS, defer non-critical | FCP < 1.2s |

### 4.2 Bundle Analizi (Hedefler)

```
Initial Load (4G):
- HTML: 5 KB
- CSS (critical): 8 KB
- JS (vendor): 45 KB (React, Router, UI lib)
- JS (app): 35 KB (code split per route)
- Fonts: 25 KB (Inter subset + Icons)
- Total: ~120 KB gzipped

Time to Interactive: < 3s (4G), < 5s (3G)
```

### 4.3 Virtualization (Uzun Listeler)

```tsx
// components/ui/VirtualizedList.tsx
import { useVirtualizer } from '@tanstack/react-virtual';

export function VirtualizedList({ items, renderItem, height = 500 }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-full overflow-auto" style={{ height }}>
      <div style={{ height: virtualizer.getTotalSize() }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 5. Erişilebilirlik (WCAG AA)

### 5.1 Mobil Özel Kontroller

| Kriter | Uygulama |
|--------|----------|
| **Dokunma Hedefi** | Tüm etkileşimli öğeler ≥ 44×44px |
| **Ekran Okuyucu** | TalkBack (Android) / VoiceOver (iOS) tam destek |
| **Kontrast** | 4.5:1 (metin), 3:1 (UI öğeleri) — Koyu temada |
| **Yakınlaştırma** | `maximum-scale=5.0`, `user-scalable=yes` |
| **Odak Görünürlüğü** | `focus-visible` ring (2px honey-400) |
| **Hareket Azaltma** | `prefers-reduced-motion` → animasyonlar kapalı |

### 5.2 Sesli Komut Desteği (İleri Versiyon)

```typescript
// hooks/useVoiceCommands.ts
export function useVoiceCommands(commands: VoiceCommand[]) {
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;
    
    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = true;
    recognition.interimResults = false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      for (const cmd of commands) {
        if (cmd.patterns.some(p => transcript.includes(p))) {
          cmd.action();
          break;
        }
      }
    };
    
    recognition.start();
    return () => recognition.stop();
  }, [commands]);
}

// Kullanım:
useVoiceCommands([
  { patterns: ['muayene başlat', 'yeni muayene'], action: () => navigate('/inspections/new') },
  { patterns: ['kovan 12'], action: () => navigate('/hives/kovan-12-id') },
  { patterns: ['hasat gir', 'bal kaydet'], action: () => navigate('/harvest/new') },
]);
```

---

## 6. Platforma Özel Özellikler

### 6.1 iOS (Safari PWA Sınırlamaları)

| Sınırlama | Çözüm |
|-----------|-------|
| **Push Bildirim Yok** | Local notifications + "Uygulamayı aç" hatırlatması |
| **Background Sync Yok** | `visibilitychange` + `beforeunload` ile senkron tetikleme |
| **Install Prompt Yok** | Custom "Ana Ekrana Ekle" rehberi (Share sheet) |
| **Storage Limit** | 50MB (IndexedDB) → Uyarı + Temizlik butonu |

```tsx
// components/pwa/IOSInstallGuide.tsx
export function IOSInstallGuide({ onDismiss }) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  
  if (!isIOS || isStandalone) return null;
  
  return (
    <BottomSheet isOpen={true} onClose={onDismiss} title="BeeMaster'i Kurun">
      <div className="space-y-4 text-center">
        <img src="/icons/ios-install-guide.png" alt="Kurulum rehberi" className="mx-auto max-w-xs" />
        <h3 className="font-semibold text-neutral-50">Ana ekrana ekleyin</h3>
        <p className="text-sm text-neutral-400">
          Paylaş butonuna dokunun → "Ana Ekrana Ekle" seçin
        </p>
        <Button variant="primary" fullWidth onClick={onDismiss}>Anladım</Button>
      </div>
    </BottomSheet>
  );
}
```

### 6.2 Android (Chrome PWA)

| Özellik | Durum | Not |
|---------|-------|-----|
| **WebAPK** | ✅ | Play Store'dan ayırt edilemez |
| **Push (FCM)** | ✅ | VAPID + Service Worker |
| **Background Sync** | ✅ | Periodic + One-shot |
| **File System Access** | ✅ | CSV/JSON import/export |
| **NFC** | ✅ | Web NFC API (Chrome 89+) |
| **Bluetooth** | ✅ | Web Bluetooth (IoT sensörler için) |

### 6.3 Native Bridge (Capacitor / Tauri — v1.5+)

```typescript
// native-bridge.ts (Capacitor plugin)
import { registerPlugin } from '@capacitor/core';

export const BeeMasterNative = registerPlugin('BeeMasterNative', {
  // NFC Etiket Yazma (iOS/Android)
  writeNFCTag: (data: { type: 'hive'; id: string; name: string }) => Promise<{ success: boolean }>,
  
  // Barkod/QR Tarama (Native Kamera)
  scanBarcode: () => Promise<{ format: string; value: string }>,
  
  // Haptic Feedback
  hapticImpact: (style: 'light' | 'medium' | 'heavy') => Promise<void>,
  
  // Local Notification (iOS Push yoksa)
  scheduleNotification: (options: { title: string; body: string; trigger: { at: Date } }) => Promise<string>,
  
  // Dosya Sistemi Erişimi (CSV Import/Export)
  pickFile: (types: string[]) => Promise<{ path: string; blob: Blob }>,
  saveFile: (blob: Blob, name: string) => Promise<void>,
  
  // Bluetooth (IoT Sensörler)
  bluetoothConnect: (deviceId: string) => Promise<void>,
  bluetoothSubscribe: (service: string, characteristic: string, callback: (data: Uint8Array) => void) => Promise<void>,
});
```

---

## 7. Test Stratejisi (Mobil)

### 7.1 Cihaz Test Matrisi

| Platform | Cihazlar | Boyutlar | OS Sürümleri |
|----------|----------|----------|--------------|
| **iOS** | iPhone SE (2020), 13, 14 Pro, 15 Pro Max | 375×667 → 430×932 | iOS 16, 17, 18 |
| **Android** | Pixel 7a, Galaxy S23, Xiaomi 13, Tablet | 360×800 → 1200×1920 | Android 13, 14, 15 |
| **Desktop PWA** | Chrome, Edge, Firefox, Safari | 1280×720 → 2560×1440 | Latest 2 |

### 7.2 Otomatik Testler (Playwright)

```typescript
// e2e/mobile/pwa.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PWA Mobile', () => {
  test.use({ ...devices['iPhone 14'] });
  
  test('install prompt shows on iOS', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="ios-install-guide"]')).toBeVisible();
  });
  
  test('bottom nav navigation', async ({ page }) => {
    await page.goto('/');
    await page.tap('[data-testid="nav-apiaries"]');
    await expect(page).toHaveURL(/\/apiaries/);
  });
  
  test('offline mode works', async ({ page, context }) => {
    await page.goto('/inspections/new');
    await context.setOffline(true);
    await page.fill('[data-testid="varroa-input"]', '12');
    await page.tap('[data-testid="save-btn"]');
    await expect(page.locator('[data-testid="offline-badge"]')).toBeVisible();
    await context.setOffline(false);
    await expect(page.locator('[data-testid="sync-success"]')).toBeVisible();
  });
  
  test('voice input works', async ({ page }) => {
    await page.goto('/inspections/new');
    // Mock SpeechRecognition
    await page.evaluate(() => {
      window.SpeechRecognition = class {
        start() { setTimeout(() => this.onresult({ results: [[{ transcript: 'Varroa 12' }]] }), 100); }
        stop() {}
        lang = 'tr-TR';
        onresult = () => {};
      };
    });
    await page.tap('[data-testid="voice-btn"]');
    await expect(page.locator('[data-testid="transcript"]')).toContainText('Varroa 12');
  });
});
```

---

## 8. Dağıtım (Deployment)

### 8.1 Build Pipeline

```yaml
# .github/workflows/deploy-pwa.yml
name: Deploy PWA
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        with: { name: dist, path: dist }
  
  deploy-preview:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - uses: netlify/actions/cli@master
        with: { args: 'deploy --dir=dist --alias=preview' }
  
  deploy-production:
    needs: deploy-preview
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/download-artifact@v4
        with: { name: dist, path: dist }
      - uses: netlify/actions/cli@master
        with: { args: 'deploy --dir=dist --prod' }
```

### 8.2 Cache Invalidation (Kullanıcıya Yenileme Bildirimi)

```typescript
// hooks/useSWUpdate.ts
export function useSWUpdate() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    
    let registration: ServiceWorkerRegistration;
    
    navigator.serviceWorker.ready.then(reg => {
      registration = reg;
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateToast();
          }
        });
      });
    });
    
    // Periyodik kontrol (30 dk)
    const interval = setInterval(() => registration?.update(), 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  function showUpdateToast() {
    toast({
      title: 'Yeni sürüm hazır',
      description: 'Uygulamayı yenileyerek en son özellikleri alın.',
      action: { label: 'Yenile', onClick: () => window.location.reload() },
      duration: 0,
    });
  }
}
```

---

## 9. Ölçüm ve İzleme

| Metrik | Hedef | Araç |
|--------|-------|------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Web Vitals / Vercel Analytics |
| **FID (First Input Delay)** | < 100ms | Web Vitals |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Web Vitals |
| **TTI (Time to Interactive)** | < 3s (4G) | Lighthouse CI |
| **PWA Install Rate** | > 15% | Custom Event |
| **Offline Usage %** | > 20% oturum | Custom Analytics |
| **Crash-Free Sessions** | > 99.5% | Sentry |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Trusted Web Activity (TWA)** | Play Store'da PWA olarak yayınlama (Android) |
| **App Clip / Instant App** | NFC etiketi tarayınca anında muayene sayfası (iOS/Android) |
| **Background Periodic Sync** | Günlük hava/flora güncellemesi, model kontrolü |
| **File System Access API** | CSV/JSON doğrudan dosya sisteminden import/export |
| **Web Bluetooth / USB** | IoT kovan sensörleri (ağırlık, sıcaklık, ses) doğrudan bağlama |
| **Screen Wake Lock** | Muayene sırasında ekranın kapanmaması |
| **Contact Picker API** | Mentor/arkadaş paylaşımı için rehber erişimi |
| **Share Target API** | Diğer uygulamalardan (Galeri, Ses kayıtı) BeeMaster'a paylaşım |