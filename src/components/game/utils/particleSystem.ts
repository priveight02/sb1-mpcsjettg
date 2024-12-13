export const particleSystem = {
  updateParticles: (particles: any[]) => {
    return particles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        currentLife: particle.currentLife - 16.67 // Assuming 60fps
      }))
      .filter(particle => particle.currentLife > 0);
  },

  createScoreParticles: (state: any) => {
    const particles = [];
    for (let i = 0; i < 10; i++) {
      particles.push({
        x: state.habitY + 20,
        y: state.habitY + 20,
        color: '#4F46E5',
        velocity: {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10
        },
        size: Math.random() * 4 + 2,
        lifetime: 1000,
        currentLife: 1000
      });
    }
    state.particles.push(...particles);
  }
};