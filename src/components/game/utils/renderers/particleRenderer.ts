export function drawParticles(ctx: CanvasRenderingContext2D, particles: Array<{
  x: number;
  y: number;
  color: string;
  size: number;
  currentLife: number;
  lifetime: number;
}>) {
  particles.forEach(particle => {
    ctx.shadowColor = particle.color;
    ctx.shadowBlur = 10;
    const opacity = particle.currentLife / particle.lifetime;
    ctx.fillStyle = `${particle.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;
}