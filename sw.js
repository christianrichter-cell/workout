// Workout App Service Worker
// Version + image list injected at build time
const CACHE = 'workout-app-v1774004290394'
const PRECACHE_IMAGES = []

// Install: pre-cache all workout images immediately
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_IMAGES))
  )
})

// Activate: delete old caches and claim clients silently
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  )
})

// Fetch: cache-first for images, network-first for everything else
self.addEventListener('fetch', (e) => {
  const isImage = /\.(png|jpe?g|webp|gif)(\?|$)/i.test(e.request.url)

  if (isImage) {
    // Images have content-hash filenames — safe to serve from cache forever
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached
        return fetch(e.request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(e.request, clone))
          return response
        })
      })
    )
  } else {
    // JS / HTML — network first so updates are picked up
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          const clone = response.clone()
          caches.open(CACHE).then((cache) => cache.put(e.request, clone))
          return response
        })
        .catch(() => caches.match(e.request))
    )
  }
})
