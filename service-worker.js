// service-worker.js
const CACHE_NAME = 'ditado-cache-v2';
const ASSETS = [
  '.',
  './ditado.html',
  './manifest.json'
  // não há arquivos de ícone locais; manifest usa data URI / links externos
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
  // Strategy: cache-first for app shell, network fallback; cache new GET same-origin responses
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone()).catch(()=>{});
          });
        }
        return response;
      }).catch(() => {
        return caches.match('./ditado.html');
      });
    })
  );
});
