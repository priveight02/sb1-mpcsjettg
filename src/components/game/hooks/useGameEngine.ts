import { useRef, useCallback, useState } from 'react';
import { GameState, Vector2D } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';
import { useLeaderboardStore } from '../../../store/leaderboardStore';
import { physicsEngine } from '../utils/physicsEngine';
import { particleEngine } from '../utils/particleEngine';
import { audioManager } from '../utils/audioManager';

const INITIAL_STATE: GameState = {
  position: { x: GAME_CONFIG.characterX, y: GAME_CONFIG.canvasHeight / 2 },
  velocity: { x: 0, y: 0 },
  score: 0,
  scoreFlash: 0,
  isPlaying: false,
  gameOver: false,
  obstacles: [],
  particles: [],
  powerUps: {
    shield: false,
    doublePoints: false,
    slowMotion: false
  },
  difficulty: 1.0
};

export const useGameEngine = () => {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const { addScore } = useLeaderboardStore();

  const calculateDifficulty = useCallback((score: number) => {
    // Base difficulty increase every 5 points
    const baseDifficulty = 1.0 + Math.floor(score / 5) * GAME_CONFIG.difficultyIncrease;
    
    // Random fluctuation for unpredictability
    const randomFactor = 1.0 + (Math.random() - 0.5) * 0.05;
    
    // Exponential scaling for long-term challenge
    const exponentialFactor = Math.pow(1.05, Math.floor(score / 20));
    
    return Math.min(
      baseDifficulty * randomFactor * exponentialFactor,
      GAME_CONFIG.maxDifficulty
    );
  }, []);

  const updateGameState = useCallback((deltaTime: number) => {
    setGameState(prevState => {
      if (!prevState.isPlaying || prevState.gameOver) return prevState;

      // Update physics with current difficulty
      const newVelocity = physicsEngine.updateVelocity(
        prevState.velocity,
        GAME_CONFIG.gravity * prevState.difficulty,
        deltaTime
      );

      const newPosition = physicsEngine.updatePosition(
        prevState.position,
        newVelocity,
        deltaTime
      );

      // Update obstacles with scaled speed
      const obstacleSpeed = GAME_CONFIG.obstacleSpeed * prevState.difficulty;
      const updatedObstacles = physicsEngine.updateObstacles(
        prevState.obstacles,
        obstacleSpeed,
        deltaTime
      );

      // Add new obstacles
      if (physicsEngine.shouldAddObstacle(prevState)) {
        updatedObstacles.push(physicsEngine.generateObstacle(GAME_CONFIG));
      }

      // Check collisions
      if (physicsEngine.checkCollisions({ ...prevState, position: newPosition })) {
        audioManager.playSound('collision');
        return { ...prevState, isPlaying: false, gameOver: true };
      }

      // Check scoring and power-ups
      let newScore = prevState.score;
      let scoreFlash = Math.max(0, prevState.scoreFlash - deltaTime / 1000);
      let powerUps = { ...prevState.powerUps };

      updatedObstacles.forEach(obstacle => {
        // Score points for passing obstacles
        if (!obstacle.passed && obstacle.x + GAME_CONFIG.obstacleWidth < newPosition.x) {
          obstacle.passed = true;
          newScore += powerUps.doublePoints ? 2 : 1;
          scoreFlash = 1.0;
          audioManager.playSound('score');
          particleEngine.createScoreParticles(prevState);
        }

        // Collect power-ups
        if (obstacle.hasPowerUp && !obstacle.powerUpCollected) {
          const powerUpBox = {
            x: obstacle.x + GAME_CONFIG.obstacleWidth / 2 - 15,
            y: obstacle.gapY - 15,
            width: 30,
            height: 30
          };

          const characterBox = {
            x: newPosition.x,
            y: newPosition.y,
            width: GAME_CONFIG.characterSize,
            height: GAME_CONFIG.characterSize
          };

          if (physicsEngine.checkBoxCollision(characterBox, powerUpBox)) {
            obstacle.powerUpCollected = true;
            newScore += GAME_CONFIG.powerUpPoints;
            scoreFlash = 1.0;
            audioManager.playSound('powerUp');

            // Apply random power-up effect
            const powerUpType = Math.random() < 0.5 ? 'shield' : 'doublePoints';
            powerUps[powerUpType] = true;
            setTimeout(() => {
              setGameState(state => ({
                ...state,
                powerUps: { ...state.powerUps, [powerUpType]: false }
              }));
            }, GAME_CONFIG.powerUpDuration);

            particleEngine.createPowerUpParticles(prevState);
          }
        }
      });

      // Update difficulty based on score
      const newDifficulty = calculateDifficulty(newScore);

      // Update particles
      const updatedParticles = particleEngine.updateParticles(
        prevState.particles,
        deltaTime
      );

      return {
        ...prevState,
        position: newPosition,
        velocity: newVelocity,
        obstacles: updatedObstacles,
        particles: updatedParticles,
        score: newScore,
        scoreFlash,
        powerUps,
        difficulty: newDifficulty
      };
    });
  }, [calculateDifficulty]);

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    updateGameState(deltaTime);
    frameRef.current = requestAnimationFrame(gameLoop);
  }, [updateGameState]);

  const startGame = useCallback(() => {
    setGameState({
      ...INITIAL_STATE,
      isPlaying: true
    });
    lastTimeRef.current = 0;
    frameRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const jump = useCallback(() => {
    if (!gameState.isPlaying || gameState.gameOver) return;

    setGameState(prev => {
      audioManager.playSound('jump');
      particleEngine.createJumpParticles(prev);
      return {
        ...prev,
        velocity: { ...prev.velocity, y: GAME_CONFIG.jumpForce * prev.difficulty }
      };
    });
  }, [gameState.isPlaying, gameState.gameOver]);

  const endGame = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
    }
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
  }, []);

  return {
    gameState,
    jump,
    startGame,
    endGame
  };
};