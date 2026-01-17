// Custom Service Worker for Web Push Notifications
// This file extends the Angular Service Worker with custom notification handling

// Import the Angular Service Worker
importScripts('./ngsw-worker.js');

// Listen for notification click events
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag);
  
  event.notification.close();

  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Handle notification close events (optional)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
