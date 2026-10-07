// ---- PWA app-shell caching ----
// Lets the site/admin install like a native app on mobile.
//
// Rules (fixed): every PAGE load goes to the network first, so a refresh
// always shows the latest deployed version. The old version served most
// pages (e.g. /patient-dashboard, /about) from cache forever, so visitors
// kept seeing an old build after every deploy. Only Vite's hashed build
// files (/assets/*, which never change once built) are cache-first; other
// static files are refreshed in the background.
const CACHE_NAME = 'usha-shell-v2'
const SHELL_ASSETS = [
  '/manifest.json',
  '/usha-dental-logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

function isPageRequest(req, url) {
  return req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html') ||
    url.pathname.endsWith('.html')
}

function putInCache(req, res) {
  if (res && res.ok && res.type === 'basic') {
    const copy = res.clone()
    caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy) })
  }
  return res
}

self.addEventListener('fetch', function(event) {
  const req = event.request
  const url = new URL(req.url)

  // Never intercept Supabase / third-party API calls or non-GET requests.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return
  // Let the browser fetch the service worker itself normally.
  if (url.pathname === '/sw.js') return

  // Pages: network first (always fresh), cached copy only when offline.
  if (isPageRequest(req, url)) {
    event.respondWith(
      fetch(req).then(function (res) { return putInCache(req, res) }).catch(function () {
        return caches.match(req).then(function (cached) { return cached || caches.match('/') })
      })
    )
    return
  }

  // Hashed build files never change -> cache first is safe and fast.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (res) { return putInCache(req, res) })
      })
    )
    return
  }

  // Everything else (images, manifest, icons): serve cached copy if any,
  // but always refresh it in the background.
  event.respondWith(
    caches.match(req).then(function (cached) {
      const network = fetch(req).then(function (res) { return putInCache(req, res) }).catch(function () { return cached })
      return cached || network
    })
  )
})

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'New appointment request',
    icon: '/usha-dental-logo.png',
    badge: '/usha-dental-logo.png',
    vibrate: [200, 100, 200],
    data: { url: data.url || '/admin/appointments' },
    actions: [
      { action: 'view', title: 'View Appointment' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  }
  event.waitUntil(self.registration.showNotification(data.title || 'Mind Motion Matrix', options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  if (event.action === 'view' || !event.action) {
    event.waitUntil(clients.openWindow(event.notification.data.url || '/admin/appointments'))
  }
})

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
))
self.addEventListener('activate', e => e.waitUntil(
  caches.keys()
    .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
    .then(() => self.clients.claim())
))
