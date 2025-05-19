"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Topic {
  id: number;
  title: string;
  description: string;
}

interface Question {
  id: number;
  text: string;
  answer?: string;
}

export default function SpeakingQuiz() {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get current topic from localStorage
    const savedTopic = localStorage.getItem("currentTopic");
    if (!savedTopic) {
      // If no topic is found, redirect to home
      router.push("/");
      return;
    }

    const topicData = JSON.parse(savedTopic) as Topic;
    setTopic(topicData);

    // Generate questions based on the topic
    setQuestions(generateQuestions(topicData.title));
  }, [router]);

  const generateQuestions = (topicTitle: string): Question[] => {
    // In a real app, these would be dynamically generated via OpenAI API
    // For demo purposes, we'll use static questions

    switch (topicTitle) {
      case "Shopping for Clothes":
        return [
          { id: 1, text: "How would you ask about the size of a shirt?" },
          { id: 2, text: "How would you ask about the price of an item?" },
          { id: 3, text: "How would you ask to try on a piece of clothing?" },
          {
            id: 4,
            text: "How would you ask for a different color of the same item?",
          },
          {
            id: 5,
            text: "How would you politely decline if you don't want to buy something?",
          },
        ];
      case "Ordering Food at a Restaurant":
        return [
          { id: 1, text: "How would you ask for a menu?" },
          { id: 2, text: "How would you order your main dish?" },
          { id: 3, text: "How would you ask about the ingredients in a dish?" },
          { id: 4, text: "How would you ask for the check?" },
          { id: 5, text: "How would you compliment the food to your server?" },
        ];
      default:
        return [
          {
            id: 1,
            text: `For the topic "${topicTitle}", how would you start a conversation?`,
          },
          { id: 2, text: `What questions would you ask about ${topicTitle}?` },
          {
            id: 3,
            text: `How would you express your opinion about ${topicTitle}?`,
          },
          {
            id: 4,
            text: `How would you respond to someone who disagrees with you about ${topicTitle}?`,
          },
          {
            id: 5,
            text: `How would you end a conversation about ${topicTitle}?`,
          },
        ];
    }
  };

  const handleNextQuestion = () => {
    if (!userAnswer.trim()) return;

    // Save the answer
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex].answer = userAnswer;
    setQuestions(updatedQuestions);

    // Generate feedback (in a real app, this would use AI)
    setIsLoading(true);

    setTimeout(() => {
      // Simple feedback for demo purposes
      const feedbackOptions = [
        "Good answer! Your pronunciation is clear.",
        "Well done! Try to speak a bit more slowly next time.",
        "Nice job! Try using more varied vocabulary.",
        "Great! Your grammar is correct, just work on your intonation.",
        "Excellent answer! Very natural response.",
      ];

      setFeedback(
        feedbackOptions[Math.floor(Math.random() * feedbackOptions.length)]
      );
      setIsLoading(false);

      // Check if this was the last question
      if (currentQuestionIndex < questions.length - 1) {
        // Move to next question after a short delay
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setUserAnswer("");
          setFeedback("");
        }, 2000);
      } else {
        // All questions completed
        setIsCompleted(true);
        updateStreak();
      }
    }, 1500);
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
    router.push("/");
  };

  const startVoiceRecording = () => {
    // In a real app, this would access the microphone and process speech
    // For demo purposes, we'll simulate speech recognition

    setIsLoading(true);

    setTimeout(() => {
      // Simulate a response based on the current question
      const simulatedResponses: { [key: string]: string } = {
        "How would you ask about the size of a shirt?":
          "Do you have this shirt in medium?",
        "How would you ask about the price of an item?":
          "How much does this cost?",
        "How would you ask to try on a piece of clothing?":
          "Can I try this on, please?",
        "How would you ask for the check?": "Could I have the check, please?",
        "How would you ask for a menu?": "Could I see the menu, please?",
      };

      const currentQuestion = questions[currentQuestionIndex].text;
      const defaultResponse =
        "I would like to [answer related to the question]";

      setUserAnswer(simulatedResponses[currentQuestion] || defaultResponse);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 flex flex-col p-4 max-w-xl mx-auto w-full overflow-hidden">
        {topic && (
          <div className="mb-4">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Speaking Quiz: {topic.title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Practice speaking by answering the questions.
            </p>
          </div>
        )}

        {!isCompleted ? (
          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) / questions.length) * 100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>

              {questions.length > 0 && (
                <h2 className="text-lg font-semibold mb-6">
                  {questions[currentQuestionIndex].text}
                </h2>
              )}

              <div className="space-y-4">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here, or use voice input..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[120px]"
                  disabled={isLoading}
                />

                <div className="flex space-x-2">
                  <button
                    onClick={startVoiceRecording}
                    disabled={isLoading}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                  >
                    <MicrophoneIcon className="mr-2" />
                    Voice Input
                  </button>

                  <button
                    onClick={handleNextQuestion}
                    disabled={isLoading || !userAnswer.trim()}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                  >
                    {currentQuestionIndex < questions.length - 1
                      ? "Next Question"
                      : "Finish Quiz"}
                  </button>
                </div>
              </div>

              {feedback && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 rounded-lg">
                  <p className="text-blue-700 dark:text-blue-300">{feedback}</p>
                </div>
              )}

              {isLoading && (
                <div className="mt-4 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    Processing...
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 dark:bg-green-900 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Congratulations! Quiz completed.
            </h2>
            <p className="text-green-700 dark:text-green-400 mb-6">
              You&apos;ve successfully answered all the questions about{" "}
              {topic?.title}.
            </p>

            <div className="space-y-4 mb-6">
              {questions.map((question, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 text-left"
                >
                  <p className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                    {question.text}
                  </p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Your answer: {question.answer}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Back to Today&apos;s Topic
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function MicrophoneIcon({ className = "" }) {
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
      className={className}
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
      <line x1="12" y1="19" x2="12" y2="22"></line>
    </svg>
  );
}
