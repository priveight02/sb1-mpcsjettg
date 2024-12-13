import { GAME_CONFIG } from '../config/gameConfig';

export const checkCollision = (
  characterY: number,
  obstacle: { x: number; gapY: number }
): boolean => {
  const characterBox = {
    x: GAME_CONFIG.characterX,
    y: characterY,
    width: GAME_CONFIG.characterSize,
    height: GAME_CONFIG.characterSize
  };

  const topObstacle = {
    x: obstacle.x,
    y: 0,
    width: GAME_CONFIG.obstacleWidth,
    height: obstacle.gapY - GAME_CONFIG.obstacleGap / 2
  };

  const bottomObstacle = {
    x: obstacle.x,
    y: obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
    width: GAME_CONFIG.obstacleWidth,
    height: GAME_CONFIG.canvasHeight - (obstacle.gapY + GAME_CONFIG.obstacleGap / 2)
  };

  return (
    boxCollision(characterBox, topObstacle) ||
    boxCollision(characterBox, bottomObstacle)
  );
};

const boxCollision = (
  box1: { x: number; y: number; width: number; height: number },
  box2: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
};

export const generateObstacle = () => {
  const gapY = Math.random() * (
    GAME_CONFIG.canvasHeight - GAME_CONFIG.minObstacleHeight * 2 - GAME_CONFIG.obstacleGap
  ) + GAME_CONFIG.minObstacleHeight;

  return {
    x: GAME_CONFIG.canvasWidth,
    gapY,
    passed: false,
    hasPowerUp: Math.random() < GAME_CONFIG.powerUpFrequency
  };
};

export const calculateScore = (baseScore: number, combo: number): number => {
  return Math.floor(baseScore * (1 + combo * GAME_CONFIG.comboMultiplier));
};

export const getDifficultyMultiplier = (score: number): number => {
  const multiplier = 1 + Math.floor(score / 10) * GAME_CONFIG.difficultyIncrease;
  return Math.min(multiplier, GAME_CONFIG.maxDifficulty);
};

export const generateParticles = (x: number, y: number, color: string, count: number) => {
  return Array.from({ length: count }, () => ({
    x,
    y,
    color,
    velocity: {
      x: (Math.random() - 0.5) * 10,
      y: (Math.random() - 0.5) * 10
    },
    size: Math.random() * 4 + 2,
    lifetime: GAME_CONFIG.particleLifetime,
    currentLife: GAME_CONFIG.particleLifetime
  }));
};

export const updateParticles = (particles: any[]) => {
  return particles
    .map(particle => ({
      ...particle,
      x: particle.x + particle.velocity.x,
      y: particle.y + particle.velocity.y,
      currentLife: particle.currentLife - 16.67 // Assuming 60fps
    }))
    .filter(particle => particle.currentLife > 0);
};

export const drawParticles = (ctx: CanvasRenderingContext2D, particles: any[]) => {
  particles.forEach(particle => {
    const opacity = particle.currentLife / particle.lifetime;
    ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
};