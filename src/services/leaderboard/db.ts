import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp,
  Timestamp,
  FirestoreError
} from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { LeaderboardEntry } from './types';

const COLLECTION = 'leaderboard';

export const leaderboardDb = {
  async getTopScores(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(firestore, COLLECTION),
        orderBy('score', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString()
      })) as LeaderboardEntry[];
    } catch (error) {
      console.error('Failed to fetch top scores:', error);
      throw new Error('Failed to fetch leaderboard data');
    }
  },

  async getUserScores(userId: string): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(firestore, COLLECTION),
        where('userId', '==', userId),
        orderBy('score', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().timestamp as Timestamp).toDate().toISOString()
      })) as LeaderboardEntry[];
    } catch (error) {
      console.error('Failed to fetch user scores:', error);
      throw new Error('Failed to fetch user scores');
    }
  },

  async addScore(entry: Omit<LeaderboardEntry, 'id' | 'timestamp'>): Promise<LeaderboardEntry> {
    try {
      const docRef = await addDoc(collection(firestore, COLLECTION), {
        ...entry,
        timestamp: serverTimestamp()
      });

      return {
        id: docRef.id,
        ...entry,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to add score:', error);
      throw new Error('Failed to save score');
    }
  }
};