// BachatBro Service Worker
const CACHE_NAME = 'bachatbro-v2';
const STATIC_CACHE = 'bachatbro-static-v2';
const DYNAMIC_CACHE = 'bachatbro-dynamic-v2';

// Assets to cache on install - complete app shell for offline use
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install event - cache complete app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching app shell for offline use');
        // Cache all static assets - app must work offline
        return cache.addAll(STATIC_ASSETS);
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

  // NEVER intercept Google OAuth or API requests
  if (url.origin.includes('accounts.google.com') || 
      url.origin.includes('googleapis.com') ||
      url.origin.includes('google.com')) {
    // Let Google requests pass through directly
    return;
  }

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip service worker for hot reload in development
  if (url.pathname.includes('hot-update')) {
    return;
  }

  // For navigation requests (HTML pages)
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
          // When offline, serve cached version or index.html
          return caches.match(request)
            .then((response) => {
              if (response) {
                return response;
              }
              // Always return index.html for offline - shows last known app state
              return caches.match('/index.html')
                .then((indexResponse) => {
                  if (indexResponse) {
                    return indexResponse;
                  }
                  // Fallback to root
                  return caches.match('/');
                });
            });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (CSS, JS, images, fonts)
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
