// Service Worker for Makas & Jilet Barbershop
const CACHE_NAME = 'barber-pwa-v2';
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

// Handle push notifications
self.addEventListener('push', (event) => {
  let data = {
    title: 'Yeni Müşteri Randevusu!',
    body: 'Bir müşteri online randevu aldı. İncelemek için tıklayın.',
    icon: './pwa-192x192.png',
    badge: './icon.svg',
    tag: 'barber-appointment-' + Date.now(),
    url: './'
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
    vibrate: [200, 100, 200, 100, 200],
    data: {
      url: data.url || './',
      appointmentId: data.appointmentId
    },
    actions: [
      { action: 'open', title: 'Randevuyu Aç' },
      { action: 'close', title: 'Kapat' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

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

// Message listener to trigger instant local notification from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, appointmentId } = event.data;
    self.registration.showNotification(title || 'Yeni Randevu Talebi!', {
      body: body || 'Online randevu oluşturuldu.',
      icon: '/pwa-192x192.png',
      badge: '/icon.svg',
      vibrate: [200, 100, 200, 100, 200],
      data: { url: '/', appointmentId },
      actions: [
        { action: 'open', title: 'Randevuyu İncele' },
        { action: 'close', title: 'Tamam' }
      ]
    });
  }
});
