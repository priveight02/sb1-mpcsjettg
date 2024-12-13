import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, X, Medal, Crown, User } from 'lucide-react';
import { useLeaderboardStore } from '../../store/leaderboardStore';
import { format } from 'date-fns';
import { LeaderboardEntry } from '../../types/leaderboard';

interface GameLeaderboardProps {
  onClose: () => void;
}

export const GameLeaderboard: React.FC<GameLeaderboardProps> = ({ onClose }) => {
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'allTime'>('daily');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const { getTopScores } = useLeaderboardStore();

  useEffect(() => {
    // Get initial scores
    const scores = getTopScores(100);
    setEntries(scores);
  }, [getTopScores]);

  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-8 h-8 text-yellow-400" />;
      case 2:
        return <Medal className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-gray-800 rounded-xl w-full max-w-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-semibold text-white">Game Leaderboard</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Timeframe Selection */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex gap-2">
            {[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'allTime', label: 'All Time' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setTimeframe(value as any)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  timeframe === value
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Entries */}
        <div className="max-h-[60vh] overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No scores yet. Be the first to play!
            </div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 flex items-center gap-4 ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-800/50'
                }`}
              >
                <div className="w-12 flex justify-center">
                  {getRankDisplay(index + 1)}
                </div>

                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {entry.username}
                    </div>
                    <div className="text-sm text-gray-400">
                      {format(new Date(entry.timestamp), 'MMM d, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-400">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};