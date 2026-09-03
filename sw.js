// Service Worker بسيط لتطبيق بلاغات الأعطال
// يخزن "قشرة" التطبيق (الصفحة + الأيقونات) محلياً حتى يفتح بسرعة
// حتى مع ضعف الاتصال. لا يخزّن بيانات Firebase (تحتاج اتصال دائماً).

const CACHE_NAME = 'helpdesk-employee-v4';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // App shell: cache-first. Everything else (Firebase calls, etc.): network-first.
  const requestUrl = new URL(event.request.url);
  const isShellRequest = requestUrl.origin === self.location.origin &&
    APP_SHELL.some(path => requestUrl.pathname === path);
  if (isShellRequest) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});
