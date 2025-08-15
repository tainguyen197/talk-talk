import TodayTopic from "@/components/learning/TodayTopic";
import PWAInstall from "@/components/PWAInstall";
import PWANotification from "@/components/PWANotification";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <main className="flex-1 overflow-hidden">
        <TodayTopic />
        <PWAInstall />
        <PWANotification />
      </main>
    </div>
  );
}
