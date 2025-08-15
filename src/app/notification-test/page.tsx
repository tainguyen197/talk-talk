import NotificationTester from "@/components/NotificationTester";
import PWANotification from "@/components/PWANotification";

export default function NotificationTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4">
      <h1 className="text-2xl font-bold mb-4">Notification Testing</h1>
      <p className="mb-8">
        Use this page to test push notifications in your PWA.
      </p>

      {/* Components for notification testing */}
      <PWANotification />
      <NotificationTester />
    </div>
  );
}
