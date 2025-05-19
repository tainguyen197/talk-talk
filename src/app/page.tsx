import TodayTopic from "@/components/learning/TodayTopic";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <main className="flex-1 overflow-hidden">
        <TodayTopic />
      </main>
    </div>
  );
}
