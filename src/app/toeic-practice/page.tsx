"use client";

import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { useVoice } from "@/hooks/useVoice";
import { GameBoard } from "@/components/game/GameBoard";
import { RetroBackground } from "@/components/ui/RetroBackground";
import Header from "@/components/Header";

interface TOEICQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: "grammar" | "vocabulary" | "sentence_structure";
}

interface TestResult {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

export default function TOEICPractice() {
  const [questions, setQuestions] = useState<TOEICQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);

  const { gameState, handleGameProgression, resetGame } = useGameState();
  const {
    isVoiceEnabled,
    isPlaying,
    speakQuestion,
    speakFeedback,
    speakProgress,
    speakCompletion,
  } = useVoice();

  useEffect(() => {
    generateQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Speak the current question when it changes
  useEffect(() => {
    if (questions.length > 0 && !isGeneratingQuestions && !testCompleted) {
      const currentQuestion = questions[currentQuestionIndex];
      if (currentQuestion) {
        // Add a small delay to ensure the UI has updated
        const timer = setTimeout(() => {
          speakQuestion(currentQuestion.question, currentQuestionIndex + 1);
        }, 500);

        return () => clearTimeout(timer);
      }
    }
  }, [
    currentQuestionIndex,
    questions,
    isGeneratingQuestions,
    testCompleted,
    speakQuestion,
  ]);

  // Speak the test results when completed
  useEffect(() => {
    if (testCompleted) {
      const { correctAnswers, totalQuestions, grade } = getScoreAndGrade();
      // Add a small delay to ensure the UI has updated
      const timer = setTimeout(() => {
        speakCompletion(correctAnswers, totalQuestions, grade);
      }, 1000);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCompleted, speakCompletion]);

  const generateQuestions = async () => {
    setIsGeneratingQuestions(true);
    try {
      const response = await fetch("/api/toeic-practice/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          level: "B2",
          questionCount: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setQuestionStartTime(Date.now());
      } else {
        // Fallback questions if API fails
        setQuestions(getFallbackQuestions());
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setQuestions(getFallbackQuestions());
      setQuestionStartTime(Date.now());
    }
    setIsGeneratingQuestions(false);
  };

  const getFallbackQuestions = (): TOEICQuestion[] => {
    return [
      {
        id: 1,
        question:
          "The company's new policy will _______ all employees starting next month.",
        options: ["effect", "affect", "affects", "effects"],
        correctAnswer: 1,
        explanation:
          "'Affect' is a verb meaning to influence or make a change. 'Effect' is a noun meaning a result or consequence.",
        category: "vocabulary",
      },
      {
        id: 2,
        question:
          "If I _______ you yesterday, I would have told you about the meeting.",
        options: ["saw", "had seen", "have seen", "would see"],
        correctAnswer: 1,
        explanation:
          "This is a third conditional sentence. The structure is: If + past perfect, would have + past participle.",
        category: "grammar",
      },
      // Add more fallback questions...
    ];
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const timeSpent = Date.now() - questionStartTime;

    // Record the result
    const result: TestResult = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    };

    setTestResults((prev) => [...prev, result]);

    // Handle game progression
    handleGameProgression(isCorrect);

    setShowExplanation(true);
    setIsLoading(true);

    // Speak the explanation
    speakFeedback(currentQuestion.explanation, isCorrect);

    // Show explanation for 3 seconds, then move to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setShowExplanation(false);
        setQuestionStartTime(Date.now());

        // Announce progress
        speakProgress(currentQuestionIndex + 2, questions.length);
      } else {
        setTestCompleted(true);
        updateStreak();
      }
      setIsLoading(false);
    }, 5000); // Increased to 5 seconds to allow for voice explanation
  };

  const updateStreak = () => {
    const correctAnswers =
      testResults.filter((r) => r.isCorrect).length +
      (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer
        ? 1
        : 0);

    // Only update streak if user got at least 7/10 correct
    if (correctAnswers >= 7) {
      const savedStreak = localStorage.getItem("streak") || "0";
      const newStreak = parseInt(savedStreak) + 1;
      localStorage.setItem("streak", newStreak.toString());
      localStorage.setItem("lastPracticeDate", new Date().toDateString());
      localStorage.setItem("dailyProgress", "100");
    }
  };

  const handleRetakeTest = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setTestResults([]);
    setTestCompleted(false);
    resetGame();
    generateQuestions();
  };

  const getScoreAndGrade = () => {
    const totalQuestions =
      testResults.length + (selectedAnswer !== null ? 1 : 0);
    const correctAnswers =
      testResults.filter((r) => r.isCorrect).length +
      (selectedAnswer === questions[currentQuestionIndex]?.correctAnswer
        ? 1
        : 0);
    const percentage = (correctAnswers / totalQuestions) * 100;

    let grade = "F";
    if (percentage >= 90) grade = "A";
    else if (percentage >= 80) grade = "B";
    else if (percentage >= 70) grade = "C";
    else if (percentage >= 60) grade = "D";

    return { correctAnswers, totalQuestions, percentage, grade };
  };

  if (isGeneratingQuestions) {
    return (
      <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
        <RetroBackground />
        <Header />
        <main className="flex-1 flex items-center justify-center relative z-10">
          <div className="bg-gray-900 border-4 border-cyan-400 rounded-lg p-8 shadow-lg shadow-cyan-400/50">
            <div className="text-center">
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <h2 className="text-xl font-mono text-cyan-300 mb-2">
                🤖 GENERATING AI QUESTIONS
              </h2>
              <p className="text-green-300 font-mono">
                Creating your personalized B2 TOEIC practice test...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (testCompleted) {
    const { correctAnswers, totalQuestions, percentage, grade } =
      getScoreAndGrade();

    return (
      <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
        <RetroBackground />
        <Header />
        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 relative z-10">
          {/* <GameBoard gameState={gameState} onReset={resetGame} /> */}

          <div className="flex-1 bg-gray-900 border-4 border-cyan-400 rounded-lg shadow-lg shadow-cyan-400/50 p-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-mono text-cyan-300 mb-2">
                🏆 TEST COMPLETED!
              </h1>
              <div className="text-6xl font-mono text-green-400 mb-2">
                {grade}
              </div>
              <p className="text-xl font-mono text-green-300">
                {correctAnswers}/{totalQuestions} Correct (
                {percentage.toFixed(1)}%)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 border-2 border-purple-400 rounded-lg p-4">
                <h3 className="text-lg font-mono text-purple-300 mb-2">
                  📊 PERFORMANCE
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Score:</span>
                    <span className="text-green-400">
                      {correctAnswers}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accuracy:</span>
                    <span className="text-green-400">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Grade:</span>
                    <span className="text-yellow-400">{grade}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border-2 border-green-400 rounded-lg p-4">
                <h3 className="text-lg font-mono text-green-300 mb-2">
                  🎮 GAME STATS
                </h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Points Earned:</span>
                    <span className="text-cyan-400">{gameState.score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Best Combo:</span>
                    <span className="text-yellow-400">
                      {Math.max(...testResults.map((_, i) => gameState.combo))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Level Progress:</span>
                    <span className="text-purple-400">
                      {gameState.playerPosition}/{gameState.maxPosition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleRetakeTest}
                className="flex-1 py-4 px-6 bg-purple-800 border-2 border-purple-400 hover:bg-purple-700 text-purple-100 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-400/30"
              >
                🔄 RETAKE TEST
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 py-4 px-6 bg-cyan-800 border-2 border-cyan-400 hover:bg-cyan-700 text-cyan-100 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-400/30"
              >
                🏠 HOME
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-screen bg-black relative overflow-hidden">
      <RetroBackground />
      <Header />

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 relative z-10">
        {/* <GameBoard gameState={gameState} onReset={resetGame} /> */}

        {/* Progress Header */}
        <div className="bg-gray-900 border-4 border-cyan-400 rounded-lg p-4 mb-4 shadow-lg shadow-cyan-400/50">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-mono text-cyan-300">
              🎯 TOEIC PRACTICE (B2)
            </h1>
            <div className="flex items-center">
              <span className="text-sm font-mono text-green-400 mr-2">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>

              {/* Voice Status Indicator */}
              {isVoiceEnabled && (
                <div
                  className={`w-5 h-5 relative ${
                    isPlaying ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-orange-400 text-sm">🔊</span>
                  </div>
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 w-5 h-5 bg-orange-400 rounded-full opacity-20 animate-ping"></div>
                      <div className="absolute inset-0 w-5 h-5 bg-orange-400 rounded-full opacity-10 animate-pulse"></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-3 bg-gray-800 border-2 border-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        {currentQuestion && (
          <div className="flex-1 bg-gray-900 border-4 border-purple-400 rounded-lg shadow-lg shadow-purple-400/50 p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-mono text-purple-300 bg-purple-900 px-3 py-1 rounded-full">
                  {currentQuestion.category.toUpperCase()}
                </span>
                <span className="text-sm font-mono text-yellow-300">
                  B2 LEVEL
                </span>
              </div>

              <div className="flex items-start mb-6">
                <h2 className="text-lg font-mono text-green-300 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Listen Again Button */}
                {isVoiceEnabled && (
                  <button
                    onClick={() => speakQuestion(currentQuestion.question)}
                    disabled={isPlaying}
                    className={`ml-2 p-1 rounded-full ${
                      isPlaying
                        ? "bg-gray-700 text-gray-400"
                        : "bg-orange-900 text-orange-300 hover:bg-orange-800"
                    } transition-colors`}
                    title="Listen again"
                  >
                    <span className="text-sm">🔊</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation || isPlaying}
                    className={`w-full p-4 text-left border-2 rounded-lg font-mono transition-all transform hover:scale-105 ${
                      selectedAnswer === index
                        ? showExplanation
                          ? index === currentQuestion.correctAnswer
                            ? "bg-green-900 border-green-400 text-green-100 shadow-lg shadow-green-400/50"
                            : "bg-red-900 border-red-400 text-red-100 shadow-lg shadow-red-400/50"
                          : "bg-cyan-900 border-cyan-400 text-cyan-100 shadow-lg shadow-cyan-400/50"
                        : showExplanation &&
                          index === currentQuestion.correctAnswer
                        ? "bg-green-900 border-green-400 text-green-100 shadow-lg shadow-green-400/50"
                        : "bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:border-gray-500"
                    } disabled:cursor-not-allowed`}
                  >
                    <span className="text-yellow-400 mr-3">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {showExplanation && (
              <div className="bg-blue-900 border-2 border-blue-400 rounded-lg p-4 mb-4 shadow-lg shadow-blue-400/50">
                <div className="flex items-start">
                  <h3 className="text-lg font-mono text-blue-300 mb-2">
                    💡 EXPLANATION
                  </h3>

                  {/* Listen Again Button for Explanation */}
                  {isVoiceEnabled && (
                    <button
                      onClick={() =>
                        speakFeedback(
                          currentQuestion.explanation,
                          selectedAnswer === currentQuestion.correctAnswer
                        )
                      }
                      disabled={isPlaying}
                      className={`ml-2 p-1 rounded-full ${
                        isPlaying
                          ? "bg-gray-700 text-gray-400"
                          : "bg-blue-700 text-blue-300 hover:bg-blue-600"
                      } transition-colors`}
                      title="Listen to explanation again"
                    >
                      <span className="text-sm">🔊</span>
                    </button>
                  )}
                </div>
                <p className="text-blue-100 font-mono text-sm leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {!showExplanation && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isLoading || isPlaying}
                className="w-full py-4 px-6 bg-green-800 border-2 border-green-400 hover:bg-green-700 disabled:bg-gray-800 disabled:border-gray-600 text-green-100 disabled:text-gray-400 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-green-400/30 text-lg"
              >
                {isLoading
                  ? "⏳ PROCESSING..."
                  : isPlaying
                  ? "🔊 LISTENING..."
                  : "✅ SUBMIT ANSWER"}
              </button>
            )}

            {isLoading && showExplanation && (
              <div className="text-center py-4">
                <div className="flex justify-center space-x-1 mb-2">
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
                <p className="text-cyan-300 font-mono text-sm">
                  {isPlaying
                    ? "Playing audio..."
                    : currentQuestionIndex < questions.length - 1
                    ? "Loading next question..."
                    : "Calculating final score..."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
