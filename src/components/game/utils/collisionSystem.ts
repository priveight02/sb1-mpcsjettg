import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

export const collisionSystem = {
  checkCollisions: (state: GameState) => {
    const result = {
      collision: false,
      scored: false
    };

    const habitBox = {
      x: GAME_CONFIG.characterX,
      y: state.habitY,
      width: GAME_CONFIG.characterSize,
      height: GAME_CONFIG.characterSize
    };

    // Check if habit hit the ground or ceiling
    if (state.habitY < 0 || state.habitY > GAME_CONFIG.canvasHeight - GAME_CONFIG.characterSize) {
      result.collision = true;
      return result;
    }

    // Check obstacle collisions and scoring
    state.obstacles.forEach(obstacle => {
      // Check collision with top pipe
      const topPipe = {
        x: obstacle.x,
        y: 0,
        width: GAME_CONFIG.obstacleWidth,
        height: obstacle.gapY - GAME_CONFIG.obstacleGap / 2
      };

      // Check collision with bottom pipe
      const bottomPipe = {
        x: obstacle.x,
        y: obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
        width: GAME_CONFIG.obstacleWidth,
        height: GAME_CONFIG.canvasHeight
      };

      if (checkBoxCollision(habitBox, topPipe) || checkBoxCollision(habitBox, bottomPipe)) {
        result.collision = true;
      }

      // Score point if passed obstacle
      if (!obstacle.passed && obstacle.x + GAME_CONFIG.obstacleWidth < GAME_CONFIG.characterX) {
        result.scored = true;
        obstacle.passed = true;
      }
    });

    return result;
  }
};

function checkBoxCollision(box1: any, box2: any) {
  return (
    box1.x < box2.x + box2.width &&
    box1.x + box1.width > box2.x &&
    box1.y < box2.y + box2.height &&
    box1.y + box1.height > box2.y
  );
}