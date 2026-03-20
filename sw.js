// Workout App Service Worker
// Version + image list injected at build time
const CACHE = 'workout-app-v1774005528283'
const PRECACHE_IMAGES = ["/workout/assets/assets/Workout%20Images/Bench_Press.03728d4d81670930c321ddf5bf256684.png","/workout/assets/assets/Workout%20Images/Incline_Dumbbell_Press.5b09e27a8753da0beb082ed7531535e9.png","/workout/assets/assets/Workout%20Images/Lateral_Raises.88348c3e6f768d0afe474803d4fb75ca.png","/workout/assets/assets/Workout%20Images/Seated_Shoulder_Press.3eb40a8b2cc2a4ade09e699c363b2274.png","/workout/assets/assets/Workout%20Images/Triceps_Pushdown.dc66a790b42720fd47728128b332f111.png"]

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

// Message: schedule or cancel a rest-complete notification from the main thread
let notifTimer = null
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATION') {
    clearTimeout(notifTimer)
    const delay = Math.max(0, e.data.endTime - Date.now())
    e.waitUntil(new Promise((resolve) => {
      notifTimer = setTimeout(() => {
        self.registration.showNotification('Rest complete!', {
          body: 'Time to get back to it 💪',
          icon: '/workout/apple-touch-icon.png',
          tag: 'rest-complete',
        }).then(resolve).catch(resolve)
      }, delay)
    }))
  } else if (e.data?.type === 'CANCEL_NOTIFICATION') {
    clearTimeout(notifTimer)
  }
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
