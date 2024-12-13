import { GameState, Particle } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

export const particleEngine = {
  updateParticles(particles: Particle[], deltaTime: number): Particle[] {
    return particles
      .map(particle => ({
        ...particle,
        position: {
          x: particle.position.x + particle.velocity.x * (deltaTime / 1000),
          y: particle.position.y + particle.velocity.y * (deltaTime / 1000)
        },
        life: particle.life - deltaTime
      }))
      .filter(particle => particle.life > 0);
  },

  createJumpParticles(state: GameState): void {
    // Reduced number of particles and opacity for jumps
    const particles: Particle[] = Array.from({ length: 5 }, () => ({
      position: { ...state.position },
      velocity: {
        x: (Math.random() - 0.5) * 100, // Reduced velocity
        y: Math.random() * 100 + 50 // Reduced velocity
      },
      color: 'rgba(255, 255, 255, 0.3)', // Reduced opacity
      size: Math.random() * 2 + 1, // Smaller particles
      life: 300 + Math.random() * 200 // Shorter lifetime
    }));

    state.particles.push(...particles);
  },

  createScoreParticles(state: GameState): void {
    const particles: Particle[] = Array.from({ length: 10 }, () => ({
      position: {
        x: state.position.x + GAME_CONFIG.characterSize / 2,
        y: state.position.y + GAME_CONFIG.characterSize / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 300,
        y: (Math.random() - 0.5) * 300
      },
      color: '#FFD700',
      size: Math.random() * 4 + 3,
      life: 800 + Math.random() * 400
    }));

    state.particles.push(...particles);
  },

  createPowerUpParticles(state: GameState): void {
    // Increased number of particles for power-ups
    const particles: Particle[] = Array.from({ length: 30 }, () => ({
      position: {
        x: state.position.x + GAME_CONFIG.characterSize / 2,
        y: state.position.y + GAME_CONFIG.characterSize / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 500, // Increased velocity
        y: (Math.random() - 0.5) * 500  // Increased velocity
      },
      color: Math.random() > 0.5 ? '#F59E0B' : '#FBBF24', // Mix of orange shades
      size: Math.random() * 6 + 4, // Larger particles
      life: 1200 + Math.random() * 800 // Longer lifetime
    }));

    // Add some sparkle particles
    const sparkles: Particle[] = Array.from({ length: 15 }, () => ({
      position: {
        x: state.position.x + GAME_CONFIG.characterSize / 2,
        y: state.position.y + GAME_CONFIG.characterSize / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800
      },
      color: '#FFFFFF',
      size: Math.random() * 3 + 1,
      life: 600 + Math.random() * 400
    }));

    state.particles.push(...particles, ...sparkles);
  },

  createCollisionParticles(state: GameState): void {
    const particles: Particle[] = Array.from({ length: 25 }, () => ({
      position: {
        x: state.position.x + GAME_CONFIG.characterSize / 2,
        y: state.position.y + GAME_CONFIG.characterSize / 2
      },
      velocity: {
        x: (Math.random() - 0.5) * 500,
        y: (Math.random() - 0.5) * 500
      },
      color: '#EF4444',
      size: Math.random() * 4 + 3,
      life: 600 + Math.random() * 300
    }));

    state.particles.push(...particles);
  }
};