// Service worker do Nadgol: deixa o app instalável e abrir rápido.
// Nunca guarda chamadas ao banco/API (dados sempre frescos e protegidos pelo login).
const VERSAO = 'nadgol-v1';
const SHELL = ['/', '/manifest.webmanifest', '/escudo-nadgol.svg', '/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSAO).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Supabase e outros: direto na rede
  if (req.mode === 'navigate') {
    // páginas: rede primeiro, cai para o shell se estiver offline
    e.respondWith(fetch(req).catch(() => caches.match('/')));
    return;
  }
  if (url.pathname.startsWith('/assets/') || /\.(png|svg|webmanifest|woff2?)$/.test(url.pathname)) {
    // arquivos com hash/estáticos: cache primeiro
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copia = res.clone(); caches.open(VERSAO).then((c) => c.put(req, copia)); }
        return res;
      }))
    );
  }
});
