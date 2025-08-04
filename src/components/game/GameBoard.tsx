interface GameState {
  playerPosition: number;
  maxPosition: number;
  score: number;
  combo: number;
  totalAnswers: number;
  correctAnswers: number;
  gameStatus: "playing" | "won" | "lost";
  obstacles: Array<{
    position: number;
    type: "door" | "trap" | "treasure";
    unlocked: boolean;
  }>;
}

interface GameBoardProps {
  gameState: GameState;
  onReset: () => void;
}

export const GameBoard = ({ gameState, onReset }: GameBoardProps) => {
  const getGameEmoji = (position: number) => {
    if (gameState.playerPosition === position) return "🧙‍♂️";

    const obstacle = gameState.obstacles.find(
      (obs) => obs.position === position
    );
    if (obstacle) {
      if (obstacle.unlocked) {
        return obstacle.type === "door"
          ? "🚪"
          : obstacle.type === "trap"
          ? "✅"
          : "💎";
      } else {
        return obstacle.type === "door"
          ? "🔒"
          : obstacle.type === "trap"
          ? "⚠️"
          : "📦";
      }
    }

    return position === gameState.maxPosition ? "🏆" : "⬜";
  };

  return (
    <div className="mb-4 p-4 border-4 border-pink-400 rounded-lg shadow-lg shadow-pink-400/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pink-400/10 to-purple-400/10 animate-pulse"></div>
      <div className="relative z-10">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold text-pink-300 font-mono">
            🎮 PIXEL ADVENTURE: SPEAK TO ESCAPE
          </h2>
          <button
            onClick={onReset}
            className="text-xs px-2 py-1 bg-pink-600 text-white font-mono rounded hover:bg-pink-500 transition-colors"
          >
            🔄 RESET
          </button>
        </div>

        {/* Game Stats */}
        <div className="flex justify-between mb-3 text-xs font-mono">
          <div className="text-cyan-300">
            📊 SCORE: <span className="text-yellow-300">{gameState.score}</span>
          </div>
          <div className="text-cyan-300">
            🔥 COMBO: <span className="text-orange-300">x{gameState.combo}</span>
          </div>
          <div className="text-cyan-300">
            🎯 ACCURACY:{" "}
            <span className="text-green-300">
              {gameState.totalAnswers > 0
                ? Math.round(
                    (gameState.correctAnswers / gameState.totalAnswers) * 100
                  )
                : 0}
              %
            </span>
          </div>
        </div>

        {/* Game Board */}
        <div className="grid grid-cols-11 gap-1 mb-3">
          {Array.from({ length: 11 }, (_, i) => (
            <div
              key={i}
              className={`aspect-square flex items-center justify-center text-lg border rounded ${
                i === gameState.playerPosition
                  ? "bg-yellow-500 border-yellow-300 animate-pulse"
                  : "bg-gray-800 border-gray-600"
              }`}
            >
              {getGameEmoji(i)}
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs font-mono text-cyan-300 mb-1">
            <span>🏠 START</span>
            <span>
              {gameState.playerPosition}/{gameState.maxPosition}
            </span>
            <span>🏆 ESCAPE</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-400 to-cyan-400 transition-all duration-500"
              style={{
                width: `${
                  (gameState.playerPosition / gameState.maxPosition) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Game Status */}
        {gameState.gameStatus === "won" && (
          <div className="text-center p-2 bg-green-800 border border-green-400 rounded font-mono text-green-300">
            🎉 VICTORY! You escaped the dungeon! Final Score: {gameState.score}
          </div>
        )}
        {gameState.gameStatus === "lost" && (
          <div className="text-center p-2 bg-red-800 border border-red-400 rounded font-mono text-red-300">
            💀 Game Over! Try speaking more accurately to escape next time!
          </div>
        )}
        {gameState.gameStatus === "playing" && (
          <div className="text-center text-xs font-mono text-gray-300">
            🧙‍♂️ Speak correctly to move forward! Avoid traps, unlock doors, find treasures!
          </div>
        )}
      </div>
    </div>
  );
}; 