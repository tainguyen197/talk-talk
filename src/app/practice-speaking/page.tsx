"use client";

import { useState, useEffect, useRef } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import { GameBoard } from "@/components/game/GameBoard";
import { PracticeMessage } from "@/components/practice/PracticeMessage";
import { RetroBackground } from "@/components/ui/RetroBackground";
import { speakText } from "@/lib/utils/audioUtils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  feedback?: {
    corrections?: Array<{
      original: string;
      corrected: string;
      explanation: string;
    }>;
    tips?: string[];
    overall: string;
    isCorrect?: boolean;
  };
}

export default function PracticeSpeaking() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { gameState, handleGameProgression, resetGame } = useGameState();
  const { isRecording, startVoiceRecording } = useVoiceInput();

  // Function to handle user interaction and enable audio
  const handleUserInteraction = () => {
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
  };

  // Function to play audio sequentially
  const playAudioSequentially = async (texts: string[]) => {
    for (const text of texts) {
      setIsAudioPlaying(true);
      await speakText(text);
      setIsAudioPlaying(false);
    }
  };

  useEffect(() => {
    generateInitialQuestion();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const generateInitialQuestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/practice-speaking/question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context: "starting_conversation",
          conversationHistory: [],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage: Message = {
          id: Date.now().toString(),
          text: data.question,
          sender: "ai",
        };
        setMessages([aiMessage]);

        // Only speak the initial question if user has interacted
        if (hasUserInteracted) {
          await playAudioSequentially([data.question]);
        }
      }
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback question
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "Ops, something went wrong. Please try again.",
        sender: "ai",
      };
      setMessages([fallbackMessage]);
    }
    setIsLoading(false);
  };

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: currentInput,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      // Evaluate the user's response
      const evaluationResponse = await fetch(
        "/api/practice-speaking/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userResponse: currentInput,
            conversationHistory: messages,
          }),
        }
      );

      if (evaluationResponse.ok) {
        const evaluationData = await evaluationResponse.json();

        // Determine if answer is correct (simple heuristic)
        const isCorrect =
          !evaluationData.feedback.corrections ||
          evaluationData.feedback.corrections.length === 0;

        // Update the user message with feedback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, feedback: { ...evaluationData.feedback, isCorrect } }
              : msg
          )
        );

        // Handle game progression
        handleGameProgression(isCorrect);

        // Generate feedback text for voice
        const feedbackText = isCorrect
          ? `Great job! Your answer was correct. ${evaluationData.feedback.overall}`
          : `Let me help you improve. ${evaluationData.feedback.overall}`;

        // Speak the feedback
        setIsAudioPlaying(true);
        await speakText(feedbackText);
        setIsAudioPlaying(false);

        // Small delay before "done" message
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Speak "done" message
        setIsAudioPlaying(true);
        await speakText("Done. Here's your next question.");
        setIsAudioPlaying(false);

        // Small delay before next question
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate next question
        const questionResponse = await fetch(
          "/api/practice-speaking/question",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context: "continuing_conversation",
              conversationHistory: [...messages, userMessage],
              lastUserResponse: currentInput,
            }),
          }
        );

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: questionData.question,
            sender: "ai",
          };
          setMessages((prev) => [...prev, aiMessage]);

          // Speak the next question
          await playAudioSequentially([questionData.question]);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleUserInteraction();
      handleSendMessage();
    }
  };

  const handleVoiceInput = async (transcript: string) => {
    setCurrentInput(transcript);

    // Automatically send the message after voice input
    const userMessage: Message = {
      id: Date.now().toString(),
      text: transcript,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentInput("");
    setIsLoading(true);

    try {
      // Evaluate the user's response
      const evaluationResponse = await fetch(
        "/api/practice-speaking/evaluate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userResponse: transcript,
            conversationHistory: messages,
          }),
        }
      );

      if (evaluationResponse.ok) {
        const evaluationData = await evaluationResponse.json();

        // Determine if answer is correct (simple heuristic)
        const isCorrect =
          !evaluationData.feedback.corrections ||
          evaluationData.feedback.corrections.length === 0;

        // Update the user message with feedback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, feedback: { ...evaluationData.feedback, isCorrect } }
              : msg
          )
        );

        // Handle game progression
        handleGameProgression(isCorrect);

        // Generate feedback text for voice
        const feedbackText = isCorrect
          ? `Great job! Your answer was correct. ${evaluationData.feedback.overall}`
          : `Let me help you improve. ${evaluationData.feedback.overall}`;

        // Speak the feedback
        setIsAudioPlaying(true);
        await speakText(feedbackText);
        setIsAudioPlaying(false);

        // Small delay before "done" message
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Speak "done" message
        setIsAudioPlaying(true);
        await speakText("Done. Here's your next question.");
        setIsAudioPlaying(false);

        // Small delay before next question
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Generate next question
        const questionResponse = await fetch(
          "/api/practice-speaking/question",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              context: "continuing_conversation",
              conversationHistory: [...messages, userMessage],
              lastUserResponse: transcript,
            }),
          }
        );

        if (questionResponse.ok) {
          const questionData = await questionResponse.json();
          const aiMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: questionData.question,
            sender: "ai",
          };
          setMessages((prev) => [...prev, aiMessage]);

          // Speak the next question
          await playAudioSequentially([questionData.question]);
        }
      }
    } catch (error) {
      console.error("Error processing voice message:", error);
    }
    setIsLoading(false);
  };

  return (
    <div
      className="flex flex-col min-h-screen bg-black relative overflow-x-hidden"
      onClick={handleUserInteraction}
    >
      <RetroBackground />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 relative z-10">
        {/* Audio Status Indicator */}
        {!hasUserInteracted && (
          <div className="mb-4 p-3 bg-yellow-800 border-2 border-yellow-400 rounded-lg shadow-lg shadow-yellow-400/50">
            <div className="flex items-center space-x-2 font-mono text-yellow-300">
              <span className="text-sm">
                🔊 Click anywhere to enable audio feedback
              </span>
            </div>
          </div>
        )}
        <GameBoard gameState={gameState} onReset={resetGame} />

        {/* Messages Container */}
        <div className="flex-1 bg-gray-900 border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50 overflow-hidden flex flex-col relative">
          {/* Retro screen effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <PracticeMessage key={message.id} message={message} />
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-800 border-2 border-cyan-400 rounded-lg px-4 py-3 shadow-lg shadow-cyan-400/50">
                  <div className="flex items-center space-x-2 font-mono text-cyan-300">
                    <span className="text-xs">🤖 AI PROCESSING</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t-4 border-cyan-400 bg-gray-900 p-4 relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 animate-pulse"></div>
            <div className="flex flex-col space-y-3">
              {/* Text Input */}
              <textarea
                value={currentInput}
                onChange={(e) => {
                  handleUserInteraction();
                  setCurrentInput(e.target.value);
                }}
                onKeyPress={handleKeyPress}
                placeholder=">> Enter your response to continue the quest..."
                className="w-full p-4 border-2 border-purple-400 bg-black text-green-300 font-mono rounded-lg focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/50 resize-none placeholder-gray-500 transition-all text-base"
                rows={3}
                disabled={isLoading || isAudioPlaying}
              />

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {/* Voice Button */}
                <button
                  onClick={() => {
                    handleUserInteraction();
                    startVoiceRecording(handleVoiceInput);
                  }}
                  disabled={isLoading || isRecording || isAudioPlaying}
                  className={`flex-1 py-4 px-6 border-2 font-mono font-bold transition-all transform hover:scale-105 text-lg ${
                    isRecording
                      ? "bg-red-900 border-red-400 text-red-100 shadow-lg shadow-red-400/50 animate-pulse"
                      : isAudioPlaying
                      ? "bg-green-800 border-green-400 text-green-100 shadow-lg shadow-green-400/50 animate-pulse"
                      : "bg-red-800 border-red-400 text-red-100 hover:bg-red-700 shadow-lg shadow-red-400/30"
                  } disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-400 rounded-lg`}
                >
                  {isRecording
                    ? "🎙️ RECORDING..."
                    : isAudioPlaying
                    ? "🔊 SPEAKING..."
                    : "🎤 VOICE INPUT"}
                </button>

                {/* Send Button */}
                <button
                  onClick={() => {
                    handleUserInteraction();
                    handleSendMessage();
                  }}
                  disabled={isLoading || !currentInput.trim() || isAudioPlaying}
                  className="flex-1 py-4 px-6 bg-purple-800 border-2 border-purple-400 hover:bg-purple-700 disabled:bg-gray-800 disabled:border-gray-600 text-purple-100 disabled:text-gray-400 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-400/30 text-lg"
                >
                  ⚡ SEND
                </button>
              </div>

              {/* Mobile Tips */}
              <div className="text-xs text-gray-400 font-mono text-center mt-2">
                💡 Tip: Use voice input for faster responses on mobile!
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
