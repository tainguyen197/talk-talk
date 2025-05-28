"use client";

import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import { speakText } from "@/lib/utils/audioUtils";
import {
  ChatHistory,
  Message,
  addMessage,
  generateMessageId,
} from "@/lib/utils/chatUtils";
import ChatMessage from "@/components/ChatMessage";

// Helper function to split grammar explanation into multiple messages
const splitGrammarExplanation = (explanation: string): string[] => {
  // Remove the "Grammar Explanation: " prefix if it exists
  const cleanedExplanation = explanation.replace(
    /^Grammar Explanation:\s*/i,
    ""
  );

  // Check if the explanation has numbered points (like "1.", "2.", etc.)
  const hasNumberedPoints = /\d+\.\s+[A-Z]/.test(cleanedExplanation);

  if (hasNumberedPoints) {
    // Split by numbered points
    const pointRegex = /(\.\s+)(?=\d+\.\s+[A-Z])/g;
    const segments = cleanedExplanation.split(pointRegex);

    // If we have intro text before the first point, separate it
    const firstSegment = segments[0];
    const match = firstSegment.match(/^(.*?)(\d+\.\s+.*)/);

    if (match && match[1].trim().length > 0) {
      // Return intro text as first segment, then each numbered point
      return [
        match[1].trim(),
        ...segments.slice(0, 1).map((s) => s.replace(match[1], "")),
        ...segments.slice(1),
      ].filter((s) => s.trim().length > 0);
    }

    return segments.filter((s) => s.trim().length > 0);
  } else {
    // Fall back to sentence-based splitting
    const sentenceRegex = /(?<=[.!?])\s+(?=[A-Z'])/g;
    return cleanedExplanation
      .split(sentenceRegex)
      .filter((s) => s.trim().length > 0);
  }
};

// Helper function to format text with Markdown
const formatWithMarkdown = (text: string): string => {
  // Format numbered points (1. Point -> 1. **Point**)
  let formattedText = text.replace(/(\d+\.\s+)([A-Z][^:]+):/g, "$1**$2**:");

  // Format key grammar terms with bold
  const grammarTerms = [
    "present simple",
    "past simple",
    "future simple",
    "present continuous",
    "past continuous",
    "future continuous",
    "present perfect",
    "past perfect",
    "future perfect",
    "active voice",
    "passive voice",
    "conditional",
    "subject pronoun",
    "object pronoun",
    "possessive pronoun",
    "infinitive",
    "gerund",
    "participle",
    "adjective",
    "adverb",
    "noun",
    "verb",
    "preposition",
    "indicative",
    "subjunctive",
    "imperative",
    "interrogative",
    "declarative",
    "negative form",
  ];

  // Escape regex special characters in grammar terms
  const escapedTerms = grammarTerms.map((term) =>
    term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );

  // Create regex pattern for grammar terms (with word boundaries)
  const termsPattern = new RegExp(`\\b(${escapedTerms.join("|")})\\b`, "gi");

  // Replace grammar terms with bold versions
  formattedText = formattedText.replace(termsPattern, "**$1**");

  return formattedText;
};

export default function GrammarHelp() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [history, setHistory] = useState<ChatHistory>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your Vietnamese grammar assistant. Speak in Vietnamese, and I'll provide an English translation with grammar explanations.",
      timestamp: Date.now(),
    },
  ]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat container when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [history]);

  // Initial welcome message voice
  useEffect(() => {
    if (history.length === 1) {
      speakText(history[0].content).catch(console.error);
    }
  }, []);

  const startRecording = async () => {
    try {
      setError("");
      // Get the user's audio stream with specific constraints for better quality
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
        },
      });

      // Try to use a widely supported codec if available
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      // Create a new MediaRecorder with the stream
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: mimeType,
        audioBitsPerSecond: 128000, // 128 kbps for better quality
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Request data every 250ms to ensure we have data even for short recordings
      mediaRecorderRef.current.start(250);
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

      // Ensure we have enough time to collect the last audio chunk
      setTimeout(processRecording, 100);
    }
  };

  const processRecording = async () => {
    setIsProcessing(true);

    try {
      // Check if we have audio data
      if (!audioChunksRef.current.length) {
        throw new Error(
          "No audio data captured. Please try speaking louder or check your microphone."
        );
      }

      // Convert audio to text
      const audioBlob = new Blob(audioChunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });

      // Log blob size to help with debugging
      console.log(`Audio blob size: ${audioBlob.size} bytes`);

      if (audioBlob.size < 100) {
        throw new Error(
          "Audio recording too short. Please try speaking for a longer time."
        );
      }

      const formData = new FormData();
      formData.append("audio", audioBlob);

      const speechResponse = await fetch("/api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!speechResponse.ok) {
        const errorData = await speechResponse.json();
        throw new Error(
          errorData.error ||
            errorData.details ||
            "Failed to convert speech to text"
        );
      }

      const speechData = await speechResponse.json();
      const recognizedText = speechData.text;

      if (!recognizedText.trim()) {
        throw new Error(
          "No speech detected. Please try again and speak clearly."
        );
      }

      // Add user message to chat history
      const updatedHistory = addMessage(history, "user", recognizedText);
      setHistory(updatedHistory);

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

      // Add translation message
      const translationMessage: Message = {
        id: generateMessageId(),
        role: "assistant",
        content: grammarData.translation,
        timestamp: Date.now(),
      };

      // Split the explanation into multiple messages
      const explanationSegments = splitGrammarExplanation(
        grammarData.explanation
      );

      // Create an array of explanation messages with incrementing timestamps
      const explanationMessages: Message[] = explanationSegments.map(
        (segment, index) => ({
          id: generateMessageId(),
          role: "assistant",
          content:
            index === 0
              ? `Grammar Explanation: ${formatWithMarkdown(segment)}`
              : formatWithMarkdown(segment),
          timestamp: Date.now() + (index + 1), // Add 1ms per message to ensure correct order
        })
      );

      // Update history with translation and explanation messages
      setHistory((prev) => [
        ...prev,
        translationMessage,
        ...explanationMessages,
      ]);

      // Speak the translation and explanation
      setIsSpeaking(true);
      try {
        // Speak translation in English
        setSpeakingLanguage("en-US");
        const audio = await speakText(grammarData.translation, "en-US");

        // When translation finishes, speak the explanation in Vietnamese
        audio.addEventListener("ended", async () => {
          try {
            setSpeakingLanguage("vi-VN");
            // Convert English grammar explanation to Vietnamese before speaking
            const vietnameseExplanationResponse = await fetch(
              "/api/grammar/translate-explanation",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  explanation: grammarData.explanation,
                  originalText: recognizedText,
                }),
              }
            );

            if (!vietnameseExplanationResponse.ok) {
              throw new Error("Failed to translate explanation to Vietnamese");
            }

            const vietnameseData = await vietnameseExplanationResponse.json();

            // Speak the explanation in Vietnamese
            await speakText(vietnameseData.vietnameseExplanation, "vi-VN");
          } catch (error) {
            console.error("Error speaking explanation:", error);
          } finally {
            setIsSpeaking(false);
            setSpeakingLanguage(null);
          }
        });
      } catch (error) {
        console.error("Error speaking translation:", error);
        setIsSpeaking(false);
        setSpeakingLanguage(null);
      }

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

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full">
        <div className="text-2xl font-bold text-center py-4 border-b border-gray-200 dark:border-gray-800">
          Grammar Help
        </div>

        {/* Chat Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {error && (
            <div className="bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}

          {history.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Recording Controls */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-center">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || isSpeaking}
              className={`flex items-center justify-center relative w-16 h-16 rounded-full text-white font-semibold transition-all duration-200 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : isProcessing || isSpeaking
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 hover:scale-105"
              } shadow-lg`}
            >
              {isProcessing ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : isSpeaking ? (
                <div className="animate-pulse text-xl">🔊</div>
              ) : isRecording ? (
                <div className="w-4 h-4 bg-white rounded"></div>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isRecording
              ? "Tap to stop recording"
              : isProcessing
              ? "Processing your speech..."
              : isSpeaking
              ? speakingLanguage === "vi-VN"
                ? "Đang nói giải thích ngữ pháp bằng tiếng Việt..."
                : "Speaking English translation..."
              : "Tap to start speaking in Vietnamese"}
          </p>
        </div>
      </main>
    </div>
  );
}
