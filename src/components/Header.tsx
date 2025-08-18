"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import VoiceToggle from "./VoiceToggle";

export default function Header() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleVoiceChange = useCallback((enabled: boolean) => {
    // This will be used by other components through localStorage
    console.log("Voice enabled:", enabled);
  }, []);

  const navigationItems = [
    { href: "/", label: "Today's Topic" },
    { href: "/grammar-help", label: "Grammar Help" },
    { href: "/practice-speaking", label: "Practice Speaking" },
    { href: "/toeic-practice", label: "TOEIC Practice" },
    { href: "/notification-test", label: "Test Notifications" },
  ];

  return (
    <header className="bg-white dark:bg-gray-900/40 shadow relative z-50">
      <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
        {/* Retro Gaming Logo & Title */}
        <div className="flex items-center space-x-3">
          {/* Retro Gaming Title */}
          <Link href="/" className="group">
            <div className="relative">
              <h1 className="text-2xl font-bold font-mono bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-lg">
                TALK_TALK.exe
              </h1>
              {/* Glowing text effect */}
              <div className="absolute inset-0 text-2xl font-bold font-mono bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent opacity-20 blur-sm animate-pulse">
                TALK_TALK.exe
              </div>
              {/* Fire scan lines effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              {/* Terminal cursor effect */}
            </div>

            {/* Retro subtitle */}
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-orange-400 tracking-wider">
                VOICE_LEARNING_SYSTEM
              </span>
              <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-mono ${
                pathname === item.href
                  ? "text-orange-400 font-bold drop-shadow-lg shadow-orange-400/50"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-400 hover:drop-shadow-lg hover:shadow-orange-400/30"
              } transition-all duration-300 hover:scale-105`}
            >
              {item.label}
            </Link>
          ))}

          {/* Voice Toggle for Desktop */}
          <div className="border-l border-gray-300 dark:border-gray-700 pl-3 ml-1">
            <VoiceToggle onVoiceChange={handleVoiceChange} />
          </div>

          <button
            onClick={() => setIsInfoOpen(!isInfoOpen)}
            className="text-gray-600 dark:text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-110"
            aria-label="Info"
          >
            <InfoIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Mobile Hamburger Menu */}
        <div className="md:hidden flex items-center">
          {/* Voice Toggle for Mobile */}
          <VoiceToggle onVoiceChange={handleVoiceChange} />

          <button
            onClick={toggleMenu}
            className="relative p-2 focus:outline-none"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              {/* Retro Gaming Hamburger Lines */}
              <div
                className={`w-6 h-0.5 bg-gradient-to-r from-orange-400 to-red-400 transition-all duration-300 transform ${
                  isMenuOpen ? "rotate-45 translate-y-1.5" : ""
                } shadow-lg shadow-orange-400/50`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-gradient-to-r from-red-400 to-yellow-400 my-1 transition-all duration-300 ${
                  isMenuOpen ? "opacity-0" : ""
                } shadow-lg shadow-red-400/50`}
              ></div>
              <div
                className={`w-6 h-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300 transform ${
                  isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""
                } shadow-lg shadow-yellow-400/50`}
              ></div>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-gray-900 border-t-2 border-orange-400 shadow-lg shadow-orange-400/50">
          <div className="max-w-4xl mx-auto">
            {/* Retro Menu Header */}
            <div className="p-4 border-b border-orange-400/30">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                <span className="text-orange-400 font-mono text-sm">
                  NAVIGATION_MENU.exe
                </span>
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={`block p-3 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                    pathname === item.href
                      ? "bg-orange-900 border-orange-400 text-orange-100 shadow-lg shadow-orange-400/50"
                      : "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{item.label}</span>
                    <span className="text-xs text-gray-400">→</span>
                  </div>
                </Link>
              ))}
            </nav>

            {/* Retro Menu Footer */}
            <div className="p-4 border-t border-orange-400/30">
              <div className="flex justify-center">
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-red-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Panel */}
      {isInfoOpen && (
        <div className="max-w-4xl mx-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg shadow-inner">
          <h2 className="text-lg font-semibold mb-2">About Talk Talk</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            Talk Talk helps you practice basic English speaking for daily
            communication, with simple grammar help and smart guidance.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
            <div>
              <h3 className="text-sm font-medium mb-1">TOEIC Practice</h3>
              <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc pl-4">
                <li>AI-generated B2 level questions</li>
                <li>10 multiple-choice questions</li>
                <li>Detailed explanations</li>
                <li>Retro gaming experience</li>
                <li>Voice narration support</li>
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
