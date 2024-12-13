import { 
  collection, 
  query, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  where, 
  orderBy, 
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
  DocumentReference 
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { LeaderboardEntry } from '../types/leaderboard';

export const leaderboardService = {
  async saveEntry(entry: LeaderboardEntry): Promise<LeaderboardEntry> {
    try {
      // Add server timestamp
      const entryWithTimestamp = {
        ...entry,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(firestore, 'leaderboard'), entryWithTimestamp);
      
      // Get the newly created document to return with server timestamp
      const docSnap = await getDoc(docRef);
      const data = docSnap.data();

      if (!data) {
        throw new Error('Failed to create leaderboard entry');
      }

      // Convert Firestore Timestamp to ISO string
      return {
        ...entry,
        id: docRef.id,
        timestamp: (data.createdAt as Timestamp).toDate().toISOString()
      };
    } catch (error) {
      console.error('Error saving leaderboard entry:', error);
      throw new Error('Failed to save leaderboard entry');
    }
  },

  async updateEntry(id: string, updates: Partial<LeaderboardEntry>): Promise<void> {
    try {
      const docRef = doc(firestore, 'leaderboard', id);
      
      // Add server timestamp for update
      const updatesWithTimestamp = {
        ...updates,
        updatedAt: serverTimestamp()
      };

      await updateDoc(docRef, updatesWithTimestamp);
    } catch (error) {
      console.error('Error updating leaderboard entry:', error);
      throw new Error('Failed to update leaderboard entry');
    }
  },

  async removeEntry(id: string): Promise<void> {
    try {
      const docRef = doc(firestore, 'leaderboard', id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error removing leaderboard entry:', error);
      throw new Error('Failed to remove leaderboard entry');
    }
  },

  async syncEntries(localEntries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    try {
      // Get all server entries
      const q = query(
        collection(firestore, 'leaderboard'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      // Convert server entries to the correct format
      const serverEntries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          timestamp: data.createdAt ? (data.createdAt as Timestamp).toDate().toISOString() : new Date().toISOString()
        } as LeaderboardEntry;
      });

      // Merge entries with Map for efficient duplicate handling
      const mergedEntries = new Map<string, LeaderboardEntry>();
      
      // Process local entries
      localEntries.forEach(entry => {
        mergedEntries.set(entry.id, entry);
      });

      // Process server entries, overwriting local entries if server version is newer
      serverEntries.forEach(entry => {
        const existing = mergedEntries.get(entry.id);
        if (!existing || new Date(entry.timestamp) > new Date(existing.timestamp)) {
          mergedEntries.set(entry.id, entry);
        }
      });

      // Convert Map back to array and sort by score
      const sortedEntries = Array.from(mergedEntries.values())
        .sort((a, b) => b.score - a.score);

      // Update any local entries that don't exist on the server
      const localOnlyEntries = sortedEntries.filter(
        entry => !serverEntries.some(serverEntry => serverEntry.id === entry.id)
      );

      // Batch save local-only entries to server
      await Promise.all(
        localOnlyEntries.map(async entry => {
          try {
            await this.saveEntry(entry);
          } catch (error) {
            console.error('Error syncing local entry:', error);
          }
        })
      );

      return sortedEntries;
    } catch (error) {
      console.error('Error syncing leaderboard:', error);
      // Return local entries as fallback
      return localEntries.sort((a, b) => b.score - a.score);
    }
  },

  async getTopScores(limit: number = 100): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(firestore, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().createdAt as Timestamp).toDate().toISOString()
      })) as LeaderboardEntry[];
    } catch (error) {
      console.error('Error fetching top scores:', error);
      throw new Error('Failed to fetch top scores');
    }
  },

  async getUserScores(userId: string): Promise<LeaderboardEntry[]> {
    try {
      const q = query(
        collection(firestore, 'leaderboard'),
        where('userId', '==', userId),
        orderBy('score', 'desc')
      );
      
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: (doc.data().createdAt as Timestamp).toDate().toISOString()
      })) as LeaderboardEntry[];
    } catch (error) {
      console.error('Error fetching user scores:', error);
      throw new Error('Failed to fetch user scores');
    }
  }
};