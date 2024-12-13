import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Trophy, ArrowLeft, Gamepad2 } from 'lucide-react';

interface GameMenuProps {
  onShowSettings: () => void;
  onShowLeaderboard: () => void;
  onBack: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({
  onShowSettings,
  onShowLeaderboard,
  onBack,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-400 hover:text-white rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-indigo-400" />
          <h1 className="text-2xl font-bold text-white">Habit Flyer</h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onShowSettings}
          className="p-2 text-gray-400 hover:text-white rounded-lg"
        >
          <Settings className="w-5 h-5" />
        </button>
        <button
          onClick={onShowLeaderboard}
          className="p-2 text-yellow-400 hover:text-yellow-300 rounded-lg"
        >
          <Trophy className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};