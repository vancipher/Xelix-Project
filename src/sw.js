// sw v6 — network-first when online (same idea as afterain.dev) + offline precache
import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst } from 'workbox-strategies';

const runtimeStrategy = new NetworkFirst({
  cacheName: 'afterbreak-runtime',
  networkTimeoutSeconds: 10,
});

registerRoute(
  ({ request, url }) => request.method === 'GET' && url.origin === self.location.origin,
  runtimeStrategy,
);

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    await clientsClaim();
    // Drop any leftover notifications tagged under the old Xelix app
    try {
      const legacy = await self.registration.getNotifications({ tag: 'xelix-event' });
      legacy.forEach((n) => n.close());
    } catch { /* ignore */ }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json() ?? {}; } catch { data = { title: 'After Break', body: event.data?.text() }; }

  const title = data.title || 'After Break';
  const options = {
    body: data.body || 'New event posted',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: data.tag || 'afterbreak-event',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
