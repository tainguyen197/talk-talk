"use client";

import { useState } from "react";
import { sendTestNotification } from "./PWANotification";

export default function NotificationTester() {
  const [notificationTitle, setNotificationTitle] = useState("Test Notification");
  const [notificationBody, setNotificationBody] = useState("This is a test notification from Talk Talk!");
  
  const handleSendNotification = () => {
    sendTestNotification(notificationTitle, notificationBody);
  };

  return (
    <div className="fixed top-20 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-medium mb-2">Test Notifications</h3>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={notificationTitle}
            onChange={(e) => setNotificationTitle(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <input
            type="text"
            value={notificationBody}
            onChange={(e) => setNotificationBody(e.target.value)}
            className="w-full px-3 py-2 border rounded-md text-sm"
          />
        </div>
        <button
          onClick={handleSendNotification}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow transition-colors"
        >
          Send Test Notification
        </button>
      </div>
    </div>
  );
}
