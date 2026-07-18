self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'New appointment request',
    icon: '/mind_motion_matrix_navbar_logo.png',
    badge: '/mind_motion_matrix_navbar_logo.png',
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

self.addEventListener('install', e => e.waitUntil(self.skipWaiting()))
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))
