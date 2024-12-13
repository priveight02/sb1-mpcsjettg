import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';
import { GameState } from '../types/game';
import { renderSystem } from '../utils/renderSystem';
import { GAME_CONFIG } from '../config/gameConfig';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameState: GameState;
  selectedHabit: string;
  habits: any[];
  onJump: () => void;
  onStart: () => void;
  onGameOver: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  canvasRef,
  gameState,
  selectedHabit,
  habits,
  onJump,
  onStart,
  onGameOver
}) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = GAME_CONFIG.canvasWidth;
    canvas.height = GAME_CONFIG.canvasHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initial render
    renderSystem.render(ctx, {
      gameState,
      selectedHabit,
      habits,
      timestamp: performance.now()
    });
  }, [canvasRef, gameState, selectedHabit, habits]);

  const handleControlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (gameState.gameOver) {
      onStart();
    } else if (!gameState.isPlaying) {
      onStart();
    }
  };

  return (
    <div 
      className="relative rounded-lg overflow-hidden cursor-pointer" 
      onClick={onJump}
    >
      <canvas
        ref={canvasRef}
        className="w-full bg-gray-900 rounded-lg"
      />

      {/* Game Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={handleControlClick}
          className="p-2 bg-gray-800/80 rounded-lg text-white hover:bg-gray-700/80"
        >
          {gameState.isPlaying ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Start Game Overlay */}
      <AnimatePresence>
        {!gameState.isPlaying && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <button
              onClick={handleControlClick}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg 
                       hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {gameState.gameOver ? 'Play Again' : 'Start Game'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 flex items-center justify-center bg-black/50"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Game Over!
              </h2>
              <p className="text-gray-300 mb-4">
                Score: {gameState.score}
              </p>
              <button
                onClick={() => onStart()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg 
                         hover:bg-indigo-700 transition-colors"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};