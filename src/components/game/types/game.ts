export interface Vector2D {
  x: number;
  y: number;
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  color: string;
  size: number;
  life: number;
}

export interface Obstacle {
  x: number;
  gapY: number;
  passed: boolean;
  hasPowerUp: boolean;
  powerUpCollected?: boolean;
}

export interface PowerUps {
  shield: boolean;
  doublePoints: boolean;
  slowMotion: boolean;
}

export interface GameState {
  position: Vector2D;
  velocity: Vector2D;
  score: number;
  scoreFlash: number;
  isPlaying: boolean;
  gameOver: boolean;
  obstacles: Obstacle[];
  particles: Particle[];
  powerUps: PowerUps;
  difficulty: number;
}

export interface RenderProps {
  gameState: GameState;
  selectedHabit: string;
  habits: any[];
  timestamp: number;
}