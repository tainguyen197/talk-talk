"use client";

import { useState, useRef } from "react";
import Header from "@/components/Header";

export default function GrammarHelp() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordedText, setRecordedText] = useState("");
  const [translation, setTranslation] = useState("");
  const [explanation, setExplanation] = useState("");
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        processRecording();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);
    setRecordedText("");
    setTranslation("");
    setExplanation("");

    try {
      // Convert audio to text
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const speechResponse = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!speechResponse.ok) {
        throw new Error("Failed to convert speech to text");
      }

      const speechData = await speechResponse.json();
      const recognizedText = speechData.text;
      setRecordedText(recognizedText);

      // Get translation and grammar explanation
      const grammarResponse = await fetch("/api/grammar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: recognizedText }),
      });

      if (!grammarResponse.ok) {
        throw new Error("Failed to get translation and explanation");
      }

      const grammarData = await grammarResponse.json();
      setTranslation(grammarData.translation);
      setExplanation(grammarData.explanation);

      // Save usage for progress tracking
      const today = new Date().toDateString();
      const lastPracticeDate = localStorage.getItem("lastPracticeDate");
      const currentProgress = parseInt(
        localStorage.getItem("dailyProgress") || "0"
      );

      if (
        !lastPracticeDate ||
        new Date(lastPracticeDate).toDateString() !== today
      ) {
        const savedStreak = localStorage.getItem("streak") || "0";
        let newStreak = parseInt(savedStreak);

        if (
          lastPracticeDate &&
          new Date(lastPracticeDate).toDateString() ===
            new Date(Date.now() - 86400000).toDateString()
        ) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }

        localStorage.setItem("streak", newStreak.toString());
        localStorage.setItem("lastPracticeDate", today);
        localStorage.setItem("dailyProgress", "50");
      } else if (currentProgress < 50) {
        localStorage.setItem("dailyProgress", "50");
      }
    } catch (error) {
      console.error("Error processing recording:", error);
      setError((error as Error).message || "Failed to process recording");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePressToTalk = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const clearResults = () => {
    setRecordedText("");
    setTranslation("");
    setExplanation("");
    setError("");
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 max-w-xl mx-auto w-full">
        <h1 className="text-2xl font-bold text-center mb-8">Grammar Help</h1>

        {/* Press to Talk Button */}
        <div className="flex flex-col items-center mb-8">
          <button
            onClick={handlePressToTalk}
            disabled={isProcessing}
            className={`relative w-32 h-32 rounded-full text-white font-semibold text-lg transition-all duration-200 ${
              isRecording
                ? "bg-red-500 hover:bg-red-600 animate-pulse"
                : isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
            } shadow-lg`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-2"></div>
                <span className="text-sm">Processing...</span>
              </div>
            ) : isRecording ? (
              <div className="flex flex-col items-center">
                <div className="w-6 h-6 bg-white rounded-full mb-2"></div>
                <span className="text-sm">Release to Stop</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <svg
                  className="w-8 h-8 mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Press to Talk</span>
              </div>
            )}
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-4 max-w-xs">
            Speak in Vietnamese and get instant translation with grammar
            explanation
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Results */}
        {(recordedText || translation || explanation) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Results
              </h2>
              <button
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Clear
              </button>
            </div>

            {recordedText && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What you said:
                </h3>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                  {recordedText}
                </p>
              </div>
            )}

            {translation && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  English Translation:
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                  {translation}
                </p>
              </div>
            )}

            {explanation && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grammar Explanation:
                </h3>
                <p className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded leading-relaxed">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
