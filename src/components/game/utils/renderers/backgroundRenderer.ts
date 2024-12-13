import { GAME_CONFIG } from '../../config/gameConfig';

export function drawBackground(ctx: CanvasRenderingContext2D, timestamp: number) {
  // Draw gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
  gradient.addColorStop(0, '#1F2937');
  gradient.addColorStop(1, '#111827');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

  // Draw stars
  const stars = generateStars(timestamp);
  stars.forEach(star => {
    ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

function generateStars(timestamp: number) {
  return Array.from({ length: 50 }, (_, i) => {
    const seed = i * 12345;
    const x = (Math.sin(seed) * 10000) % GAME_CONFIG.canvasWidth;
    const y = (Math.cos(seed) * 10000) % GAME_CONFIG.canvasHeight;
    const twinkle = Math.sin(timestamp / 1000 + seed) * 0.5 + 0.5;
    
    return {
      x,
      y,
      size: Math.max(1, (Math.sin(seed * 2) * 2 + 2)),
      opacity: 0.3 + twinkle * 0.4
    };
  });
}