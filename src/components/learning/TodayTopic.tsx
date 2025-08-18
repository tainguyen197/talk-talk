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
  const [dailyGoal] = useState("Complete today's practice");

  useEffect(() => {
    // Load streak data from localStorage
    const savedStreak = localStorage.getItem("streak");
    const lastPracticeDate = localStorage.getItem("lastPracticeDate");
    const savedProgress = localStorage.getItem("dailyProgress");
    const today = new Date().toDateString();

    // Set progress if available
    if (
      savedProgress &&
      lastPracticeDate &&
      new Date(lastPracticeDate).toDateString() === today
    ) {
      setProgress(parseInt(savedProgress));
    } else {
      setProgress(0);
    }

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
      } else if (
        lastPracticeDate &&
        new Date(lastPracticeDate).toDateString() !==
          new Date(Date.now() - 86400000).toDateString() &&
        new Date(lastPracticeDate).toDateString() !== today
      ) {
        // Streak broken - user didn't practice yesterday and not today
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
          <div className="flex flex-col items-end">
            <span className="text-xs text-gray-500 mb-1">{dailyGoal}</span>
            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
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

        <div className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-lg shadow-md p-6 border-2 border-purple-200 dark:border-purple-700">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">🎯</span>
            <h2 className="text-xl font-semibold text-purple-600 dark:text-purple-400">
              TOEIC Practice (B2)
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Test your English with AI-generated TOEIC practice questions. 10
            multiple-choice questions focusing on grammar, vocabulary, and
            sentence structure at B2 level.
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full text-xs">
              🤖 AI-Generated
            </span>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-full text-xs">
              📝 Detailed Feedback
            </span>
            <span className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-300 rounded-full text-xs">
              🕹️ Retro Gaming
            </span>
          </div>
          <button
            onClick={() => router.push("/toeic-practice")}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
          >
            Start TOEIC Practice
          </button>
        </div>
      </div>
    </div>
  );
}
