// Travex Campus Service Worker
const CACHE_NAME = 'travex-campus-v1';
const CAMPUS_URLS = [
  '/campus.html',
  '/campus-apply.html',
  '/campus-dashboard.html',
  '/campus-university.html',
  '/campus-manifest.json',
  '/icon-campus-192.svg',
  '/icon-campus-512.svg',
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700;800;900&display=swap',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// Install — cache campus pages
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CAMPUS_URLS).catch(() => {});
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  
  // Only handle campus pages and assets
  const isCampus = url.pathname.includes('campus') || 
    CAMPUS_URLS.some(u => e.request.url.includes(u));
  
  if (!isCampus) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache fresh response
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
