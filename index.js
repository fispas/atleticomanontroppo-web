// Service worker: guscio dell'app offline. Aumenta VERSIONE a ogni rilascio.
const VERSIONE = 'atletico-v4';
const SHELL = [
  './', './index.html', './firebase-config.js', './manifest.json',
  './assets/logo.png', './assets/icon-192.png', './assets/icon-512.png', './assets/favicon.png', './assets/apple-touch-icon.png'
];
const CDN = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSIONE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Pagina e config: prima la rete (aggiornamenti immediati), poi la cache
  if (url.origin === self.location.origin && (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('firebase-config.js'))) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSIONE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }

  // Asset locali: prima la cache
  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(VERSIONE).then(c => c.put(req, copy));
      return res;
    })));
    return;
  }

  // SDK Firebase e font: cache con aggiornamento in background
  if (CDN.includes(url.hostname) && !url.pathname.includes('/__/')) {
    e.respondWith(caches.open(VERSIONE).then(c => c.match(req).then(cached => {
      const net = fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }).catch(() => cached);
      return cached || net;
    })));
  }
  // Tutto il resto (Firestore, Auth, meteo) passa senza toccare
});
