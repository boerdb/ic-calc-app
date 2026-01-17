// This service worker imports the Angular Service Worker and adds push handlers.
// It must be registered at the site root (e.g. register('/push-worker.js')).
try {
  importScripts('ngsw-worker.js');
} catch (e) {
  // ngsw-worker may not exist in dev builds; still continue to add push handlers
  console.warn('Could not import ngsw-worker.js', e);
}

self.addEventListener('push', function (event) {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Notification', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: data.icon || '/assets/icons/icon-192-V2.png',
    badge: data.badge || '/assets/icons/icon-192-V2.png',
    data: data
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window' }).then(windowClients => {
    for (let i = 0; i < windowClients.length; i++) {
      const client = windowClients[i];
      if (client.url === url && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(url);
  }));
});
