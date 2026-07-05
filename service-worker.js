const CACHE_NAME = 'ditado-cache-v1';
const ASSETS = [
  '.',
  './ditado.html',
  './manifest.json'
  // adicione aqui whisper.wasm, whisper.js, ícones, etc., se houver
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
