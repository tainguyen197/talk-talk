interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  feedback?: {
    corrections?: Array<{
      original: string;
      corrected: string;
      explanation: string;
    }>;
    tips?: string[];
    overall: string;
    isCorrect?: boolean;
  };
}

interface PracticeMessageProps {
  message: Message;
}

export const PracticeMessage = ({ message }: PracticeMessageProps) => {
  return (
    <div>
      <div
        className={`flex ${
          message.sender === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`flex gap-1 max-w-xs lg:max-w-md px-4 py-3 border-2 font-mono text-sm relative ${
            message.sender === "user"
              ? "bg-purple-900 text-purple-100 border-purple-400 shadow-lg shadow-purple-400/50 rounded-r-none rounded-l-lg"
              : "bg-gray-800 text-green-300 border-green-400 shadow-lg shadow-green-400/50 rounded-l-none rounded-r-lg"
          }`}
        >
          {message.sender === "ai" && (
            <div className="text-green-400 animate-pulse">🤖</div>
          )}
          {message.sender === "user" && (
            <div className="absolute -right-1 top-1 text-purple-400 animate-pulse">
              👾
            </div>
          )}
          <p className="text-sm leading-relaxed">{message.text}</p>
        </div>
      </div>

      {/* Feedback Section */}
      {message.feedback && (
        <div className="mt-2 ml-4 p-3 bg-gradient-to-r from-yellow-900/80 to-orange-900/80 border-2 border-yellow-400 rounded-lg shadow-lg shadow-yellow-400/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-pulse"></div>
          <div className="text-sm relative z-10">
            <div className="font-bold text-yellow-300 mb-2 font-mono tracking-wide">
              🏆 ACHIEVEMENT FEEDBACK:
            </div>

            {/* Grammar Corrections */}
            {message.feedback.corrections &&
              message.feedback.corrections.length > 0 && (
                <div className="mb-2">
                  {message.feedback.corrections.map((correction, index) => (
                    <div
                      key={index}
                      className="mb-2 p-2 bg-black/50 border border-red-400/50 rounded font-mono"
                    >
                      <div className="text-red-400 mb-1">
                        💥 CRITICAL ERROR: &quot;{correction.original}&quot;
                      </div>
                      <div className="text-green-400 mb-1">
                        ✨ FIXED VERSION: &quot;{correction.corrected}&quot;
                      </div>
                      <div className="text-xs text-cyan-300">
                        🔧 DEBUG INFO: {correction.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Tips */}
            {message.feedback.tips && message.feedback.tips.length > 0 && (
              <div className="mb-2">
                {message.feedback.tips.map((tip, index) => (
                  <div
                    key={index}
                    className="text-cyan-300 text-xs font-mono mb-1"
                  >
                    🎯 POWER-UP TIP: {tip}
                  </div>
                ))}
              </div>
            )}

            {/* Game Progress Effect */}
            {message.feedback.isCorrect && (
              <div className="mb-2 p-2 bg-green-800/50 border border-green-400/50 rounded font-mono">
                <div className="text-green-400 mb-1">
                  🎮 GAME PROGRESS: Player moved forward!
                </div>
                <div className="text-xs text-cyan-300">
                  🏆 Points earned! Keep the combo going for bonus multipliers!
                </div>
              </div>
            )}

            {/* Overall Feedback */}
            <div className="text-yellow-200 text-xs font-mono mt-2 p-2 bg-black/30 border border-yellow-400/30 rounded">
              📊 LEVEL STATUS: {message.feedback.overall}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 