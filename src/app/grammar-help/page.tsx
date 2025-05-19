"use client";

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import Header from "@/components/Header";

export default function GrammarHelp() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");
  const [error, setError] = useState("");
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState("");
  const followUpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch question suggestions when translation and explanation are available
    if (translation && explanation && !isLoading) {
      fetchQuestionSuggestions();
    }
  }, [translation, explanation, isLoading]);

  const fetchQuestionSuggestions = async () => {
    try {
      const response = await fetch("/api/grammar/suggest-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalText: inputText,
          translation,
          explanation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching suggestions:", errorData);
        return;
      }

      const data = await response.json();
      if (data.questions && Array.isArray(data.questions)) {
        setSuggestedQuestions(data.questions);
        setSelectedSuggestion(data.questions[0] || "");
      }
    } catch (error) {
      console.error("Error fetching question suggestions:", error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && selectedSuggestion) {
      e.preventDefault();
      setFollowUpQuestion(selectedSuggestion);
    }
  };

  const handleSuggestionClick = (question: string) => {
    setFollowUpQuestion(question);
    if (followUpInputRef.current) {
      followUpInputRef.current.focus();
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setTranslation("");
    setExplanation("");
    setFollowUpAnswer("");
    setError("");
    setSuggestedQuestions([]);
    setSelectedSuggestion("");

    try {
      const response = await fetch("/api/grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to translate");
      }

      if (data.translation && data.explanation) {
        setTranslation(data.translation);
        setExplanation(data.explanation);
      } else {
        throw new Error("Invalid response format");
      }

      // Record the grammar help usage for daily progress
      const today = new Date().toDateString();
      const lastPracticeDate = localStorage.getItem("lastPracticeDate");
      const currentProgress = parseInt(
        localStorage.getItem("dailyProgress") || "0"
      );

      // If it's a new day, update the streak
      if (
        !lastPracticeDate ||
        new Date(lastPracticeDate).toDateString() !== today
      ) {
        // Check if the streak can be continued (was practiced yesterday)
        const savedStreak = localStorage.getItem("streak") || "0";
        let newStreak = parseInt(savedStreak);

        if (
          lastPracticeDate &&
          new Date(lastPracticeDate).toDateString() ===
            new Date(Date.now() - 86400000).toDateString()
        ) {
          // User practiced yesterday, continue streak
          newStreak += 1;
        } else {
          // Streak broken
          newStreak = 1; // Start a new streak
        }

        localStorage.setItem("streak", newStreak.toString());
        localStorage.setItem("lastPracticeDate", today);
        localStorage.setItem("dailyProgress", "50"); // Grammar help counts as 50% progress
      } else if (currentProgress < 50) {
        // If already practiced today but progress is less than 50%, update it
        localStorage.setItem("dailyProgress", "50");
      }

      // Save to localStorage
      const savedQuestions = JSON.parse(
        localStorage.getItem("grammarQuestions") || "[]"
      );
      savedQuestions.push({
        question: inputText,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(
        "grammarQuestions",
        JSON.stringify(savedQuestions.slice(-10))
      ); // Keep only the last 10
    } catch (error) {
      console.error("Error translating:", error);
      setError((error as Error).message || "Failed to translate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim() || !inputText || !translation) return;

    setIsLoading(true);
    setFollowUpAnswer("");
    setError("");

    try {
      const response = await fetch("/api/grammar/follow-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalText: inputText,
          translation: translation,
          question: followUpQuestion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get answer");
      }

      setFollowUpAnswer(data.answer);
    } catch (error) {
      console.error("Error processing follow-up:", error);
      setError((error as Error).message || "Failed to get answer");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Grammar Help</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type in Vietnamese
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., Tôi mới làm nó hôm qua"
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[100px]"
          />
          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isLoading ? "Translating..." : "Translate & Explain"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {translation && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                English Translation
              </h2>
              <p className="text-blue-600 dark:text-blue-400 font-medium">
                {translation}
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Grammar Explanation
              </h2>
              <p className="text-gray-600 dark:text-gray-300">{explanation}</p>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ask a follow-up question
              </label>

              {suggestedQuestions.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Suggested questions (click to select or press Tab to use the
                    highlighted one):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestionClick(question)}
                        className={`text-xs py-1 px-2 rounded-full ${
                          question === selectedSuggestion
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <input
                ref={followUpInputRef}
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Why using did here? or Can I say I have done it?"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
              <button
                onClick={handleFollowUpQuestion}
                disabled={isLoading || !followUpQuestion.trim()}
                className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
              >
                {isLoading ? "Processing..." : "Ask"}
              </button>
            </div>

            {followUpAnswer && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-700 dark:text-gray-300">
                  {followUpAnswer}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
