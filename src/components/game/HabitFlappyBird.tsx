import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import { useHabitStore } from '../../store/habitStore';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { useAuthStore } from '../../store/authStore';
import { GameLeaderboard } from './GameLeaderboard';
import toast from 'react-hot-toast';

interface GameState {
  score: number;
  isPlaying: boolean;
  gameOver: boolean;
  habitY: number;
  velocity: number;
  obstacles: Array<{
    x: number;
    gapY: number;
    passed: boolean;
  }>;
}

export const HabitFlappyBird: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    isPlaying: false,
    gameOver: false,
    habitY: 250,
    velocity: 0,
    obstacles: [],
  });
  const [selectedHabit, setSelectedHabit] = useState('');
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const habits = useHabitStore((state) => state.habits);
  const { addPoints } = useLeaderboardStore();
  const { user } = useAuthStore();

  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawGame = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background
      ctx.fillStyle = '#1F2937';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw habit character
      if (selectedHabit) {
        const habit = habits.find(h => h.id === selectedHabit);
        if (habit) {
          ctx.fillStyle = habit.color;
          ctx.beginPath();
          ctx.roundRect(100, gameState.habitY, 40, 40, 8);
          ctx.fill();
          
          // Draw habit name
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '12px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(habit.title.slice(0, 10), 120, gameState.habitY + 25);
        }
      }

      // Draw obstacles
      ctx.fillStyle = '#4F46E5';
      gameState.obstacles.forEach(obstacle => {
        // Top obstacle
        ctx.fillRect(obstacle.x, 0, 50, obstacle.gapY - 75);
        // Bottom obstacle
        ctx.fillRect(obstacle.x, obstacle.gapY + 75, 50, canvas.height - (obstacle.gapY + 75));
      });

      // Draw score
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Score: ${gameState.score}`, 20, 40);
    };

    const updateGame = (timestamp: number) => {
      if (!gameState.isPlaying) return;

      const deltaTime = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      // Update habit position
      setGameState(prev => ({
        ...prev,
        habitY: prev.habitY + prev.velocity * deltaTime * 0.05,
        velocity: prev.velocity + 0.5, // Gravity
        obstacles: prev.obstacles.map(obstacle => ({
          ...obstacle,
          x: obstacle.x - 3, // Move obstacles left
        })).filter(obstacle => obstacle.x > -50),
      }));

      // Add new obstacles
      if (gameState.obstacles.length === 0 || 
          gameState.obstacles[gameState.obstacles.length - 1].x < canvas.width - 300) {
        setGameState(prev => ({
          ...prev,
          obstacles: [...prev.obstacles, {
            x: canvas.width,
            gapY: Math.random() * (canvas.height - 200) + 100,
            passed: false,
          }],
        }));
      }

      // Check collisions
      const habitBox = {
        x: 100,
        y: gameState.habitY,
        width: 40,
        height: 40,
      };

      // Check if habit hit the ground or ceiling
      if (gameState.habitY < 0 || gameState.habitY > canvas.height - 40) {
        handleGameOver();
        return;
      }

      // Check obstacle collisions and scoring
      gameState.obstacles.forEach(obstacle => {
        if (obstacle.x < 100 + 40 && obstacle.x + 50 > 100) {
          // Check collision with top pipe
          if (gameState.habitY < obstacle.gapY - 75) {
            handleGameOver();
            return;
          }
          // Check collision with bottom pipe
          if (gameState.habitY + 40 > obstacle.gapY + 75) {
            handleGameOver();
            return;
          }
        }

        // Score point if passed obstacle
        if (!obstacle.passed && obstacle.x + 50 < 100) {
          setGameState(prev => ({
            ...prev,
            score: prev.score + 1,
            obstacles: prev.obstacles.map(obs => 
              obs === obstacle ? { ...obs, passed: true } : obs
            ),
          }));
        }
      });

      drawGame();
      frameRef.current = requestAnimationFrame(updateGame);
    };

    if (gameState.isPlaying) {
      frameRef.current = requestAnimationFrame(updateGame);
    } else {
      drawGame();
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [gameState, selectedHabit, habits]);

  const handleJump = () => {
    if (!gameState.isPlaying || gameState.gameOver) return;
    setGameState(prev => ({
      ...prev,
      velocity: -10,
    }));
  };

  const startGame = () => {
    if (!selectedHabit) {
      toast.error('Please select a habit first');
      return;
    }

    setGameState({
      score: 0,
      isPlaying: true,
      gameOver: false,
      habitY: 250,
      velocity: 0,
      obstacles: [],
    });
    lastTimeRef.current = performance.now();
  };

  const handleGameOver = () => {
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
    
    // Add points to leaderboard
    if (user) {
      const points = Math.floor(gameState.score * 10);
      addPoints(user.uid, points);
      toast.success(`Game Over! Earned ${points} points!`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <button
            onClick={() => setShowLeaderboard(true)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300"
          >
            <Trophy className="w-5 h-5" />
            Leaderboard
          </button>
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
          <div 
            className="relative rounded-lg overflow-hidden cursor-pointer"
            onClick={handleJump}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="w-full bg-gray-900 rounded-lg"
            />

            {/* Overlay Messages */}
            <AnimatePresence>
              {!gameState.isPlaying && !gameState.gameOver && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/50"
                >
                  <button
                    onClick={startGame}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg 
                             hover:bg-indigo-700 transition-colors flex items-center gap-2"
                  >
                    <Play className="w-5 h-5" />
                    Start Game
                  </button>
                </motion.div>
              )}

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
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={startGame}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg 
                                 hover:bg-indigo-700 transition-colors flex items-center gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Play Again
                      </button>
                      <button
                        onClick={() => setShowLeaderboard(true)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg 
                                 hover:bg-yellow-700 transition-colors flex items-center gap-2"
                      >
                        <Trophy className="w-4 h-4" />
                        View Leaderboard
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Controls Info */}
          <div className="mt-4 text-center text-gray-400">
            Click or tap to make your habit jump!
          </div>
        </div>
      </div>

      {/* Leaderboard Modal */}
      <AnimatePresence>
        {showLeaderboard && (
          <GameLeaderboard onClose={() => setShowLeaderboard(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};