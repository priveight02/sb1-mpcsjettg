import { GAME_CONFIG } from '../../config/gameConfig';

export function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Array<{ x: number; gapY: number }>) {
  obstacles.forEach(obstacle => {
    const obstacleGradient = ctx.createLinearGradient(
      obstacle.x, 0,
      obstacle.x + GAME_CONFIG.obstacleWidth, 0
    );
    obstacleGradient.addColorStop(0, '#4F46E5');
    obstacleGradient.addColorStop(1, '#6366F1');
    ctx.fillStyle = obstacleGradient;

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
  });
}