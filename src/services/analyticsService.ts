import { LeaderboardEntry } from '../types/leaderboard';
import { firestore } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { getDeviceInfo } from '../utils/deviceDetection';

interface GameAnalytics {
  userId: string;
  sessionId: string;
  gameId: string;
  score: number;
  duration: number;
  difficulty: number;
  obstacles: number;
  powerUpsCollected: number;
  timestamp: string;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
  performance: {
    fps: number;
    averageLatency: number;
    memoryUsage: number;
  };
}

interface SessionAnalytics {
  userId: string;
  sessionId: string;
  startTime: string;
  endTime: string;
  gamesPlayed: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  totalDuration: number;
  deviceInfo: {
    type: string;
    browser: string;
    os: string;
  };
}

class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: number;
  private gameStartTime: number;
  private performanceMetrics: number[];
  private isTracking: boolean;

  constructor() {
    this.sessionId = crypto.randomUUID();
    this.sessionStartTime = Date.now();
    this.gameStartTime = 0;
    this.performanceMetrics = [];
    this.isTracking = false;
  }

  // Game Analytics
  async trackGameScore(entry: LeaderboardEntry) {
    try {
      const gameAnalytics: GameAnalytics = {
        userId: entry.userId,
        sessionId: this.sessionId,
        gameId: crypto.randomUUID(),
        score: entry.score,
        duration: Date.now() - this.gameStartTime,
        difficulty: entry.difficulty,
        obstacles: Math.floor(entry.score * 1.5), // Approximate obstacles passed
        powerUpsCollected: Math.floor(entry.score / 10), // Approximate power-ups
        timestamp: new Date().toISOString(),
        deviceInfo: getDeviceInfo(navigator.userAgent),
        performance: this.calculatePerformanceMetrics()
      };

      // Save to Firestore
      await addDoc(collection(firestore, 'gameAnalytics'), gameAnalytics);

      // Update session analytics
      await this.updateSessionAnalytics(gameAnalytics);

      // Track achievements
      await this.checkAndAwardAchievements(entry);

      console.info('Analytics tracked successfully:', gameAnalytics);
    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }

  startGameTracking() {
    this.gameStartTime = Date.now();
    this.isTracking = true;
    this.trackPerformance();
  }

  stopGameTracking() {
    this.isTracking = false;
  }

  private trackPerformance() {
    let lastTime = performance.now();
    const trackFrame = () => {
      if (!this.isTracking) return;

      const now = performance.now();
      const delta = now - lastTime;
      this.performanceMetrics.push(1000 / delta); // FPS
      lastTime = now;

      if (this.performanceMetrics.length > 60) {
        this.performanceMetrics.shift();
      }

      requestAnimationFrame(trackFrame);
    };

    requestAnimationFrame(trackFrame);
  }

  private calculatePerformanceMetrics() {
    const fps = this.performanceMetrics.reduce((a, b) => a + b, 0) / this.performanceMetrics.length;
    
    return {
      fps: Math.round(fps),
      averageLatency: Math.round(1000 / fps),
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0
    };
  }

  // Session Analytics
  private async updateSessionAnalytics(gameAnalytics: GameAnalytics) {
    const sessionRef = collection(firestore, 'sessionAnalytics');
    const q = query(
      sessionRef,
      where('sessionId', '==', this.sessionId),
      limit(1)
    );

    const snapshot = await getDocs(q);
    const existingSession = snapshot.docs[0];

    const sessionData: Partial<SessionAnalytics> = {
      endTime: new Date().toISOString(),
      gamesPlayed: existingSession ? 
        (existingSession.data().gamesPlayed || 0) + 1 : 1,
      totalScore: existingSession ?
        (existingSession.data().totalScore || 0) + gameAnalytics.score : gameAnalytics.score,
      totalDuration: Date.now() - this.sessionStartTime
    };

    if (existingSession) {
      await existingSession.ref.update(sessionData);
    } else {
      await addDoc(sessionRef, {
        userId: gameAnalytics.userId,
        sessionId: this.sessionId,
        startTime: new Date(this.sessionStartTime).toISOString(),
        deviceInfo: gameAnalytics.deviceInfo,
        ...sessionData
      });
    }
  }

  // Achievement Tracking
  private async checkAndAwardAchievements(entry: LeaderboardEntry) {
    const achievements = [
      { id: 'first_game', name: 'First Flight', condition: (score: number) => score > 0 },
      { id: 'score_10', name: 'Getting Started', condition: (score: number) => score >= 10 },
      { id: 'score_50', name: 'High Flyer', condition: (score: number) => score >= 50 },
      { id: 'score_100', name: 'Master Pilot', condition: (score: number) => score >= 100 }
    ];

    const userAchievements = await this.getUserAchievements(entry.userId);
    const newAchievements = achievements.filter(achievement => 
      !userAchievements.includes(achievement.id) && 
      achievement.condition(entry.score)
    );

    if (newAchievements.length > 0) {
      await this.awardAchievements(entry.userId, newAchievements);
    }
  }

  private async getUserAchievements(userId: string): Promise<string[]> {
    const achievementsRef = collection(firestore, 'userAchievements');
    const q = query(achievementsRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data().achievementId);
  }

  private async awardAchievements(userId: string, achievements: Array<{ id: string; name: string }>) {
    const batch = firestore.batch();
    const achievementsRef = collection(firestore, 'userAchievements');

    achievements.forEach(achievement => {
      const docRef = achievementsRef.doc();
      batch.set(docRef, {
        userId,
        achievementId: achievement.id,
        name: achievement.name,
        awardedAt: new Date().toISOString()
      });
    });

    await batch.commit();
  }

  // Analytics Retrieval
  async getUserStats(userId: string) {
    const gamesRef = collection(firestore, 'gameAnalytics');
    const q = query(
      gamesRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const games = snapshot.docs.map(doc => doc.data() as GameAnalytics);

    return {
      totalGames: games.length,
      totalScore: games.reduce((sum, game) => sum + game.score, 0),
      averageScore: games.reduce((sum, game) => sum + game.score, 0) / games.length,
      highestScore: Math.max(...games.map(game => game.score)),
      totalPlayTime: games.reduce((sum, game) => sum + game.duration, 0),
      averageGameDuration: games.reduce((sum, game) => sum + game.duration, 0) / games.length,
      recentGames: games.slice(0, 10)
    };
  }
}

export const analyticsService = new AnalyticsService();