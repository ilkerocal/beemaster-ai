// ============================================================
// Service Worker — Network-First, No Cache (always fresh)
// ============================================================
const CACHE_NAME = 'beemaster-no-cache-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // ALWAYS go to network — no caching, no offline fallback
  // This ensures users always get the latest version
  event.respondWith(
    fetch(event.request, { cache: 'no-store' })
      .then(response => {
        // Only cache GET requests for same origin
        if (event.request.method === 'GET' && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => {
        // Offline fallback - try cache if network fails
        return caches.match(event.request);
      })
  );
});
