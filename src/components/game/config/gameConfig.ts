export const GAME_CONFIG = {
  // Physics - Balanced movement
  gravity: 800.0,         // Slower falling
  jumpForce: -400,        // More controlled jump height
  terminalVelocity: 600,  // Slower max speed
  
  // Obstacles - Better spacing for gameplay
  obstacleSpeed: 200,     // Slower obstacle movement
  obstacleWidth: 50,
  obstacleGap: 200,       // Comfortable gap for playability
  obstacleFrequency: 400, // More space between obstacles
  minObstacleHeight: 100,
  maxObstacleHeight: 300,
  
  // Character
  characterSize: 40,
  characterX: 100,
  
  // Canvas
  canvasWidth: 800,
  canvasHeight: 500,
  
  // Points
  basePoints: 1,
  powerUpPoints: 5,
  comboMultiplier: 0.1,
  
  // Difficulty scaling
  difficultyIncrease: 0.05,  // Slower difficulty increase
  maxDifficulty: 2.0,        // Lower max difficulty
  
  // Power-ups
  powerUpFrequency: 0.2,     // Slightly less frequent power-ups
  powerUpDuration: 5000,
  
  // Visual effects
  particleCount: 20,
  particleLifetime: 300,
  
  // Background
  starSpeed: 0.05,
  starCount: 50,
  starOpacityMin: 0.2,
  starOpacityMax: 0.5,

  // Sound effects
  soundEffects: {
    jump: 0.3,
    score: 0.4,
    powerUp: 0.5,
    collision: 0.4
  }
} as const;