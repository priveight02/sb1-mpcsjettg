import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LeaderboardEntry } from '../types/leaderboard';
import { useAuthStore } from './authStore';
import { firestore } from '../config/firebase';
import { doc, setDoc, getDoc, collection, query, orderBy, getDocs, limit, onSnapshot, where } from 'firebase/firestore';

interface LeaderboardState {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
}

interface LeaderboardActions {
  addPoints: (userId: string, points: number, metadata?: Record<string, any>) => Promise<void>;
  getTopScores: (limit?: number) => LeaderboardEntry[];
  getUserScore: (userId: string) => LeaderboardEntry | undefined;
  syncLeaderboard: () => Promise<void>;
  startRealtimeSync: () => void;
  stopRealtimeSync: () => void;
  clearError: () => void;
  getLeaderboard: (timeframe: 'daily' | 'weekly' | 'monthly' | 'allTime') => LeaderboardEntry[];
  updateUserStats: () => Promise<void>;
  removeInactiveUsers: () => void;
}

export const useLeaderboardStore = create<LeaderboardState & LeaderboardActions>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,
      unsubscribe: null,

      addPoints: async (userId: string, points: number, metadata = {}) => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          // Get existing user score from Firestore
          const userDocRef = doc(firestore, 'leaderboard', userId);
          const userDoc = await getDoc(userDocRef);
          
          const existingScore = userDoc.exists() ? userDoc.data().score || 0 : 0;
          const newScore = existingScore + points;

          // Update Firestore
          const entry: Omit<LeaderboardEntry, 'id'> = {
            userId,
            username: user.displayName || 'Anonymous',
            score: newScore,
            timestamp: new Date().toISOString(),
            gameVersion: '1.0',
            difficulty: 1,
            metadata: {
              lastUpdated: new Date().toISOString(),
              ...metadata
            }
          };

          await setDoc(userDocRef, entry, { merge: true });

          // Update local state optimistically
          set(state => ({
            entries: state.entries.map(e => 
              e.userId === userId ? { ...e, ...entry, id: userId } : e
            )
          }));
        } catch (error) {
          console.error('Failed to update score:', error);
          set({ error: 'Failed to update score' });
        }
      },

      getTopScores: (limit = 100) => {
        return get().entries
          .sort((a, b) => b.score - a.score)
          .slice(0, limit);
      },

      getUserScore: (userId: string) => {
        return get().entries.find(entry => entry.userId === userId);
      },

      getLeaderboard: (timeframe = 'weekly') => {
        const entries = get().entries;
        const now = new Date();
        
        const filterByTimeframe = (entry: LeaderboardEntry) => {
          const entryDate = new Date(entry.timestamp);
          switch (timeframe) {
            case 'daily':
              return now.getDate() === entryDate.getDate();
            case 'weekly':
              return now.getTime() - entryDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
            case 'monthly':
              return now.getMonth() === entryDate.getMonth();
            case 'allTime':
              return true;
            default:
              return true;
          }
        };

        return entries
          .filter(filterByTimeframe)
          .sort((a, b) => b.score - a.score);
      },

      syncLeaderboard: async () => {
        try {
          set({ isLoading: true });

          // Get all users first
          const usersQuery = query(collection(firestore, 'users'));
          const usersSnapshot = await getDocs(usersQuery);
          const users = new Map(usersSnapshot.docs.map(doc => [
            doc.id,
            { displayName: doc.data().displayName || 'Anonymous' }
          ]));

          // Get leaderboard entries
          const leaderboardQuery = query(
            collection(firestore, 'leaderboard'),
            orderBy('score', 'desc'),
            limit(1000)
          );
          
          const leaderboardSnapshot = await getDocs(leaderboardQuery);
          const entries = leaderboardSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            username: users.get(doc.id)?.displayName || 'Anonymous'
          })) as LeaderboardEntry[];

          set({
            entries: entries.sort((a, b) => b.score - a.score),
            isLoading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to sync leaderboard:', error);
          set({
            isLoading: false,
            error: 'Failed to sync leaderboard'
          });
        }
      },

      startRealtimeSync: () => {
        // Stop any existing subscription
        get().stopRealtimeSync();

        // Set up realtime listener
        const q = query(
          collection(firestore, 'leaderboard'),
          orderBy('score', 'desc'),
          limit(1000)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
          try {
            // Get all users first
            const usersQuery = query(collection(firestore, 'users'));
            const usersSnapshot = await getDocs(usersQuery);
            const users = new Map(usersSnapshot.docs.map(doc => [
              doc.id,
              { displayName: doc.data().displayName || 'Anonymous' }
            ]));

            // Process leaderboard entries
            const entries = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              username: users.get(doc.id)?.displayName || 'Anonymous'
            })) as LeaderboardEntry[];

            set({
              entries: entries.sort((a, b) => b.score - a.score),
              isLoading: false,
              error: null
            });
          } catch (error) {
            console.error('Realtime sync error:', error);
            set({ error: 'Failed to sync leaderboard' });
          }
        });

        set({ unsubscribe });
      },

      stopRealtimeSync: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },

      updateUserStats: async () => {
        const { user } = useAuthStore.getState();
        if (!user) return;

        try {
          const userRef = doc(firestore, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            await setDoc(userRef, {
              lastActive: new Date().toISOString(),
              gamesPlayed: (userDoc.data().gamesPlayed || 0) + 1
            }, { merge: true });
          }
        } catch (error) {
          console.error('Failed to update user stats:', error);
        }
      },

      removeInactiveUsers: () => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        set(state => ({
          entries: state.entries.filter(entry => 
            new Date(entry.timestamp) > thirtyDaysAgo
          )
        }));
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'leaderboard-storage',
      version: 1,
      onRehydrateStorage: () => (state) => {
        // Start realtime sync on rehydration
        if (state) {
          state.startRealtimeSync();
        }
      }
    }
  )
);