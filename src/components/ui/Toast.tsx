"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  autoClose = true,
  duration = 3000,
}: ToastProps) {
  useEffect(() => {
    if (isVisible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoClose, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-gradient-to-r from-green-500 to-green-600 border-green-400",
    error: "bg-gradient-to-r from-red-500 to-red-600 border-red-400",
    info: "bg-gradient-to-r from-orange-500 to-red-500 border-orange-400",
  }[type];

  const iconMap = {
    success: "✅",
    error: "❌",
    info: "🔊",
  }[type];

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in-down">
      <div
        className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg border-2 flex items-center space-x-2 min-w-[280px] max-w-md`}
      >
        <div className="flex-shrink-0 text-lg">{iconMap}</div>
        <div className="flex-1 font-mono text-sm">{message}</div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-white hover:text-gray-200 transition-colors"
        >
          <span className="text-sm">×</span>
        </button>
      </div>

      {/* Retro gaming particles */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-ping opacity-70"></div>
      <div
        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping opacity-80"
        style={{ animationDelay: "0.5s" }}
      ></div>
    </div>
  );
}

// Add animation to tailwind.config.js if not already there
// animation: {
//   'fade-in-down': 'fadeInDown 0.5s ease-out forwards',
// },
// keyframes: {
//   fadeInDown: {
//     '0%': { opacity: '0', transform: 'translate(-50%, -20px)' },
//     '100%': { opacity: '1', transform: 'translate(-50%, 0)' },
//   },
// },
