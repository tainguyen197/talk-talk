"use client";

import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";

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
  };
}

export default function PracticeSpeaking() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWaitingForQuestion, setIsWaitingForQuestion] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start with an AI-generated question
    generateInitialQuestion();
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
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
      }
    } catch (error) {
      console.error("Error generating question:", error);
      // Fallback question
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! Let's practice speaking English together. What are you doing today?",
        sender: "ai",
      };
      setMessages([fallbackMessage]);
    }
    setIsLoading(false);
    setIsWaitingForQuestion(false);
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

        // Update the user message with feedback
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === userMessage.id
              ? { ...msg, feedback: evaluationData.feedback }
              : msg
          )
        );

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
      handleSendMessage();
    }
  };

  const startVoiceRecording = async () => {
    setIsRecording(true);

    try {
      // Check if browser supports speech recognition
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error("Speech recognition not supported");
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Error starting voice recognition:", error);
      setIsRecording(false);
      // Fallback: simulate voice input for demo
      setTimeout(() => {
        setCurrentInput("I'm working from home today.");
        setIsRecording(false);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-x-hidden">
      {/* Animated Retro Gaming Background */}
      <div className="animated-retro-bg">
        <div className="grid"></div>
        <div className="scanline"></div>
        <div className="glitch"></div>

        {/* Starfield */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`star-${i}`}
            className={`star ${
              i % 3 === 0
                ? "star-small"
                : i % 3 === 1
                ? "star-medium"
                : "star-large"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}

        {/* Shooting Stars */}
        {[...Array(3)].map((_, i) => (
          <div
            key={`shooting-${i}`}
            className="shooting-star"
            style={{
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Floating Stars */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`floating-${i}`}
            className="floating-star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}

        {/* Pixel Particles */}
        {[...Array(18)].map((_, i) => (
          <div
            key={`pixel-${i}`}
            className="pixel"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
      {/* <Header /> */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 relative z-10">
        {/* Retro Gaming Header */}
        <div className="mb-4 p-4 border-4 border-green-400 bg-black rounded-lg shadow-lg shadow-green-400/50 relative overflow-hidden">
          {/* Retro scanlines effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/10 to-transparent pointer-events-none animate-pulse"></div>
          <h1 className="text-2xl font-bold text-green-400 font-mono tracking-wider mb-2 animate-pulse relative z-10">
            🕹️ TODAY'S QUEST
          </h1>
          <p className="text-sm text-green-300 font-mono relative z-10">
            <span className="font-bold">🎯 MISSION:</span> Master English
            conversations and unlock grammar achievements!
          </p>
          <div className="mt-2 text-xs text-yellow-400 font-mono relative z-10">
            ⚡ POWER-UPS: Real-time feedback • Grammar corrections • Level up
            your speaking! ⚡
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 bg-gray-900 border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50 overflow-hidden flex flex-col relative">
          {/* Retro screen effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id}>
                <div
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex gap-1 max-w-xs lg:max-w-md px-4 py-3 border-2 font-mono text-sm relative ${
                      message.sender === "user"
                        ? "bg-purple-900 text-purple-100 border-purple-400 shadow-lg shadow-purple-400/50 rounded-r-none rounded-l-lg"
                        : "bg-gray-800 text-green-300 border-green-400 shadow-lg shadow-green-400/50 rounded-l-none rounded-r-lg"
                    }`}
                  >
                    {message.sender === "ai" && (
                      <div className="text-green-400 animate-pulse">🤖</div>
                    )}
                    {message.sender === "user" && (
                      <div className="absolute -right-1 top-1 text-purple-400 animate-pulse">
                        👾
                      </div>
                    )}
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>

                {/* Feedback Section */}
                {message.feedback && (
                  <div className="mt-2 ml-4 p-3 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 border-2 border-yellow-400 rounded-lg shadow-lg shadow-yellow-400/30 relative overflow-hidden">
                    {/* Glitch effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
                    <div className="text-sm relative z-10">
                      <div className="font-bold text-yellow-300 mb-2 font-mono tracking-wide">
                        🏆 ACHIEVEMENT FEEDBACK:
                      </div>

                      {/* Grammar Corrections */}
                      {message.feedback.corrections &&
                        message.feedback.corrections.length > 0 && (
                          <div className="mb-2">
                            {message.feedback.corrections.map(
                              (correction, index) => (
                                <div
                                  key={index}
                                  className="mb-2 p-2 bg-black/50 border border-red-400/50 rounded font-mono"
                                >
                                  <div className="text-red-400 mb-1">
                                    💥 CRITICAL ERROR: "{correction.original}"
                                  </div>
                                  <div className="text-green-400 mb-1">
                                    ✨ FIXED VERSION: "{correction.corrected}"
                                  </div>
                                  <div className="text-xs text-cyan-300">
                                    🔧 DEBUG INFO: {correction.explanation}
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        )}

                      {/* Tips */}
                      {message.feedback.tips &&
                        message.feedback.tips.length > 0 && (
                          <div className="mb-2">
                            {message.feedback.tips.map((tip, index) => (
                              <div
                                key={index}
                                className="text-cyan-300 text-xs font-mono mb-1"
                              >
                                🎯 POWER-UP TIP: {tip}
                              </div>
                            ))}
                          </div>
                        )}

                      {/* Overall Feedback */}
                      <div className="text-yellow-200 text-xs font-mono mt-2 p-2 bg-black/30 border border-yellow-400/30 rounded">
                        📊 LEVEL STATUS: {message.feedback.overall}
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                onChange={(e) => setCurrentInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder=">> Enter your response to continue the quest..."
                className="w-full p-4 border-2 border-purple-400 bg-black text-green-300 font-mono rounded-lg focus:border-cyan-400 focus:shadow-lg focus:shadow-cyan-400/50 resize-none placeholder-gray-500 transition-all text-base"
                rows={3}
                disabled={isLoading}
              />

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {/* Voice Button */}
                <button
                  onClick={startVoiceRecording}
                  disabled={isLoading || isRecording}
                  className={`flex-1 py-4 px-6 border-2 font-mono font-bold transition-all transform hover:scale-105 text-lg ${
                    isRecording
                      ? "bg-red-900 border-red-400 text-red-100 shadow-lg shadow-red-400/50 animate-pulse"
                      : "bg-red-800 border-red-400 text-red-100 hover:bg-red-700 shadow-lg shadow-red-400/30"
                  } disabled:bg-gray-800 disabled:border-gray-600 disabled:text-gray-400 rounded-lg`}
                >
                  {isRecording ? "🎙️ RECORDING..." : "🎤 VOICE INPUT"}
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !currentInput.trim()}
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
