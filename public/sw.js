// ---- PWA app-shell caching ----
// Lets the admin dashboard install like a native app and open instantly on
// mobile. Supabase/API calls always go straight to the network — only the
// static app shell (icons, manifest) is cached, so data is never stale.
const CACHE_NAME = 'usha-admin-shell-v1'
const SHELL_ASSETS = [
  '/manifest.json',
  '/usha-dental-logo.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
]

function isNetworkFirst(url) {
  return url.pathname === '/' || url.pathname.startsWith('/admin') || url.pathname.endsWith('.html')
}

self.addEventListener('fetch', function(event) {
  const req = event.request
  const url = new URL(req.url)

  // Never intercept Supabase / third-party API calls or non-GET requests.
  if (req.method !== 'GET' || url.origin !== self.location.origin) return

  if (isNetworkFirst(url)) {
    event.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy) })
        }
        return res
      }).catch(function () {
        return caches.match(req).then(function (cached) { return cached || caches.match('/index.html') })
      })
    )
    return
  }

  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached
      return fetch(req).then(function (res) {
        if (res.ok) {
          const copy = res.clone()
          caches.open(CACHE_NAME).then(function (cache) { cache.put(req, copy) })
        }
        return res
      })
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
