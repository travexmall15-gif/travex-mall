// ShopNekt — Service Worker v4
// Strategy: Cache ONLY static assets. HTML is always network-first.
// v4: proper offline page fallback instead of plain text

const CACHE_VERSION = 'shopnekt-static-v4'
const OFFLINE_URL   = '/offline.html'
const STATIC_EXTS   = ['.png','.jpg','.jpeg','.gif','.svg','.ico','.webp','.avif','.woff','.woff2','.ttf','.otf']

// Install — pre-cache the offline page only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.add(OFFLINE_URL))
  )
  self.skipWaiting()
})

// Activate — delete ALL old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

// Fetch — network-first for HTML, cache-first for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)

  // Never intercept: non-GET, API, Next.js data, Supabase, external
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.hostname.includes('supabase.co') ||
    url.hostname !== self.location.hostname
  ) {return}

  const isStatic = STATIC_EXTS.some(ext => url.pathname.endsWith(ext)) ||
                   url.pathname.startsWith('/_next/static/')

  if (isStatic) {
    // Static assets: cache-first (hashed filenames = always fresh)
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) {return cached}
          return fetch(event.request).then(res => {
            if (res.ok) {cache.put(event.request, res.clone())}
            return res
          })
        })
      )
    )
  } else {
    // HTML pages: network-first, offline page on failure
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cached = await caches.match(OFFLINE_URL)
        return cached || new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline — ShopNekt</title><style>*{box-sizing:border-box;margin:0}body{font-family:Inter,sans-serif;background:#050B2E;color:#fff;min-height:100vh;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:1rem;text-align:center;padding:2rem}.logo{font-size:1.4rem;font-weight:900;letter-spacing:-.03em}span{color:#C9A84C}h1{font-size:1.2rem;font-weight:700}p{font-size:.85rem;color:rgba(255,255,255,.55);line-height:1.7;max-width:340px}.btn{background:#C9A84C;color:#050B2E;padding:.7rem 1.6rem;border-radius:999px;font-weight:700;text-decoration:none;font-size:.85rem;margin-top:.5rem}</style></head><body><div class="logo">SHOP<span>NEKT</span></div><h1>You are offline</h1><p>Check your internet connection and try again. Your data is safe.</p><a class="btn" onclick="location.reload()">Try Again</a></body></html>',
          { status: 503, headers: { 'Content-Type': 'text/html' } }
        )
      })
    )
  }
})

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {self.skipWaiting()}
})
