import { useCallback, useEffect } from 'react';
import { GameState } from '../types/game';
import { renderSystem } from '../utils/renderSystem';

interface UseGameLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameState: GameState;
  updateGameState: (deltaTime: number) => void;
  frameRef: React.MutableRefObject<number | undefined>;
  lastTimeRef: React.MutableRefObject<number>;
}

export const useGameLoop = ({
  canvasRef,
  gameState,
  updateGameState,
  frameRef,
  lastTimeRef
}: UseGameLoopProps) => {
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameState.isPlaying || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Update game state
    updateGameState(deltaTime);

    // Render current state
    renderSystem.render(ctx, {
      gameState,
      selectedHabit: '', // This will be passed from parent
      habits: [], // This will be passed from parent
      timestamp
    });

    // Continue loop
    frameRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, updateGameState, canvasRef, lastTimeRef]);

  useEffect(() => {
    if (gameState.isPlaying) {
      frameRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameState.isPlaying, gameLoop]);
};