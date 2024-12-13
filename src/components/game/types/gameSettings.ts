export type DifficultyPreset = 'easy' | 'medium' | 'hard';

export interface GameSettings {
  gravity: number;
  jumpForce: number;
  obstacleSpeed: number;
  obstacleGap: number;
  obstacleFrequency: number;
  powerUpFrequency: number;
  theme: string;
  effects: boolean;
  difficulty: DifficultyPreset;
}