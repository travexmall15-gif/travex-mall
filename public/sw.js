const CACHE = 'travex-mall-v1'
const PRECACHE = [
  '/',
  '/market',
  '/campus',
  '/vybe',
  '/manifest.json',
]

// Install — cache core pages
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip non-GET and chrome-extension requests
  if (e.request.method !== 'GET' || e.request.url.startsWith('chrome-extension')) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful responses for pages
        if (res.ok && e.request.destination === 'document') {
          const clone = res.clone()
          caches.open(CACHE).then(c => c.put(e.request, clone))
        }
        return res
      })
      .catch(() => caches.match(e.request).then(cached => {
        if (cached) return cached
        // Offline fallback for navigation
        if (e.request.destination === 'document') {
          return caches.match('/') 
        }
      }))
  )
})
