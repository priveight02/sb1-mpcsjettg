import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Trophy } from 'lucide-react';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
  onShowLeaderboard: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  onPlayAgain,
  onShowLeaderboard,
}) => {
  return (
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
          Score: {score}
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onPlayAgain}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                     hover:bg-indigo-700 transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </button>
          <button
            onClick={onShowLeaderboard}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg 
                     hover:bg-yellow-700 transition-colors flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            View Leaderboard
          </button>
        </div>
      </div>
    </motion.div>
  );
};