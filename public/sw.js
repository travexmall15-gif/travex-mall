// ShopNekt — Service Worker v3
// Strategy: Cache ONLY static assets. NEVER cache HTML or API responses.
// This prevents stale UI completely.

const CACHE_VERSION = 'shopnekt-static-v3'
const STATIC_EXTS   = ['.png','.jpg','.jpeg','.gif','.svg','.ico','.webp','.avif','.woff','.woff2','.ttf','.otf']

// Install — cache nothing automatically (we'll cache on-demand)
self.addEventListener('install', () => self.skipWaiting())

// Activate — delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Fetch — only intercept static asset requests
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // NEVER intercept: HTML, API, Next.js data, Supabase
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname !== self.location.hostname
  ) return

  // Only cache static assets (images, fonts)
  const isStaticAsset = STATIC_EXTS.some(ext => url.pathname.endsWith(ext)) ||
                        url.pathname.startsWith('/_next/static/')

  if (!isStaticAsset) {
    // HTML and other requests: Network-only, no caching
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then(r => r || new Response('Offline', { status: 503 }))
      )
    )
    return
  }

  // Static assets: Cache-first (they have hashed filenames so always fresh)
  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached
        return fetch(event.request).then(response => {
          if (response.ok) cache.put(event.request, response.clone())
          return response
        })
      })
    )
  )
})

// Force update: when SW activates, notify all clients to reload
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})
