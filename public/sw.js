// Service Worker for Tarık Dilek Erkek Kuaförü PWA
const CACHE_NAME = 'barber-pwa-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
  './pwa-192x192.png',
  './pwa-512x512.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Handle push notifications when page/Safari is closed (background)
self.addEventListener('push', (event) => {
  let data = {
    title: '💈 Yeni Müşteri Randevusu!',
    body: 'Bir müşteri online randevu aldı. İncelemek için tıklayın.',
    icon: './pwa-192x192.png',
    badge: './icon.svg',
    tag: 'barber-appointment-' + Date.now(),
    url: './#admin'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || './pwa-192x192.png',
    badge: './icon.svg',
    vibrate: [300, 100, 300, 100, 500, 100, 300],
    requireInteraction: true, // Keeps notification visible on lock screen until clicked
    data: {
      url: data.url || './#admin',
      appointmentId: data.appointmentId
    },
    actions: [
      { action: 'open', title: 'Randevuyu Aç 📂' },
      { action: 'close', title: 'Kapat ✖' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click when phone screen is locked or app is closed
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || './#admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            appointmentId: event.notification.data && event.notification.data.appointmentId
          });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Message listener to trigger background system notification from client or sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, appointmentId } = event.data;
    self.registration.showNotification(title || '💈 Yeni Müşteri Randevusu!', {
      body: body || 'Online randevu oluşturuldu. İncelemek için dokunun.',
      icon: './pwa-192x192.png',
      badge: './icon.svg',
      vibrate: [300, 100, 300, 100, 500],
      requireInteraction: true,
      data: { url: './#admin', appointmentId },
      actions: [
        { action: 'open', title: 'Randevuyu İncele 📂' },
        { action: 'close', title: 'Tamam ✖' }
      ]
    });
  }
});
