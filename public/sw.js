const CACHE_NAME = 'vsb-aids-portal-v3'
const STATIC_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/college-emblem.png',
  '/icon-192.png',
  '/icon-512.png',
  '/maskable-icon-192.png',
  '/maskable-icon-512.png',
  '/shortcut-icon-96.png',
  '/apple-touch-icon.png',
  '/screenshot-desktop.png',
  '/screenshot-mobile.png'
]

// Install event - caching shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => self.skipWaiting())
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Background Sync API
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-attendance' || event.tag === 'sync-messages' || event.tag === 'background-sync') {
    event.waitUntil(
      fetch('/api/announcements')
        .then((res) => res.json())
        .catch(() => Promise.resolve())
    )
  }
})

// Periodic Background Sync API
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'get-latest-announcements' || event.tag === 'update-timetable' || event.tag === 'periodic-sync') {
    event.waitUntil(
      fetch('/api/announcements')
        .then((res) => res.json())
        .catch(() => Promise.resolve())
    )
  }
})

// Push Notification Event (Web Push API)
self.addEventListener('push', (event) => {
  let data = {
    title: 'V.S.B. AI & DS Department Alert',
    body: 'New real-time announcement received.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: '/dashboard/notifications' }
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    data: data.data || { url: '/dashboard/notifications' },
    actions: [
      { action: 'open', title: 'Open Portal' },
      { action: 'close', title: 'Dismiss' }
    ],
    tag: 'vsb-notification-' + Date.now(),
    renotify: true
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Notification Click Event - open or focus application tab
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'close') return

  const targetUrl = event.notification.data?.url || '/dashboard/notifications'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl)
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl)
      }
    })
  )
})

// Fetch event - network first with cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) return cachedResponse
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/login')
          }
        })
      })
  )
})
