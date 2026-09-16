const CACHE_NAME = 'vsb-aids-portal-v11'
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
  '/screenshot-mobile.png',
  '/sounds/quantum.wav',
  '/sounds/bloom.wav',
  '/sounds/cyber.wav',
  '/sounds/marimba.wav',
  '/sounds/zen.wav'
]

// Listen for skip waiting message from app updater
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// Install event - caching shell assets resiliently
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        STATIC_ASSETS.map((asset) =>
          cache.add(asset).catch((err) => {
            console.debug('[SW] Asset precache note:', asset, err)
          })
        )
      )
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
  const origin = self.location.origin
  let data = {
    title: 'Digital Portal of AI&DS',
    body: 'New real-time announcement received.',
    icon: origin + '/icon-192.png',
    badge: origin + '/icon-192.png',
    data: { url: '/dashboard/notifications' }
  }

  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data.body = event.data.text()
    }
  }

  const iconUrl = data.icon ? (data.icon.startsWith('http') ? data.icon : origin + data.icon) : (origin + '/college-emblem.png')
  const badgeUrl = data.badge ? (data.badge.startsWith('http') ? data.badge : origin + data.badge) : (origin + '/notification-badge.png')
  const notifTag = data.tag || (data.id ? ('vsb-notif-' + data.id) : 'vsb-portal-announcements')

  const options = {
    body: data.body,
    icon: iconUrl,
    badge: badgeUrl,
    vibrate: [200, 100, 200, 100, 200],
    sound: origin + '/sounds/quantum.wav',
    silent: false,
    timestamp: Date.now(),
    data: data.data || { url: '/dashboard/notifications' },
    tag: notifTag,
    renotify: true,
    requireInteraction: false,
    actions: [
      { action: 'open', title: 'Open Portal' }
    ]
  }

  const showNotifPromise = self.registration.showNotification(data.title || 'Digital Portal of AI&DS', options)

  // Notify any active clients/tabs in the foreground to refresh their alerts
  const notifyClientsPromise = clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
    for (const client of clientList) {
      client.postMessage({ type: 'PUSH_NOTIFICATION_RECEIVED', payload: data })
    }
  }).catch(() => {})

  event.waitUntil(Promise.all([showNotifPromise, notifyClientsPromise]))
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
          if ('navigate' in client) {
            client.navigate(targetUrl)
          }
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
  if (url.pathname.startsWith('/api/') || !url.protocol.startsWith('http')) return

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch(() => {})
          }).catch(() => {})
        }
        return response
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request)
        if (cachedResponse) return cachedResponse

        if (event.request.headers.get('accept')?.includes('text/html')) {
          const loginFallback = await caches.match('/login')
          if (loginFallback) return loginFallback
        }

        return new Response('Network request failed', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        })
      })
  )
})

// Listen for SKIP_WAITING message from client to instantly activate new version
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
