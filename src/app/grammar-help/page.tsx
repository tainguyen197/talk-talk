"use client";

import { useState } from "react";
import Header from "@/components/Header";

export default function GrammarHelp() {
  const [inputText, setInputText] = useState("");
  const [translation, setTranslation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [followUpAnswer, setFollowUpAnswer] = useState("");

  const handleTranslate = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setTranslation("");
    setExplanation("");
    setFollowUpAnswer("");

    try {
      // This would be replaced with an actual API call to OpenAI
      // For demonstration, we'll simulate a response
      setTimeout(() => {
        if (inputText.includes("Tôi mới làm nó hôm qua")) {
          setTranslation("I just did it yesterday");
          setExplanation(
            "This sentence uses the simple past tense ('did') because it refers to a completed action that happened at a specific time in the past (yesterday). In English, when you mention a specific time in the past, you typically use the simple past tense."
          );
        } else {
          // Simulate a translation for any other input
          setTranslation("English translation would appear here");
          setExplanation(
            "The grammar explanation would be provided here, explaining why certain tenses or structures are used in the English translation."
          );
        }
        setIsLoading(false);
      }, 1500);

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
      setIsLoading(false);
    }
  };

  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim()) return;

    setIsLoading(true);
    setFollowUpAnswer("");

    try {
      // This would be replaced with an actual API call
      setTimeout(() => {
        if (followUpQuestion.includes("Why using 'did' here?")) {
          setFollowUpAnswer(
            "The word 'did' is used here because it's the past tense form of 'do'. Since the action happened yesterday (in the past), we need to use the past tense. 'Did' is used for all subjects (I, you, he, she, etc.) in the simple past tense."
          );
        } else if (followUpQuestion.includes("Can I say 'I have done it'?")) {
          setFollowUpAnswer(
            "Yes, you can say 'I have done it', but it would have a slightly different meaning. 'I have done it' uses the present perfect tense and would suggest that the action was completed at some unspecified time in the past with a connection to the present. 'I just did it yesterday' is more specific about when the action happened."
          );
        } else {
          setFollowUpAnswer(
            "Your question about the grammar would be answered here with a clear explanation about the specific aspect you're asking about."
          );
        }
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      console.error("Error processing follow-up:", error);
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
              <input
                type="text"
                value={followUpQuestion}
                onChange={(e) => setFollowUpQuestion(e.target.value)}
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
