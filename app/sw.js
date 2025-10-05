const CACHE_NAME = 'srm-cache-v1.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css?h=504ec217',
  '/app.js?h=f5d93103',
  '/sw-registration.js?h=81772571',
  '/manifest.json?h=84c28504',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-48x48.png',
  '/favicon-96x96.png',
  '/favicon-192x192.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
];

// Install service worker and cache assets.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('Service worker installed and assets cached');
        return self.skipWaiting();
      })
  );
});

// Activate and clean up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => {
      console.log('Service worker activated');
      return self.clients.claim();
    })
  );
});

// Serve from cache, falling back to network.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', error);
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});
