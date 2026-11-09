// Quando si aggiungono nuovi file (es. immagini) inserirli in FILES e aumentare la versione.
var CACHE = 'sc-config-v36';

var FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'favicon.ico',
  'assets/icon-32.png',
  'css/style.css',
  'js/data.js',
  'js/app.js',
  'assets/logo.png',
  'assets/logo-dark.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'assets/apple-touch-icon.png',
  'assets/printers/custom.jpg',
  'assets/printers/labware-smart-rt.jpg',
  'assets/printers/labware-basiq.jpg',
  'assets/printers/3i-rt-1.jpg',
  'assets/printers/3i-rt-2.jpg',
  'assets/printers/emotiq-model-m.jpg',
  'assets/printers/emotiq-nota.jpg',
  'assets/printers/emotiq-opera-2.jpg',
  'assets/printers/epson-fp-81.jpg',
  'assets/printers/rch-print-f.jpg',
  'assets/cic/cassa-in-cloud-icon.png',
  'assets/cic/cassa-in-cloud-logo.png',
  'assets/cic/tasto-compila-piva.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

// Rete prima (contenuti sempre aggiornati), cache se offline
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: true });
    })
  );
});
