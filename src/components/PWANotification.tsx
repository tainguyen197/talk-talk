"use client";

import { useEffect, useState } from "react";

interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
}

export default function PWANotification() {
  const [permissionState, setPermissionState] =
    useState<NotificationPermissionState>({
      permission: "default",
      supported: false,
    });
  const [showNotificationButton, setShowNotificationButton] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    if (isSupported) {
      setPermissionState({
        permission: Notification.permission,
        supported: true,
      });

      // Only show the notification button if permission is not granted yet
      setShowNotificationButton(Notification.permission !== "granted");
    }
  }, []);

  const handleEnableNotifications = async () => {
    try {
      // Request permission
      const permission = await Notification.requestPermission();

      setPermissionState({
        permission,
        supported: true,
      });

      if (permission === "granted") {
        // Subscribe to push notifications
        const registration = await navigator.serviceWorker.ready;

        // Check if push subscription is supported
        if ("pushManager" in registration) {
          // You would typically send this subscription to your server
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              // Replace with your VAPID public key when you set up a push service
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
            ),
          });

          // Example notification to confirm subscription
          showNotification(
            "Notifications enabled!",
            "You'll now receive notifications from Talk Talk."
          );

          setShowNotificationButton(false);
        }
      }
    } catch (error) {
      console.error("Error enabling notifications:", error);
    }
  };

  // Helper function to convert base64 to Uint8Array for VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Function to show a notification
  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          // vibrate: [200, 100, 200],
          tag: "talk-talk-notification",
        });
      });
    }
  };

  if (!permissionState.supported || !showNotificationButton) return null;

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <button
        onClick={handleEnableNotifications}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"
            clipRule="evenodd"
          />
        </svg>
        Enable Notifications
      </button>
    </div>
  );
}

// Helper function to send a test notification
export function sendTestNotification(title: string, body: string) {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        body,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        // vibrate: [200, 100, 200],
        tag: "talk-talk-notification",
      });
    });
  }
}
