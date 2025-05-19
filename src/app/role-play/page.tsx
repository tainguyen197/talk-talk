"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

export default function RolePlay() {
  const router = useRouter();
  const [topic, setTopic] = useState<{
    id: number;
    title: string;
    description: string;
  } | null>(null);
  const [messages, setMessages] = useState<
    Array<{ text: string; sender: "user" | "ai" }>
  >([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // Get current topic from localStorage
    const savedTopic = localStorage.getItem("currentTopic");
    if (!savedTopic) {
      // If no topic is found, redirect to home
      router.push("/");
      return;
    }

    const topicData = JSON.parse(savedTopic);
    setTopic(topicData);

    // Initialize the conversation based on the topic
    const initialMessage = getInitialMessage(topicData.title);
    setMessages([{ text: initialMessage, sender: "ai" }]);
  }, [router]);

  const getInitialMessage = (topicTitle: string) => {
    switch (topicTitle) {
      case "Shopping for Clothes":
        return "Hi there! I'm a store assistant at a clothing shop. How can I help you today?";
      case "Ordering Food at a Restaurant":
        return "Good evening and welcome to our restaurant! I'll be your server today. Would you like to start with something to drink?";
      case "Asking for Directions":
        return "Hi there! You look a bit lost. Can I help you find something?";
      case "Making Small Talk":
        return "Hi! Nice weather we're having today, isn't it?";
      case "Job Interview":
        return "Good morning! Thanks for coming in today. Could you start by telling me a little about yourself?";
      default:
        return `Welcome to our role play about "${topicTitle}". Let's start our conversation!`;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { text: inputMessage, sender: "user" as const };
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/role-play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          userMessage: inputMessage,
          conversation: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await response.json();

      setMessages((prev) => [...prev, { text: data.response, sender: "ai" }]);

      // Check if we should end the conversation (after a certain number of exchanges)
      if (messages.length >= 8) {
        setIsCompleted(true);
        updateStreak();
      }
    } catch (error) {
      console.error("Error generating response:", error);
      // Fallback response in case of error
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm sorry, I couldn't understand. Could you please try again?",
          sender: "ai",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStreak = () => {
    const savedStreak = localStorage.getItem("streak") || "0";
    const newStreak = parseInt(savedStreak) + 1;
    localStorage.setItem("streak", newStreak.toString());
    localStorage.setItem("lastPracticeDate", new Date().toDateString());
    // Set the progress to 100% for the day's goal
    localStorage.setItem("dailyProgress", "100");
  };

  const handleFinish = () => {
    updateStreak();
    router.push("/");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full overflow-hidden">
        {topic && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Role Play: {topic.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice natural conversation by responding to the prompts.
            </p>
          </div>
        )}

        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">Typing...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {isCompleted ? (
          <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg text-center">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Great job! Practice completed.
            </h2>
            <p className="text-green-700 dark:text-green-400 mb-4">
              You&apos;ve successfully practiced a conversation about{" "}
              {topic?.title}.
            </p>
            <button
              onClick={handleFinish}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Back to Today&apos;s Topic
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your response..."
              disabled={isLoading || isCompleted}
              className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim() || isCompleted}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg"
            >
              <SendIcon />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function SendIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
  );
}
