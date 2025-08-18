"use client";

import { useState, useEffect } from "react";

export const useVoice = () => {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Load voice preference from localStorage
    const savedVoicePreference = localStorage.getItem("voiceEnabled");
    if (savedVoicePreference !== null) {
      setIsVoiceEnabled(JSON.parse(savedVoicePreference));
    }
  }, []);

  const speakText = async (text: string) => {
    if (!isVoiceEnabled || !text.trim()) return;

    try {
      setIsPlaying(true);

      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        await audio.play();
      } else {
        setIsPlaying(false);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
      setIsPlaying(false);
    }
  };

  const speakQuestion = async (question: string, questionNumber?: number) => {
    if (!isVoiceEnabled) return;

    let textToSpeak = question;
    if (questionNumber) {
      textToSpeak = `Question ${questionNumber}. ${question}`;
    }

    await speakText(textToSpeak);
  };

  const speakFeedback = async (feedback: string, isCorrect: boolean) => {
    if (!isVoiceEnabled) return;

    let textToSpeak = feedback;
    if (isCorrect) {
      textToSpeak = `Correct! ${feedback}`;
    } else {
      textToSpeak = `Let me explain. ${feedback}`;
    }

    await speakText(textToSpeak);
  };

  const speakProgress = async (current: number, total: number) => {
    if (!isVoiceEnabled) return;

    const textToSpeak = `Question ${current} of ${total}`;
    await speakText(textToSpeak);
  };

  const speakCompletion = async (
    score: number,
    total: number,
    grade: string
  ) => {
    if (!isVoiceEnabled) return;

    const percentage = Math.round((score / total) * 100);
    const textToSpeak = `Test completed! You scored ${score} out of ${total}, which is ${percentage} percent. Your grade is ${grade}.`;

    await speakText(textToSpeak);
  };

  return {
    isVoiceEnabled,
    isPlaying,
    speakText,
    speakQuestion,
    speakFeedback,
    speakProgress,
    speakCompletion,
  };
};
