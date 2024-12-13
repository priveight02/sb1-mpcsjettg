import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Play, Pause, RotateCcw, Settings, Gamepad2 } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useAuthStore } from '../../store/authStore';
import { GameLeaderboard } from './GameLeaderboard';
import { GameSettingsModal } from './GameSettings';
import { useGameSettings } from './hooks/useGameSettings';
import { useGameEngine } from './hooks/useGameEngine';
import { GameCanvas } from './components/GameCanvas';
import toast from 'react-hot-toast';

export const HabitFlyer: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [selectedHabit, setSelectedHabit] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const habits = useHabitStore((state) => state.habits);
  const { user } = useAuthStore();
  const { addScore } = useLeaderboardStore();
  const { settings } = useGameSettings();

  const { gameState, jump, startGame, endGame } = useGameEngine(settings);

  const handleStartGame = useCallback(() => {
    if (!selectedHabit) {
      toast.error('Please select a habit first');
      return;
    }
    startGame();
  }, [selectedHabit, startGame]);

  const handleGameOver = useCallback(() => {
    if (user) {
      const points = Math.floor(gameState.score * 10);
      addScore(user.uid, points);
      toast.success(`Game Over! Earned ${points} points!`);
    }
    endGame();
  }, [user, gameState.score, addScore, endGame]);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Habit Flyer</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-400 hover:text-white rounded-lg"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 text-yellow-400 hover:text-yellow-300 rounded-lg"
            >
              <Trophy className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Game Container */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
          {/* Habit Selection */}
          {!gameState.isPlaying && !gameState.gameOver && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Your Habit
              </label>
              <select
                value={selectedHabit}
                onChange={(e) => setSelectedHabit(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
              >
                <option value="">Choose a habit...</option>
                {habits.map(habit => (
                  <option key={habit.id} value={habit.id}>
                    {habit.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Game Canvas */}
          <GameCanvas
            canvasRef={canvasRef}
            gameState={gameState}
            selectedHabit={selectedHabit}
            habits={habits}
            onJump={jump}
            onStart={handleStartGame}
            onGameOver={handleGameOver}
          />

          {/* Controls Info */}
          <div className="mt-4 text-center text-gray-400">
            Click, tap, or press spacebar to make your habit jump!
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showSettings && (
          <GameSettingsModal onClose={() => setShowSettings(false)} />
        )}
        {showLeaderboard && (
          <GameLeaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};