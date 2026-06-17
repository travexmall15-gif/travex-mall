// Travex Mall — Service Worker (Online Only)
// Purpose: Enable PWA installation only — no offline caching

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', () => self.clients.claim())

// Pass all requests straight to network — online only
self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request))
})
