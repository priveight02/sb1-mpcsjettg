import { useState, useRef, useCallback } from 'react';
import { useLeaderboardStore } from '../../../store/leaderboardStore';
import { useAuthStore } from '../../../store/authStore';
import { GAME_CONFIG } from '../config/gameConfig';
import { audioManager } from '../utils/audioManager';
import { GameState } from '../types/game';
import toast from 'react-hot-toast';

const initialState: GameState = {
  score: 0,
  isPlaying: false,
  gameOver: false,
  habitY: GAME_CONFIG.canvasHeight / 2,
  velocity: 0,
  obstacles: [],
  particles: [],
  powerUps: {
    shield: false,
    doublePoints: false,
    slowMotion: false
  }
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const { user } = useAuthStore();
  const { addPoints } = useLeaderboardStore();

  const resetGame = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setGameState(initialState);
  }, []);

  const startGame = useCallback(() => {
    setGameState({
      ...initialState,
      isPlaying: true,
      obstacles: [{
        x: GAME_CONFIG.canvasWidth,
        gapY: GAME_CONFIG.canvasHeight / 2,
        passed: false
      }]
    });
    lastTimeRef.current = performance.now();
  }, []);

  const handleJump = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    audioManager.playSound('jump');
    setGameState(prev => ({
      ...prev,
      velocity: GAME_CONFIG.jumpForce
    }));
  }, [gameState.isPlaying, gameState.gameOver]);

  const handleGameOver = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }

    audioManager.playSound('collision');

    if (user) {
      const points = Math.floor(gameState.score * 10);
      addPoints(user.uid, points);
      toast.success(`Game Over! Earned ${points} points!`);
    }

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      gameOver: true
    }));
  }, [user, addPoints, gameState.score]);

  const updateGameState = useCallback((deltaTime: number) => {
    setGameState(prev => {
      if (!prev.isPlaying || prev.gameOver) return prev;

      // Update physics
      const newVelocity = prev.velocity + GAME_CONFIG.gravity;
      const newY = prev.habitY + newVelocity;

      // Check bounds
      if (newY < 0 || newY > GAME_CONFIG.canvasHeight - GAME_CONFIG.characterSize) {
        handleGameOver();
        return prev;
      }

      // Update obstacles
      const updatedObstacles = prev.obstacles
        .map(obstacle => ({
          ...obstacle,
          x: obstacle.x - GAME_CONFIG.obstacleSpeed
        }))
        .filter(obstacle => obstacle.x > -GAME_CONFIG.obstacleWidth);

      // Add new obstacles
      if (updatedObstacles.length === 0 || 
          updatedObstacles[updatedObstacles.length - 1].x < 
          GAME_CONFIG.canvasWidth - GAME_CONFIG.obstacleFrequency) {
        updatedObstacles.push({
          x: GAME_CONFIG.canvasWidth,
          gapY: Math.random() * (GAME_CONFIG.canvasHeight - 300) + 150,
          passed: false
        });
      }

      // Check collisions and scoring
      let newScore = prev.score;
      for (const obstacle of updatedObstacles) {
        if (obstacle.x < GAME_CONFIG.characterX + GAME_CONFIG.characterSize &&
            obstacle.x + GAME_CONFIG.obstacleWidth > GAME_CONFIG.characterX) {
          if (newY < obstacle.gapY - GAME_CONFIG.obstacleGap / 2 ||
              newY + GAME_CONFIG.characterSize > obstacle.gapY + GAME_CONFIG.obstacleGap / 2) {
            if (!prev.powerUps.shield) {
              handleGameOver();
              return prev;
            }
          }
        }

        if (!obstacle.passed && obstacle.x + GAME_CONFIG.obstacleWidth < GAME_CONFIG.characterX) {
          obstacle.passed = true;
          audioManager.playSound('score');
          newScore += prev.powerUps.doublePoints ? 2 : 1;
        }
      }

      // Update particles
      const updatedParticles = prev.particles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.velocity.x,
          y: particle.y + particle.velocity.y,
          currentLife: particle.currentLife - deltaTime
        }))
        .filter(particle => particle.currentLife > 0);

      return {
        ...prev,
        score: newScore,
        habitY: newY,
        velocity: newVelocity,
        obstacles: updatedObstacles,
        particles: updatedParticles
      };
    });
  }, [handleGameOver]);

  return {
    gameState,
    setGameState,
    frameRef,
    lastTimeRef,
    resetGame,
    startGame,
    handleJump,
    handleGameOver,
    updateGameState
  };
};