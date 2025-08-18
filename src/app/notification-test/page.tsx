"use client";

import Header from "@/components/Header";
import NotificationTester from "@/components/NotificationTester";
import PWANotification from "@/components/PWANotification";

export default function NotificationTestPage() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 overflow-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notification Testing</h1>
        <p className="mb-8">
          Use this page to test push notifications in your PWA.
        </p>

        {/* Components for notification testing */}
        {/* <PWANotification /> */}
        {/* <NotificationTester /> */}
      </main>
    </div>
  );
}
