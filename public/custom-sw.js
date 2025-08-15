// This file will be merged with the Workbox-generated service worker

// Listen for push events
self.addEventListener("push", function (event) {
  if (event.data) {
    // Parse the data payload from the push notification
    const data = event.data.json();

    // Show a notification with the data
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        vibrate: [200, 100, 200],
        data: data.url ? { url: data.url } : null,
      })
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  // If the notification has a URL, open it
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  } else {
    // Otherwise, focus or open the main app window
    event.waitUntil(
      clients.matchAll({ type: "window" }).then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i];
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
    );
  }
});
