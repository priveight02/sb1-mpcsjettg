import { Timestamp } from 'firebase/firestore';

export interface LeaderboardEntry {
  id: string;
  userId: string;
  username: string;
  score: number;
  timestamp: string;
  gameId: string;
  metadata?: {
    gameVersion?: string;
    deviceInfo?: string;
    [key: string]: any;
  };
}

export interface LeaderboardSync {
  entries: LeaderboardEntry[];
  lastSyncTimestamp: string;
}