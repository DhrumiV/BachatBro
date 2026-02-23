// BachatBro Service Worker
const CACHE_NAME = 'bachatbro-v1';
const STATIC_CACHE = 'bachatbro-static-v1';
const DYNAMIC_CACHE = 'bachatbro-dynamic-v1';

// Assets to cache on install (only essential files)
const STATIC_ASSETS = [
  '/',
  '/app',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        // Don't fail if some assets can't be cached
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(new Request(url, { cache: 'reload' }))
              .catch(err => console.log('[SW] Failed to cache:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Network first for Google APIs
    if (url.origin.includes('googleapis.com') || url.origin.includes('google.com')) {
      event.respondWith(
        fetch(request)
          .catch(() => {
            return new Response(
              JSON.stringify({ error: 'Offline - Google Sheets unavailable' }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          })
      );
    }
    return;
  }

  // Skip service worker for hot reload in development
  if (url.pathname.includes('hot-update')) {
    return;
  }

  // Network-first for HTML to avoid stale content
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Serve from cache if offline
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Return offline page
              return caches.match('/')
                .then((response) => response || new Response('Offline'));
            });
        })
    );
    return;
  }

  // Cache-first strategy for static assets
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image' ||
      request.destination === 'font') {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (response.ok) {
                return caches.open(DYNAMIC_CACHE)
                  .then((cache) => {
                    cache.put(request, response.clone());
                    return response;
                  });
              }
              return response;
            });
        })
        .catch(() => {
          // Return offline fallback for images
          if (request.destination === 'image') {
            return new Response(
              '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="#0A0A0F"/><text x="50" y="50" text-anchor="middle" fill="#4F6EF7">Offline</text></svg>',
              { headers: { 'Content-Type': 'image/svg+xml' } }
            );
          }
        })
    );
    return;
  }
});

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
