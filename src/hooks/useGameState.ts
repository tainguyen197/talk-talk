import { useState } from 'react';

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

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    playerPosition: 0,
    maxPosition: 10,
    score: 0,
    combo: 0,
    totalAnswers: 0,
    correctAnswers: 0,
    gameStatus: "playing",
    obstacles: [
      { position: 2, type: "door", unlocked: false },
      { position: 4, type: "trap", unlocked: false },
      { position: 6, type: "treasure", unlocked: false },
      { position: 8, type: "door", unlocked: false },
      { position: 10, type: "treasure", unlocked: false },
    ],
  });

  const handleGameProgression = (isCorrect: boolean) => {
    setGameState((prev) => {
      const newState = { ...prev };
      newState.totalAnswers += 1;

      if (isCorrect) {
        newState.correctAnswers += 1;
        newState.combo += 1;

        const basePoints = 100;
        const comboMultiplier = Math.min(newState.combo, 5);
        const points = basePoints * comboMultiplier;
        newState.score += points;

        if (newState.playerPosition < newState.maxPosition) {
          newState.playerPosition += 1;

          const obstacle = newState.obstacles.find(
            (obs) => obs.position === newState.playerPosition
          );
          if (obstacle) {
            obstacle.unlocked = true;
            if (obstacle.type === "treasure") {
              newState.score += 500;
            }
          }
        }

        if (newState.playerPosition >= newState.maxPosition) {
          newState.gameStatus = "won";
        }
      } else {
        newState.combo = 0;
      }

      if (newState.totalAnswers >= 15 && newState.correctAnswers < 7) {
        newState.gameStatus = "lost";
      }

      return newState;
    });
  };

  const resetGame = () => {
    setGameState({
      playerPosition: 0,
      maxPosition: 10,
      score: 0,
      combo: 0,
      totalAnswers: 0,
      correctAnswers: 0,
      gameStatus: "playing",
      obstacles: [
        { position: 2, type: "door", unlocked: false },
        { position: 4, type: "trap", unlocked: false },
        { position: 6, type: "treasure", unlocked: false },
        { position: 8, type: "door", unlocked: false },
        { position: 10, type: "treasure", unlocked: false },
      ],
    });
  };

  return { gameState, handleGameProgression, resetGame };
}; 