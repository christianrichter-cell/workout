// Workout App Service Worker
// Version is injected at build time — changing it forces all clients to refresh
const CACHE = 'workout-app-v1774002244928'

// Install: activate immediately without waiting
self.addEventListener('install', () => {
  self.skipWaiting()
})

// Activate: delete old caches and claim clients silently (no forced reload)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// Fetch: network first, fall back to cache
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone()
        caches.open(CACHE).then((cache) => cache.put(e.request, clone))
        return response
      })
      .catch(() => caches.match(e.request))
  )
})
