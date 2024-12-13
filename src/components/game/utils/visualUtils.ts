import { GAME_CONFIG } from '../config/gameConfig';

export const drawBackground = (
  ctx: CanvasRenderingContext2D,
  scrollOffset: number
) => {
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
  gradient.addColorStop(0, '#1F2937');
  gradient.addColorStop(1, '#111827');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

  // Draw parallax stars
  drawStars(ctx, scrollOffset);
};

const drawStars = (ctx: CanvasRenderingContext2D, scrollOffset: number) => {
  // Generate deterministic stars
  const stars = generateStars();

  stars.forEach(star => {
    const x = (star.x + scrollOffset * star.parallax) % GAME_CONFIG.canvasWidth;
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
};

const generateStars = () => {
  const stars = [];
  const seed = 12345; // Consistent seed for deterministic generation
  
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: pseudoRandom(seed + i) * GAME_CONFIG.canvasWidth,
      y: pseudoRandom(seed + i + 1) * GAME_CONFIG.canvasHeight,
      size: pseudoRandom(seed + i + 2) * 2 + 1,
      opacity: pseudoRandom(seed + i + 3) * 0.5 + 0.5,
      parallax: pseudoRandom(seed + i + 4) * 0.5 + 0.5
    });
  }
  
  return stars;
};

const pseudoRandom = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const drawHabitCharacter = (
  ctx: CanvasRenderingContext2D,
  y: number,
  color: string,
  title: string
) => {
  // Draw character body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(
    GAME_CONFIG.characterX,
    y,
    GAME_CONFIG.characterSize,
    GAME_CONFIG.characterSize,
    8
  );
  ctx.fill();

  // Draw character title
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    title.slice(0, 10),
    GAME_CONFIG.characterX + GAME_CONFIG.characterSize / 2,
    y + GAME_CONFIG.characterSize / 2
  );
};

export const drawObstacles = (
  ctx: CanvasRenderingContext2D,
  obstacles: any[]
) => {
  obstacles.forEach(obstacle => {
    const gradient = ctx.createLinearGradient(
      obstacle.x,
      0,
      obstacle.x + GAME_CONFIG.obstacleWidth,
      0
    );
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = gradient;

    // Top obstacle
    ctx.beginPath();
    ctx.roundRect(
      obstacle.x,
      0,
      GAME_CONFIG.obstacleWidth,
      obstacle.gapY - GAME_CONFIG.obstacleGap / 2,
      [0, 0, 8, 8]
    );
    ctx.fill();

    // Bottom obstacle
    ctx.beginPath();
    ctx.roundRect(
      obstacle.x,
      obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
      GAME_CONFIG.obstacleWidth,
      GAME_CONFIG.canvasHeight - (obstacle.gapY + GAME_CONFIG.obstacleGap / 2),
      [8, 8, 0, 0]
    );
    ctx.fill();

    // Draw power-up if present
    if (obstacle.hasPowerUp) {
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(
        obstacle.x + GAME_CONFIG.obstacleWidth / 2,
        obstacle.gapY,
        15,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  });
};

export const drawScore = (
  ctx: CanvasRenderingContext2D,
  score: number,
  combo: number
) => {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 40);

  if (combo > 1) {
    ctx.fillStyle = '#F59E0B';
    ctx.font = '18px sans-serif';
    ctx.fillText(`${combo}x Combo!`, 20, 70);
  }
};

export const drawParticles = (
  ctx: CanvasRenderingContext2D,
  particles: Array<{
    x: number;
    y: number;
    color: string;
    size: number;
    currentLife: number;
    lifetime: number;
  }>
) => {
  particles.forEach(particle => {
    const opacity = particle.currentLife / particle.lifetime;
    ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
};