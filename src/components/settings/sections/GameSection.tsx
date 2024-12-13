import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SettingsCard } from '../SettingsCard';
import { useLeaderboardStore } from '../../../store/leaderboardStore';

export const GameSection: React.FC = () => {
  const { getTopScores } = useLeaderboardStore();
  const topScores = getTopScores(3);

  return (
    <SettingsCard
      icon={Gamepad2}
      title="Mini Games"
      description="Play games to earn points and climb the leaderboard"
    >
      <Link
        to="/game/habit-flyer"
        className="block bg-gray-700 rounded-xl overflow-hidden hover:bg-gray-600 
                 transition-all duration-200 group relative"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-600/20">
                <Gamepad2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Habit Flyer</h3>
                <p className="text-sm text-gray-400">
                  Guide your habit through obstacles and earn points
                </p>
              </div>
            </div>
            <Trophy className="w-6 h-6 text-yellow-400" />
          </div>

          {/* Top Scores */}
          {topScores.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-400">Top Scores</h4>
              <div className="space-y-1">
                {topScores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      {index === 0 && <Trophy className="w-4 h-4 text-yellow-400" />}
                      <span className="text-gray-300">{score.username}</span>
                    </div>
                    <span className="text-indigo-400 font-medium">
                      {score.score.toLocaleString()} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/0 to-indigo-600/10 
                      opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500 transform origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      </Link>
    </SettingsCard>
  );
};