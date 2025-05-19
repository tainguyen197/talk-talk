"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "../Header";

const topics = [
  {
    id: 1,
    title: "Shopping for Clothes",
    description:
      "Practice vocabulary and phrases used when shopping for clothes, asking about sizes, colors, and prices.",
  },
  {
    id: 2,
    title: "Ordering Food at a Restaurant",
    description:
      "Learn how to order food, make special requests, and ask about menu items.",
  },
  {
    id: 3,
    title: "Asking for Directions",
    description:
      "Practice asking for and giving directions to various places in a city.",
  },
  {
    id: 4,
    title: "Making Small Talk",
    description:
      "Learn common phrases and questions for casual conversations with new acquaintances.",
  },
  {
    id: 5,
    title: "Job Interview",
    description:
      "Practice answering common job interview questions and discussing your qualifications.",
  },
];

export default function TodayTopic() {
  const router = useRouter();
  const [topic, setTopic] = useState<(typeof topics)[0] | null>(null);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem("streak");
    const lastPracticeDate = localStorage.getItem("lastPracticeDate");
    const today = new Date().toDateString();

    if (savedStreak) {
      // Check if the streak is still valid (user practiced yesterday)
      if (
        lastPracticeDate &&
        new Date(lastPracticeDate).toDateString() ===
          new Date(Date.now() - 86400000).toDateString()
      ) {
        setStreak(parseInt(savedStreak));
      } else if (
        lastPracticeDate &&
        new Date(lastPracticeDate).toDateString() === today
      ) {
        // User already practiced today
        setStreak(parseInt(savedStreak));
        setProgress(100);
      } else if (
        lastPracticeDate &&
        new Date(lastPracticeDate).toDateString() !==
          new Date(Date.now() - 86400000).toDateString()
      ) {
        // Streak broken - user didn't practice yesterday
        setStreak(0);
        localStorage.setItem("streak", "0");
      }
    }

    // Get today's topic from localStorage or generate new one
    const savedTopic = localStorage.getItem("currentTopic");
    const topicDate = localStorage.getItem("topicDate");

    if (
      savedTopic &&
      topicDate &&
      new Date(topicDate).toDateString() === today
    ) {
      // Use the saved topic if it's from today
      setTopic(JSON.parse(savedTopic));
    } else {
      // Generate new topic for today
      const randomIndex = Math.floor(Math.random() * topics.length);
      const newTopic = topics[randomIndex];
      setTopic(newTopic);
      localStorage.setItem("currentTopic", JSON.stringify(newTopic));
      localStorage.setItem("topicDate", today);
    }
  }, []);

  const handleStartPractice = () => {
    // Randomly choose between role play and speaking quiz
    const practiceType = Math.random() > 0.5 ? "role-play" : "speaking-quiz";
    router.push(`/${practiceType}`);
  };

  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-xl mx-auto">
        <div className="flex justify-between w-full mb-6">
          <div className="flex items-center">
            <span className="text-orange-500 mr-1">🔥</span>
            <span className="font-semibold">{streak} day streak</span>
          </div>
          <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Today&apos;s Topic
        </h1>

        {topic && (
          <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-3">
              {topic.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {topic.description}
            </p>
            <button
              onClick={handleStartPractice}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Start Practice
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
