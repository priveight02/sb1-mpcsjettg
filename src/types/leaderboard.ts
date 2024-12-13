export type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'allTime';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  timestamp: string;
  gameVersion: string;
  difficulty: number;
  metadata?: Record<string, any>;
}

export interface LeaderboardStats {
  totalGames: number;
  averageScore: number;
  highestScore: number;
  mostActivePlayer: string;
  recentActivity: LeaderboardEntry[];
}