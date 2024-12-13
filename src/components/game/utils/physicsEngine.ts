import { Vector2D, GameState, Obstacle } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

export const physicsEngine = {
  updateVelocity(velocity: Vector2D, gravity: number, deltaTime: number): Vector2D {
    return {
      x: velocity.x,
      y: Math.min(
        velocity.y + gravity * (deltaTime / 1000),
        GAME_CONFIG.terminalVelocity
      )
    };
  },

  updatePosition(position: Vector2D, velocity: Vector2D, deltaTime: number): Vector2D {
    return {
      x: position.x,
      y: Math.max(0, Math.min(
        position.y + velocity.y * (deltaTime / 1000),
        GAME_CONFIG.canvasHeight - GAME_CONFIG.characterSize
      ))
    };
  },

  updateObstacles(obstacles: Obstacle[], speed: number, deltaTime: number): Obstacle[] {
    return obstacles
      .map(obstacle => ({
        ...obstacle,
        x: obstacle.x - speed * (deltaTime / 1000)
      }))
      .filter(obstacle => obstacle.x > -GAME_CONFIG.obstacleWidth);
  },

  checkCollisions(state: GameState): boolean {
    const characterBox = {
      x: state.position.x,
      y: state.position.y,
      width: GAME_CONFIG.characterSize,
      height: GAME_CONFIG.characterSize
    };

    return state.obstacles.some(obstacle => {
      const topPipe = {
        x: obstacle.x,
        y: 0,
        width: GAME_CONFIG.obstacleWidth,
        height: obstacle.gapY - GAME_CONFIG.obstacleGap / 2
      };

      const bottomPipe = {
        x: obstacle.x,
        y: obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
        width: GAME_CONFIG.obstacleWidth,
        height: GAME_CONFIG.canvasHeight
      };

      return this.checkBoxCollision(characterBox, topPipe) || 
             this.checkBoxCollision(characterBox, bottomPipe);
    });
  },

  checkBoxCollision(box1: any, box2: any): boolean {
    return (
      box1.x < box2.x + box2.width &&
      box1.x + box1.width > box2.x &&
      box1.y < box2.y + box2.height &&
      box1.y + box1.height > box2.y
    );
  },

  checkScoring(state: GameState): { scored: boolean } {
    const result = { scored: false };
    
    state.obstacles.forEach(obstacle => {
      if (!obstacle.passed && 
          obstacle.x + GAME_CONFIG.obstacleWidth < state.position.x) {
        obstacle.passed = true;
        result.scored = true;
      }
    });

    return result;
  },

  shouldAddObstacle(state: GameState): boolean {
    return state.obstacles.length === 0 || 
           state.obstacles[state.obstacles.length - 1].x < 
           GAME_CONFIG.canvasWidth - GAME_CONFIG.obstacleFrequency;
  },

  generateObstacle(config: typeof GAME_CONFIG): Obstacle {
    return {
      x: config.canvasWidth,
      gapY: Math.random() * (config.canvasHeight - 300) + 150,
      passed: false,
      hasPowerUp: Math.random() < config.powerUpFrequency
    };
  }
};