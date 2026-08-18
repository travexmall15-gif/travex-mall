// ShopNekt — Service Worker v5
// Strategy: Cache ONLY static assets. HTML is always network-first.
// v5: Do NOT redirect to offline page - keep current page visible with network status notification

const CACHE_VERSION = 'shopnekt-static-v5'
const STATIC_EXTS   = ['.png','.jpg','.jpeg','.gif','.svg','.ico','.webp','.avif','.woff','.woff2','.ttf','.otf']

// Install — no pre-caching needed (offline page removed)
self.addEventListener('install', event => {
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
  ) return

  const isStatic = STATIC_EXTS.some(ext => url.pathname.endsWith(ext)) ||
                   url.pathname.startsWith('/_next/static/')

  if (isStatic) {
    // Static assets: cache-first (hashed filenames = always fresh)
    event.respondWith(
      caches.open(CACHE_VERSION).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached
          return fetch(event.request).then(res => {
            if (res.ok) cache.put(event.request, res.clone())
            return res
          }).catch(() => {
            // Return a minimal placeholder for failed static assets
            return new Response('', { status: 404 })
          })
        }).catch(() => {
          return new Response('', { status: 404 })
        })
      )
    )
  } else {
    // HTML pages: network-first, but do NOT redirect to offline page
    // Let the app handle offline state via network status notification
    event.respondWith(
      fetch(event.request).catch(() => {
        // Return a minimal response that allows the app shell to load
        // The app will show network status notification instead of redirecting
        return new Response(
          '<!DOCTYPE html><html><head><meta charset="utf-8"><title>Offline</title></head><body></body></html>',
          { status: 200, headers: { 'Content-Type': 'text/html' } }
        )
      })
    )
  }
})

self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})
