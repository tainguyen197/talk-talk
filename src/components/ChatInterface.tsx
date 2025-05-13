"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChatHistory,
  addMessage,
  sendChatMessage,
} from "@/lib/utils/chatUtils";
import {
  startRecording,
  stopRecording,
  transcribeAudio,
  speakText,
} from "@/lib/utils/audioUtils";
import ChatMessage from "./ChatMessage";

export default function ChatInterface() {
  const [history, setHistory] = useState<ChatHistory>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm TalkTutor, your AI English tutor. Speak to me in English, and I'll help you practice and improve your skills. What would you like to talk about today?",
      timestamp: Date.now(),
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentRecorder, setCurrentRecorder] = useState<{
    mediaRecorder: MediaRecorder;
    audioChunks: Blob[];
  } | null>(null);

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

  const handleStartRecording = async () => {
    try {
      setIsRecording(true);
      const recorder = await startRecording();
      setCurrentRecorder(recorder);
    } catch (error) {
      console.error("Failed to start recording:", error);
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!currentRecorder) return;

    try {
      setIsRecording(false);
      setIsProcessing(true);

      // Stop recording and get audio blob
      const audioBlob = await stopRecording(
        currentRecorder.mediaRecorder,
        currentRecorder.audioChunks
      );

      // Transcribe audio
      const transcribedText = await transcribeAudio(audioBlob);

      if (transcribedText.trim()) {
        // Add user message to history
        const newHistory = addMessage(history, "user", transcribedText);
        setHistory(newHistory);

        // Send message to API and handle streamed response
        let fullResponse = "";
        await sendChatMessage(transcribedText, newHistory, (chunk) => {
          fullResponse += chunk;
          setHistory((prev) => {
            // Find and update the last assistant message if it exists
            const lastAssistantIndex = prev.findIndex(
              (msg) => msg.role === "assistant" && msg.id === "temp-response"
            );

            if (lastAssistantIndex !== -1) {
              const updatedHistory = [...prev];
              updatedHistory[lastAssistantIndex] = {
                ...updatedHistory[lastAssistantIndex],
                content: fullResponse,
              };
              return updatedHistory;
            } else {
              // Add a new assistant message
              return [
                ...prev,
                {
                  id: "temp-response",
                  role: "assistant",
                  content: fullResponse,
                  timestamp: Date.now(),
                },
              ];
            }
          });
        });

        // Update with final message and unique ID
        setHistory((prev) => {
          const finalHistory = [...prev];
          const lastIndex = finalHistory.findIndex(
            (msg) => msg.id === "temp-response"
          );

          if (lastIndex !== -1) {
            finalHistory[lastIndex] = {
              ...finalHistory[lastIndex],
              id: `msg_${Date.now()}`,
              content: fullResponse,
            };
          }

          return finalHistory;
        });

        // Speak the response
        await speakText(fullResponse);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
    } finally {
      setCurrentRecorder(null);
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {history.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-center">
          <button
            className={`rounded-full p-4 ${
              isRecording
                ? "bg-red-500 animate-pulse"
                : isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white focus:outline-none transition-colors`}
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isProcessing}
          >
            {isRecording ? (
              <StopIcon className="h-8 w-8" />
            ) : isProcessing ? (
              <LoadingIcon className="h-8 w-8 animate-spin" />
            ) : (
              <MicrophoneIcon className="h-8 w-8" />
            )}
          </button>
        </div>
        <p className="text-center mt-2 text-sm text-gray-500 dark:text-gray-400">
          {isRecording
            ? "Tap to stop recording"
            : isProcessing
            ? "Processing your speech..."
            : "Tap to start speaking"}
        </p>
      </div>
    </div>
  );
}

function MicrophoneIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
      />
    </svg>
  );
}

function StopIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z"
      />
    </svg>
  );
}

function LoadingIcon({ className = "h-6 w-6" }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}
