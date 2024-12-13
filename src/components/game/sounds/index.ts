// Sound file imports
import jumpSound from '../../../assets/sounds/jump.mp3';
import scoreSound from '../../../assets/sounds/score.mp3';
import collisionSound from '../../../assets/sounds/collision.mp3';
import powerUpSound from '../../../assets/sounds/powerup.mp3';

// Sound configuration
export const SOUNDS = {
  jump: {
    src: jumpSound,
    volume: 0.3,
    pool: 3 // Number of simultaneous plays allowed
  },
  score: {
    src: scoreSound,
    volume: 0.4,
    pool: 3
  },
  collision: {
    src: collisionSound,
    volume: 0.5,
    pool: 1
  },
  powerUp: {
    src: powerUpSound,
    volume: 0.6,
    pool: 2
  }
} as const;

export type SoundName = keyof typeof SOUNDS;