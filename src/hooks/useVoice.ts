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

  const speakText = async (
    text: string,
    options?: { speed?: number; language?: string; voice?: string }
  ) => {
    // Prepare text for TTS: convert blanks like "______" to an audible cue
    const prepareTextForTTS = (input: string): string => {
      let output = input;
      // Replace contiguous underscores (2 or more) with an audible cue
      output = output.replace(/_{2,}/g, " blank ");
      // Replace bracketed blanks like (____), [____], {____}
      output = output.replace(/[\(\[\{]\s*_{2,}\s*[\)\]\}]/g, " blank ");
      // Replace long dashes often used as blanks (---, —, –)
      output = output.replace(/[—–]|-{3,}/g, " blank ");
      // Collapse extra whitespace and fix spaces before punctuation
      output = output.replace(/\s{2,}/g, " ").replace(/\s+([,.!?;:])/g, "$1");
      return output.trim();
    };

    const prepared = prepareTextForTTS(text);
    console.log("speaking text", prepared);
    if (!isVoiceEnabled || !prepared.trim() || isPlaying) return;

    setIsPlaying(true);

    try {
      const response = await fetch("/api/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: prepared,
          speed: options?.speed,
          language: options?.language,
          voice: options?.voice,
        }),
      });

      if (!response.ok) throw new Error("TTS request failed");

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise<void>((resolve) => {
        const cleanup = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          resolve();
        };

        audio.addEventListener("ended", cleanup, { once: true });
        audio.addEventListener("error", cleanup, { once: true });

        audio.play().catch(() => {
          // Autoplay blocked or other error — clear UI state
          cleanup();
        });
      });
    } catch (err) {
      console.error("Error playing audio:", err);
      setIsPlaying(false);
    }
  };

  const speakQuestion = async (question: string, questionNumber?: number) => {
    if (!isVoiceEnabled) return;

    let textToSpeak = question;
    if (questionNumber) {
      textToSpeak = `Question ${questionNumber}. ${question}`;
    }

    await speakText(textToSpeak, { speed: 1.0 });
  };

  const speakFeedback = async (feedback: string, isCorrect: boolean) => {
    if (!isVoiceEnabled) return;

    let textToSpeak = feedback;
    if (isCorrect) {
      textToSpeak = `Correct! ${feedback}`;
    } else {
      textToSpeak = `Let me explain. ${feedback}`;
    }

    await speakText(textToSpeak, { speed: 1.15 });
  };

  const speakProgress = async (current: number, total: number) => {
    if (!isVoiceEnabled) return;

    const textToSpeak = `Question ${current} of ${total}`;
    await speakText(textToSpeak, { speed: 1.15 });
  };

  const speakCompletion = async (
    score: number,
    total: number,
    grade: string
  ) => {
    if (!isVoiceEnabled) return;

    const percentage = Math.round((score / total) * 100);
    const textToSpeak = `Test completed! You scored ${score} out of ${total}, which is ${percentage} percent. Your grade is ${grade}.`;

    await speakText(textToSpeak, { speed: 1.1 });
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
