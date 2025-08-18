"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/contexts/ToastContext";

interface VoiceToggleProps {
  onVoiceChange: (enabled: boolean) => void;
}

export default function VoiceToggle({ onVoiceChange }: VoiceToggleProps) {
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    // Load voice preference from localStorage
    const savedVoicePreference = localStorage.getItem("voiceEnabled");
    if (savedVoicePreference !== null) {
      const enabled = JSON.parse(savedVoicePreference);
      setIsVoiceEnabled(enabled);
      onVoiceChange(enabled);
    }
  }, [onVoiceChange]);

  const toggleVoice = () => {
    const newState = !isVoiceEnabled;
    setIsVoiceEnabled(newState);

    // Save to localStorage
    localStorage.setItem("voiceEnabled", JSON.stringify(newState));

    // Notify parent component
    onVoiceChange(newState);

    // Show toast notification
    if (newState) {
      showToast("Voice narration enabled", "info");
    } else {
      showToast("Voice narration disabled", "info");
    }

    // Play toggle sound effect
    playToggleSound(newState);
  };

  const playToggleSound = (enabled: boolean) => {
    // Simple audio feedback for toggle
    const audio = new Audio();
    audio.volume = 0.3;

    if (enabled) {
      // Success sound for enabling voice
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
    } else {
      // Different sound for disabling voice
      audio.src =
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
    }

    audio.play().catch(() => {
      // Ignore audio play errors
    });
  };

  return (
    <div className="flex items-center">
      {/* Voice Toggle Button with Icon */}
      <button
        onClick={toggleVoice}
        className={`relative flex items-center justify-center h-8 w-8 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none ${
          isVoiceEnabled
            ? "bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-400/50"
            : "bg-gray-700 hover:bg-gray-600"
        }`}
        aria-label={isVoiceEnabled ? "Disable voice" : "Enable voice"}
      >
        {/* Voice Icon */}
        <span
          className={`text-base ${
            isVoiceEnabled ? "text-white" : "text-gray-300"
          }`}
        >
          {isVoiceEnabled ? "🔊" : "🔇"}
        </span>

        {/* Fire particles when enabled */}
        {isVoiceEnabled && (
          <>
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping opacity-70"></div>
            <div
              className="absolute -bottom-0.5 -left-0.5 w-1 h-1 bg-orange-400 rounded-full animate-ping opacity-80"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div
              className="absolute -top-1 right-0 w-1 h-1 bg-red-400 rounded-full animate-ping opacity-60"
              style={{ animationDelay: "1s" }}
            ></div>
          </>
        )}

        {/* Glowing ring effect when enabled */}
        {isVoiceEnabled && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-20 animate-pulse"></div>
        )}
      </button>

      {/* Voice Status Text (Desktop only) */}
      <div className="hidden md:block ml-2">
        <div className="flex items-center space-x-1">
          <div className="flex space-x-1">
            <div
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                isVoiceEnabled ? "bg-orange-400 animate-pulse" : "bg-gray-500"
              }`}
            ></div>
            <div
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                isVoiceEnabled ? "bg-red-400 animate-pulse" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className={`w-1 h-1 rounded-full transition-all duration-300 ${
                isVoiceEnabled ? "bg-yellow-400 animate-pulse" : "bg-gray-500"
              }`}
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
          <span className="text-xs font-mono text-gray-400 dark:text-gray-400">
            {isVoiceEnabled ? "ON" : "OFF"}
          </span>
        </div>
      </div>
    </div>
  );
}
