// service-worker.js
const CACHE_NAME = 'ditado-cache-v1';
const ASSETS = [
  '.',
  './ditado.html',
  './manifest.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // adicione outros arquivos estáticos que queira cachear
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Strategy: try cache first, then network; fallback to network if not cached
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Optionally cache new requests (only for same-origin and GET)
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone()).catch(()=>{});
          });
        }
        return response;
      }).catch(() => {
        // network failed; optionally return a fallback page or image
        return caches.match('./ditado.html');
      });
    })
  );
});
