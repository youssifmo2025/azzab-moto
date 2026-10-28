/**
 * Service Worker for AZZAB MOTO PWA
 *
 * Strategies:
 * - Cache-First for static assets (fonts, images, Vite compiled bundles)
 * - Network-First for dynamic / data requests (JSON files, API endpoints)
 * - Navigation Fallback: returns cached page or offline.html when network fails
 */

const CACHE_NAME = 'am-pwa-v1'
const OFFLINE_FALLBACK = '/offline.html'

const STATIC_PRECACHE = [
  '/',
  OFFLINE_FALLBACK,
  '/manifest.webmanifest',
  '/logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_PRECACHE)
    }),
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
          return undefined
        }),
      )
    }),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Only handle GET requests from our origin
  if (request.method !== 'GET' || url.origin !== location.origin) {
    return
  }

  // 1. Navigation requests (HTML pages): Network-first with offline.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
          return cachedResponse
        }
        return cache.match(OFFLINE_FALLBACK)
      }),
    )
    return
  }

  // 2. Data requests (JSON files): Network-first with cache fallback
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, response.clone())
          }
          return response
        })
        .catch(async () => {
          const cached = await caches.match(request)
          if (cached) return cached
          throw new Error('Data unavailable offline')
        }),
    )
    return
  }

  // 3. Static assets (assets/, fonts, images, scripts, styles): Cache-First
  if (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(woff2?|ttf|png|jpe?g|svg|css|js)$/)
  ) {
    event.respondWith(
      caches.match(request).then(async (cached) => {
        if (cached) {
          return cached
        }
        const response = await fetch(request)
        if (response.ok) {
          const cache = await caches.open(CACHE_NAME)
          cache.put(request, response.clone())
        }
        return response
      }),
    )
    return
  }

  // Default: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then(async (networkResponse) => {
          if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME)
            cache.put(request, networkResponse.clone())
          }
          return networkResponse
        })
        .catch(() => cached)

      return cached || fetchPromise
    }),
  )
})
