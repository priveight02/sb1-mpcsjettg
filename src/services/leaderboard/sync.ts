import { Timestamp } from 'firebase/firestore';
import { leaderboardDb } from './db';
import { LeaderboardDocument } from './types';

export const leaderboardSync = {
  async syncWithServer(localEntries: LeaderboardDocument[], lastSync: string | null) {
    try {
      // Get all entries updated since last sync
      const lastSyncTimestamp = lastSync ? Timestamp.fromDate(new Date(lastSync)) : Timestamp.fromMillis(0);
      const serverEntries = await leaderboardDb.getAllSince(lastSyncTimestamp);

      // Merge entries efficiently
      const mergedEntries = new Map<string, LeaderboardDocument>();
      
      // Add local entries first
      localEntries.forEach(entry => {
        mergedEntries.set(entry.userId + entry.gameId, entry);
      });

      // Merge server entries, preferring server version if newer
      serverEntries.forEach(serverEntry => {
        const key = serverEntry.userId + serverEntry.gameId;
        const localEntry = mergedEntries.get(key);
        
        if (!localEntry || serverEntry.updatedAt > localEntry.updatedAt) {
          mergedEntries.set(key, serverEntry);
        }
      });

      // Sync local-only entries to server
      const localOnlyEntries = Array.from(mergedEntries.values())
        .filter(entry => !serverEntries.some(s => s.userId === entry.userId && s.gameId === entry.gameId));

      await Promise.all(
        localOnlyEntries.map(entry => leaderboardDb.create(entry))
      );

      return {
        entries: Array.from(mergedEntries.values()).sort((a, b) => b.score - a.score),
        lastSyncTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }
};