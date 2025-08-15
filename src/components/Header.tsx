"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="bg-white dark:bg-gray-900 shadow">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span role="img" aria-label="Microphone" className="text-2xl">
            🎤
          </span>
          <Link
            href="/"
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
          >
            Talk Talk
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className={`text-sm ${
              pathname === "/"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            } transition-colors`}
          >
            Today&apos;s Topic
          </Link>
          <Link
            href="/grammar-help"
            className={`text-sm ${
              pathname === "/grammar-help"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            } transition-colors`}
          >
            Grammar Help
          </Link>
          <Link
            href="/practice-speaking"
            className={`text-sm ${
              pathname === "/practice-speaking"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            } transition-colors`}
          >
            Practice Speaking
          </Link>
          <Link
            href="/notification-test"
            className={`text-sm ${
              pathname === "/notification-test"
                ? "text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
            } transition-colors`}
          >
            Test Notifications
          </Link>
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
          <h2 className="text-lg font-semibold mb-2">About Talk Talk</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Talk Talk helps you practice basic English speaking for daily
            communication, with simple grammar help and smart guidance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-sm font-medium mb-1">Today&apos;s Topic</h3>
              <ol className="text-xs text-gray-600 dark:text-gray-400 list-decimal pl-4">
                <li>View the daily topic</li>
                <li>Click &quot;Start Practice&quot;</li>
                <li>Practice with role-play or speaking quiz</li>
                <li>Complete daily activities to build a streak</li>
              </ol>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-1">Grammar Help</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4">
                <li>Type in Vietnamese</li>
                <li>Get English translation</li>
                <li>See grammar explanation</li>
                <li>Ask follow-up questions</li>
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
