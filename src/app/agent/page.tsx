"use client";

import React, { useState } from "react";

// Define a type for the feature cards for better type checking
interface FeatureCardProps {
  title: string;
  description: string;
  icon: string; // Emoji or SVG icon
  children?: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  icon,
  children,
}) => {
  return (
    <div className="bg-white shadow-lg rounded-xl p-6 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-4">{icon}</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
};

const GrammarHelpPage: React.FC = () => {
  const [textInput, setTextInput] = useState("");
  const [correctionResult, setCorrectionResult] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string | null>(null);

  // Placeholder functions for feature interactions
  const handleAskInYourLanguage = () => {
    // Mock API call or logic
    setTextInput("Tôi mới làm nó hôm qua");
    setCorrectionResult("I just did it yesterday.");
    setExplanation(
      "Past tense used for completed action in the past. Breakdown: I (subject) + did (verb, past) + it (object) + yesterday (time)."
    );
  };

  const handleCorrectMySentence = () => {
    // Mock API call or logic for correction
    if (!textInput.trim()) {
      setCorrectionResult("Please enter a sentence to correct.");
      setExplanation(null);
      return;
    }
    // Simulate correction and explanation
    setCorrectionResult(`Corrected: "${textInput}" (but with a fix!)`);
    setExplanation(
      "This is an explanation of what was wrong and why it was fixed."
    );
  };

  const handleGrammarSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults("Please enter a search query.");
      return;
    }
    // Mock API call or logic for grammar search
    setSearchResults(
      `Results for "${searchQuery}": 'have been' is used for present perfect continuous tense...`
    );
  };

  const miniGrammarCardsData = [
    {
      id: 1,
      title: "Tenses",
      tip: 'Simple Present: Actions happening now or regularly. E.g., "She reads a book."',
    },
    {
      id: 2,
      title: "Prepositions",
      tip: 'In, On, At: Use "in" for enclosed spaces, "on" for surfaces, "at" for specific points. E.g., "The cat is in the box."',
    },
    {
      id: 3,
      title: "Articles",
      tip: 'A vs An: Use "a" before consonant sounds, "an" before vowel sounds. E.g., "a car", "an apple".',
    },
    {
      id: 4,
      title: "Modals",
      tip: 'Can, Could, May: "Can" for ability, "could" for possibility/past ability, "may" for permission. E.g., "I can swim."',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-500 p-4 md:p-8 font-sans">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-white">Grammar Helper</h1>
        <p className="text-xl text-purple-200">
          Your personal AI grammar assistant
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Feature 1: Ask in Your Language */}
        <FeatureCard
          title="Ask in Your Language"
          description="Translate and understand grammar from your native tongue."
          icon="🗣️"
        >
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow"
            rows={3}
            placeholder="E.g., Tôi mới làm nó hôm qua (Vietnamese)"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            onClick={handleAskInYourLanguage}
            className="mt-3 w-full bg-purple-500 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            Translate & Explain
          </button>
          {correctionResult && (
            <div className="mt-4 p-3 bg-purple-50 rounded-lg">
              <p className="font-semibold text-gray-700">
                English: {correctionResult}
              </p>
              {explanation && (
                <p className="text-sm text-gray-600 mt-1">
                  Explanation: {explanation}
                </p>
              )}
            </div>
          )}
        </FeatureCard>

        {/* Feature 3: Correct My Sentence */}
        <FeatureCard
          title="Correct My Sentence"
          description="Get your English sentences corrected with explanations."
          icon="✏️"
        >
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-shadow"
            rows={3}
            placeholder="Enter an English sentence to correct..."
            value={textInput} // Re-using state for simplicity, consider dedicated state for each input
            onChange={(e) => setTextInput(e.target.value)}
          />
          <button
            onClick={handleCorrectMySentence}
            className="mt-3 w-full bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            Correct & Explain
          </button>
          {correctionResult && ( // Assuming correctionResult and explanation are set by handleCorrectMySentence
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="font-semibold text-gray-700">{correctionResult}</p>
              {explanation && (
                <p className="text-sm text-gray-600 mt-1">{explanation}</p>
              )}
              <div className="mt-2 flex space-x-2">
                <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">
                  Retry
                </button>
                <button className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md">
                  Compare
                </button>
              </div>
            </div>
          )}
        </FeatureCard>

        {/* Feature 2: Ask "Why" Questions About Grammar */}
        <FeatureCard
          title="Ask 'Why' About Grammar"
          description="Select text and ask specific grammar questions."
          icon="❓"
        >
          <div className="p-3 bg-gray-100 rounded-lg text-center">
            <p className="text-gray-600">
              Select a part of a sentence from your text editor or a provided
              example, then ask &apos;Why?&apos;
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {" "}
              (Interactive text selection and querying UI to be implemented
              here){" "}
            </p>
            <input
              type="text"
              placeholder="e.g., Why use 'is' here?"
              className="w-full mt-2 p-2 border rounded-lg"
            />
            <button className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105">
              Ask Why
            </button>
          </div>
        </FeatureCard>

        {/* Feature 5: Grammar Search Tool */}
        <FeatureCard
          title="Grammar Search Tool"
          description="Quickly find explanations for grammar rules."
          icon="🔍"
        >
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-shadow"
            placeholder="E.g., How to use 'have been'?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            onClick={handleGrammarSearch}
            className="mt-3 w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all transform hover:scale-105"
          >
            Search Grammar
          </button>
          {searchResults && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-700">{searchResults}</p>
            </div>
          )}
        </FeatureCard>

        {/* Feature 4: Mini Grammar Cards */}
        <div className="md:col-span-2">
          {" "}
          {/* Spans two columns on medium screens and above */}
          <FeatureCard
            title="Mini Grammar Cards"
            description="Scrollable grammar tips and examples."
            icon="📘"
          >
            <div className="h-64 overflow-y-auto space-y-3 pr-2">
              {" "}
              {/* Added pr-2 for scrollbar spacing */}
              {miniGrammarCardsData.map((card) => (
                <div
                  key={card.id}
                  className="p-4 bg-indigo-50 rounded-lg shadow transition-transform hover:scale-102"
                >
                  <h3 className="font-semibold text-indigo-700">
                    {card.title}
                  </h3>
                  <p className="text-sm text-indigo-600">{card.tip}</p>
                </div>
              ))}
            </div>
          </FeatureCard>
        </div>

        {/* Feature 6: Grammar + Speaking Practice */}
        <div className="md:col-span-2">
          <FeatureCard
            title="Grammar + Speaking Practice"
            description="Practice speaking, get transcribed, and receive grammar feedback."
            icon="🎧"
          >
            <div className="p-3 bg-teal-50 rounded-lg text-center">
              <p className="text-gray-700 mb-3">
                Click the button and say a sentence in English.
              </p>
              <button className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all transform hover:scale-110">
                <svg
                  className="w-6 h-6 inline-block mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm1 10.26A5.002 5.002 0 015.246 9H5a5 5 0 004.043 4.9A5.009 5.009 0 0014 14.001V13a5.002 5.002 0 00-1.754-3.758A4.98 4.98 0 0012 9.06V14.26zM10 18a1 1 0 001-1v-1.268a7.005 7.005 0 01-2 0V17a1 1 0 001 1z"></path>
                </svg>
                Start Speaking
              </button>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Your transcribed text will appear here...
                </p>
                <p className="text-sm text-red-500 mt-1">
                  Grammar corrections and audio feedback will follow.
                </p>
              </div>
            </div>
          </FeatureCard>
        </div>
      </div>

      <footer className="text-center mt-12 pb-8">
        <p className="text-purple-200 text-sm">
          &copy; 2024 Your App Name. Speak confidently.
        </p>
      </footer>
    </div>
  );
};

export default GrammarHelpPage;
