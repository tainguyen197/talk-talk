"use client";

import { useState } from "react";

export default function Header() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span role="img" aria-label="Microphone" className="text-2xl">
            🎤
          </span>
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
            TalkTutor
          </h1>
        </div>

        <div className="flex items-center">
          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            aria-label="Info"
          >
            <InfoIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {isInfoOpen && (
        <div className="max-w-4xl mx-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg shadow-inner">
          <h2 className="text-lg font-semibold mb-2">About TalkTutor</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            TalkTutor helps you practice your English through natural
            conversation. Just tap the microphone button and start speaking.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-1">How to Use</h3>
              <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal pl-4">
                <li>Tap the blue microphone button to start recording</li>
                <li>Speak clearly in English</li>
                <li>Tap the red stop button when you&apos;re done</li>
                <li>Wait for TalkTutor to respond</li>
                <li>Continue the conversation to practice</li>
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Tips</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4">
                <li>
                  Try speaking on various topics to expand your vocabulary
                </li>
                <li>Ask TalkTutor to correct your grammar</li>
                <li>
                  Practice different scenarios like ordering food or giving
                  directions
                </li>
                <li>Try to maintain longer conversations</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 text-right">
            <button
              onClick={() => setIsInfoOpen(false)}
              className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function InfoIcon({ className = "h-6 w-6" }) {
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
        d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
      />
    </svg>
  );
}
