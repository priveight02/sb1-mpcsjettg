import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Medal, Crown, Star, Users, X, Activity, ArrowUp, ArrowDown, User } from 'lucide-react';
import { useLeaderboardStore } from '../store/leaderboardStore';
import { useAuthStore } from '../store/authStore';
import clsx from 'clsx';

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const { entries, isLoading, error, syncLeaderboard, startRealtimeSync, stopRealtimeSync } = useLeaderboardStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const { user, isGuest } = useAuthStore();

  useEffect(() => {
    // Initial sync
    syncLeaderboard();
    
    // Start real-time updates
    startRealtimeSync();

    // Cleanup
    return () => {
      stopRealtimeSync();
    };
  }, []);

  const leaderboard = entries.map((entry, index) => ({
    ...entry,
    rank: {
      current: index + 1,
      change: 0 // You could calculate this by comparing with previous rankings
    },
    achievements: [], // Add achievements if you have them
    completionRate: 0, // Add if you track this
    streak: 0 // Add if you track this
  }));

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    return 'bg-gray-700 text-gray-300';
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="relative">
            <Crown className="w-8 h-8 text-yellow-400 animate-pulse" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </motion.div>
          </div>
        );
      case 2:
        return <Trophy className="w-7 h-7 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-700" />;
      default:
        return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankChange = (change: number) => {
    if (change === 0) return null;
    return change > 0 ? (
      <div className="flex items-center gap-1 text-green-400">
        <ArrowUp className="w-4 h-4" />
        <span className="text-xs">{change}</span>
      </div>
    ) : (
      <div className="flex items-center gap-1 text-red-400">
        <ArrowDown className="w-4 h-4" />
        <span className="text-xs">{Math.abs(change)}</span>
      </div>
    );
  };

  if (error) {
    return (
      <div className="bg-gray-800 rounded-xl p-6 text-center">
        <Activity className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">Failed to Load Leaderboard</h3>
        <p className="text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => syncLeaderboard()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl shadow-lg overflow-hidden"
    >
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Global Leaderboard</h2>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value as any)}
              className="px-3 py-1 text-sm rounded-lg border border-gray-600 
                       bg-gray-700 text-gray-300"
            >
              <option value="weekly">This Week</option>
              <option value="monthly">This Month</option>
              <option value="allTime">All Time</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-700"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="p-8 text-center text-gray-400">
          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No Active Users Yet</p>
          <p className="text-sm mt-1">Start tracking your habits to appear on the leaderboard!</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-700 max-h-[70vh] overflow-y-auto">
          {leaderboard.map((userData, index) => (
            <motion.div
              key={userData.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={clsx(
                'p-4 flex items-center gap-4',
                userData.userId === user?.uid && 'bg-indigo-900/20',
                index < 3 && 'bg-gradient-to-r',
                index === 0 && 'from-yellow-900/20',
                index === 1 && 'from-gray-800/50',
                index === 2 && 'from-amber-900/20'
              )}
            >
              <div className="w-12 flex justify-center">{getRankIcon(userData.rank.current)}</div>
              <div className="flex items-center gap-3 flex-1">
                {/* Profile Picture or Guest Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {userData.metadata?.photoURL ? (
                    <img
                      src={userData.metadata.photoURL}
                      alt={userData.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">
                      {userData.username}
                    </span>
                    {userData.metadata?.isGuest && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-gray-700 text-gray-400">
                        Guest
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {userData.streak} day streak • {userData.completionRate}% completion rate
                  </div>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                <div>
                  <div className="text-2xl font-bold text-indigo-400">
                    {userData.score.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">points</div>
                </div>
                {getRankChange(userData.rank.change)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};