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
  const [showParticles, setShowParticles] = useState(false);

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
        speakQuestion(currentQuestion.question, currentQuestionIndex + 1);
      }
    }
  }, [currentQuestionIndex, questions, isGeneratingQuestions, testCompleted]);

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

    // Add retro shake effect to the selected button
    const button = document.querySelector(`[data-answer="${answerIndex}"]`);
    if (button) {
      button.classList.add("animate-retro-shake");
      setTimeout(() => {
        button.classList.remove("animate-retro-shake");
      }, 500);
    }
  };

  const handleSubmitAnswer = async () => {
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
    setShowParticles(true);

    // Speak the explanation
    await speakFeedback(currentQuestion.explanation, isCorrect);

    // Show explanation for 3 seconds, then move to next question
    if (currentQuestionIndex < questions.length - 1) {
      // await speakProgress(currentQuestionIndex + 2, questions.length);

      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
      setQuestionStartTime(Date.now());
    } else {
      setTestCompleted(true);
      updateStreak();
    }
    setIsLoading(false);

    // Hide particles after animation
    setTimeout(() => setShowParticles(false), 2000);
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
          <div className="retro-card border-cyan-400 rounded-lg p-8 shadow-2xl shadow-cyan-400/50 animate-pulse">
            <div className="text-center">
              <div className="flex justify-center space-x-2 mb-6">
                <div className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce"></div>
                <div
                  className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-4 h-4 bg-cyan-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <h2 className="text-2xl font-mono text-cyan-300 mb-4 animate-pulse">
                🎮 LOADING TOEIC ADVENTURE
              </h2>
              <p className="text-green-300 font-mono text-lg">
                Preparing your retro B2 TOEIC adventure... 🕹️
              </p>
              <div className="mt-6 w-64 h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-pulse"></div>
              </div>
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
          {/* Floating Trophy */}
          <div
            className="absolute top-20 right-8 text-6xl animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            🏆
          </div>

          <div className="flex-1 retro-card border-cyan-400 rounded-lg shadow-2xl shadow-cyan-400/50 p-6 animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-mono text-cyan-300 mb-4 animate-pulse">
                🎉 MISSION ACCOMPLISHED!
              </h1>
              <div
                className="text-8xl font-mono text-green-400 mb-4 animate-bounce"
                style={{ animationDuration: "1.5s" }}
              >
                {grade}
              </div>
              <p className="text-2xl font-mono text-green-300 mb-2">
                {correctAnswers}/{totalQuestions} Correct
              </p>
              <p className="text-xl font-mono text-yellow-300">
                ({percentage.toFixed(1)}% Accuracy)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-purple-400 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-mono text-purple-300 mb-4 flex items-center">
                  📊 PERFORMANCE METRICS
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Score:</span>
                    <span className="text-green-400 font-bold">
                      {correctAnswers}/{totalQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Accuracy:</span>
                    <span className="text-green-400 font-bold">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Grade:</span>
                    <span className="text-yellow-400 font-bold text-lg">
                      {grade}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/80 backdrop-blur-sm border-2 border-green-400 rounded-lg p-6 transform hover:scale-105 transition-transform duration-300">
                <h3 className="text-xl font-mono text-green-300 mb-4 flex items-center">
                  🎮 GAME STATISTICS
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Points Earned:</span>
                    <span className="text-cyan-400 font-bold">
                      {gameState.score}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Best Combo:</span>
                    <span className="text-yellow-400 font-bold">
                      {Math.max(...testResults.map((_, i) => gameState.combo))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Level Progress:</span>
                    <span className="text-purple-400 font-bold">
                      {gameState.playerPosition}/{gameState.maxPosition}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={handleRetakeTest}
                className="flex-1 py-4 px-6 bg-purple-800/80 backdrop-blur-sm border-2 border-purple-400 hover:bg-purple-700 text-purple-100 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-400/30 hover:shadow-purple-400/50"
              >
                🔄 RETAKE TEST
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 py-4 px-6 bg-cyan-800/80 backdrop-blur-sm border-2 border-cyan-400 hover:bg-cyan-700 text-cyan-100 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-cyan-400/30 hover:shadow-cyan-400/50"
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

      {/* Floating Elements */}
      <div
        className="absolute top-20 left-8 text-4xl animate-bounce"
        style={{ animationDuration: "3s" }}
      >
        🎯
      </div>
      <div className="absolute top-40 right-12 text-3xl animate-pulse">⚡</div>
      <div
        className="absolute bottom-40 left-12 text-3xl animate-bounce"
        style={{ animationDuration: "2.5s" }}
      >
        💡
      </div>
      <div className="absolute top-60 left-20 text-2xl animate-retro-rotate">
        🌟
      </div>
      <div
        className="absolute bottom-60 right-20 text-2xl animate-pulse"
        style={{ animationDuration: "2s" }}
      >
        🚀
      </div>
      <div
        className="absolute top-80 left-1/4 text-2xl animate-bounce"
        style={{ animationDuration: "4s" }}
      >
        ✨
      </div>

      {/* Enhanced Particle Effects */}
      {showParticles && (
        <div className="particle-container">
          {[...Array(30)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.3}s`,
                background: ["#ffff00", "#00ffff", "#ff00ff", "#00ff00"][
                  Math.floor(Math.random() * 4)
                ],
                width: `${2 + Math.random() * 4}px`,
                height: `${2 + Math.random() * 4}px`,
              }}
            />
          ))}
        </div>
      )}

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 relative z-10">
        {/* Progress Header */}
        <div className="retro-card border-cyan-400 rounded-lg p-6 mb-6 shadow-2xl shadow-cyan-400/50 transform transition-transform duration-300 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-mono text-cyan-300 animate-pulse">
              🎯 TOEIC PRACTICE (B2)
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-lg font-mono text-green-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>

              {/* Voice Status Indicator */}
              {isVoiceEnabled && (
                <div
                  className={`w-6 h-6 relative ${
                    isPlaying ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-orange-400 text-lg">🔊</span>
                  </div>
                  {isPlaying && (
                    <>
                      <div className="absolute inset-0 w-6 h-6 bg-orange-400 rounded-full opacity-20 animate-ping"></div>
                      <div className="absolute inset-0 w-6 h-6 bg-orange-400 rounded-full opacity-10 animate-pulse"></div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="w-full h-4 bg-gray-800 border-2 border-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 via-cyan-400 to-purple-400 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Content */}
        {currentQuestion && (
          <div className="flex-1 retro-card border-purple-400 rounded-lg shadow-2xl shadow-purple-400/50 p-8 transform transition-transform duration-300 animate-scale-in">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-mono text-purple-300 bg-purple-900/50 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400 animate-pulse">
                  {currentQuestion.category.toUpperCase()}
                </span>
                <span className="text-lg font-mono text-yellow-300 bg-yellow-900/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400">
                  B2 LEVEL
                </span>
              </div>

              <div className="flex items-start mb-8">
                <h2 className="text-xl font-mono text-green-300 leading-relaxed">
                  {currentQuestion.question}
                </h2>

                {/* Listen Again Button */}
                {isVoiceEnabled && (
                  <button
                    onClick={() => speakQuestion(currentQuestion.question)}
                    disabled={isPlaying}
                    className={`ml-4 p-2 rounded-full transition-all transform hover:scale-110 ${
                      isPlaying
                        ? "bg-gray-700 text-gray-400"
                        : "bg-orange-900/50 text-orange-300 hover:bg-orange-800/50"
                    }`}
                    title="Listen again"
                  >
                    <span className="text-xl">🔊</span>
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    data-answer={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showExplanation || isPlaying}
                    className={`w-full p-6 text-left border-2 rounded-lg font-mono transition-all transform hover:scale-105 retro-button ${
                      selectedAnswer === index
                        ? showExplanation
                          ? index === currentQuestion.correctAnswer
                            ? "bg-green-900/80 backdrop-blur-sm border-green-400 text-green-100 shadow-2xl shadow-green-400/50 animate-pulse animate-glow-pulse"
                            : "bg-red-900/80 backdrop-blur-sm border-red-400 text-red-100 shadow-2xl shadow-red-400/50 animate-pulse"
                          : "bg-cyan-900/80 backdrop-blur-sm border-cyan-400 text-cyan-100 shadow-2xl shadow-cyan-400/50 animate-glow-pulse"
                        : showExplanation &&
                          index === currentQuestion.correctAnswer
                        ? "bg-green-900/80 backdrop-blur-sm border-green-400 text-green-100 shadow-2xl shadow-green-400/50 animate-pulse animate-glow-pulse"
                        : "bg-gray-800/80 backdrop-blur-sm border-gray-600 text-gray-100 hover:bg-gray-700/80 hover:border-gray-500 hover:shadow-lg"
                    } disabled:cursor-not-allowed`}
                  >
                    <span className="text-yellow-400 mr-4 text-xl font-bold">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-lg">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {showExplanation && (
              <div className="bg-blue-900/80 backdrop-blur-sm border-2 border-blue-400 rounded-lg p-6 mb-6 shadow-2xl shadow-blue-400/50 animate-fade-in">
                <div className="flex items-start">
                  <h3 className="text-xl font-mono text-blue-300 mb-4 flex items-center">
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
                      className={`ml-4 p-2 rounded-full transition-all transform hover:scale-110 ${
                        isPlaying
                          ? "bg-gray-700 text-gray-400"
                          : "bg-blue-800/50 text-blue-300 hover:bg-blue-700/50"
                      }`}
                      title="Listen to explanation again"
                    >
                      <span className="text-lg">🔊</span>
                    </button>
                  )}
                </div>
                <p className="text-blue-100 font-mono text-lg leading-relaxed">
                  {currentQuestion.explanation}
                </p>
              </div>
            )}

            {!showExplanation && (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null || isLoading || isPlaying}
                className="w-full py-6 px-8 bg-green-800/80 backdrop-blur-sm border-2 border-green-400 hover:bg-green-700/80 disabled:bg-gray-800/80 disabled:border-gray-600 text-green-100 disabled:text-gray-400 font-mono font-bold rounded-lg transition-all transform hover:scale-105 shadow-2xl shadow-green-400/30 hover:shadow-green-400/50 text-xl"
              >
                {isLoading
                  ? "⏳ PROCESSING..."
                  : isPlaying
                  ? "🔊 LISTENING..."
                  : "✅ SUBMIT ANSWER"}
              </button>
            )}

            {isLoading && showExplanation && (
              <div className="text-center py-6">
                <div className="flex justify-center space-x-2 mb-4">
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
                <p className="text-cyan-300 font-mono text-lg">
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
