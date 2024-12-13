import { GameState } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';

export const effectsSystem = {
  createSpeedUpEffect(ctx: CanvasRenderingContext2D, state: GameState, timestamp: number) {
    if (state.score >= 50) {
      // Create pulsing border effect
      const borderWidth = 10 + Math.sin(timestamp * 0.005) * 5;
      const borderOpacity = 0.3 + Math.sin(timestamp * 0.005) * 0.1;
      
      ctx.save();
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = borderWidth;
      ctx.globalAlpha = borderOpacity;
      ctx.strokeRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);
      ctx.restore();

      // Create speed lines
      ctx.save();
      ctx.strokeStyle = '#4F46E5';
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.2;
      
      const numLines = 30;
      for (let i = 0; i < numLines; i++) {
        const x = (i / numLines) * GAME_CONFIG.canvasWidth;
        const y = Math.random() * GAME_CONFIG.canvasHeight;
        const length = 100 + Math.random() * 100;
        const speed = timestamp * 0.2;
        
        const xPos = (x + speed) % GAME_CONFIG.canvasWidth;
        
        ctx.beginPath();
        ctx.moveTo(xPos, y);
        ctx.lineTo(xPos - length, y);
        ctx.stroke();
      }
      ctx.restore();
    }
  },

  createFireEffect(ctx: CanvasRenderingContext2D, state: GameState, timestamp: number) {
    if (state.score >= 200) {
      const numParticles = 50;
      
      ctx.save();
      
      // Create fire gradient
      const gradient = ctx.createLinearGradient(0, GAME_CONFIG.canvasHeight, 0, GAME_CONFIG.canvasHeight - 100);
      gradient.addColorStop(0, '#EF4444');
      gradient.addColorStop(0.5, '#F59E0B');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      for (let i = 0; i < numParticles; i++) {
        const x = Math.random() * GAME_CONFIG.canvasWidth;
        const baseHeight = 50 + Math.sin(timestamp * 0.002 + i) * 20;
        const y = GAME_CONFIG.canvasHeight - baseHeight;
        
        // Draw fire particle
        ctx.globalAlpha = 0.3 + Math.random() * 0.2;
        ctx.fillStyle = gradient;
        
        ctx.beginPath();
        ctx.moveTo(x, GAME_CONFIG.canvasHeight);
        ctx.quadraticCurveTo(
          x + 20 * Math.sin(timestamp * 0.005 + i),
          y + baseHeight * 0.5,
          x,
          y
        );
        ctx.quadraticCurveTo(
          x - 20 * Math.sin(timestamp * 0.005 + i),
          y + baseHeight * 0.5,
          x,
          GAME_CONFIG.canvasHeight
        );
        ctx.fill();
      }
      
      // Add glowing embers
      for (let i = 0; i < numParticles / 2; i++) {
        const x = Math.random() * GAME_CONFIG.canvasWidth;
        const y = GAME_CONFIG.canvasHeight - Math.random() * 100;
        const size = 2 + Math.random() * 2;
        
        ctx.globalAlpha = 0.5 + Math.random() * 0.5;
        ctx.fillStyle = '#FCD34D';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  },

  createChampionEffect(ctx: CanvasRenderingContext2D, state: GameState, timestamp: number) {
    if (state.score === 200) {
      const text = 'CHAMPION!';
      const x = GAME_CONFIG.canvasWidth / 2;
      const y = GAME_CONFIG.canvasHeight / 2;
      
      ctx.save();
      
      // Pulsing background glow
      const glowSize = 150 + Math.sin(timestamp * 0.005) * 20;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
      gradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
      gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.2)');
      gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Animated text with multiple layers for intense glow
      const baseSize = 48;
      const scale = 1 + Math.sin(timestamp * 0.005) * 0.1;
      const fontSize = baseSize * scale;
      
      // Outer glow layers
      for (let i = 4; i >= 1; i--) {
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#EF4444';
        ctx.shadowBlur = 20 * i;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * i})`;
        ctx.fillText(text, x, y);
      }
      
      // Main text
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(text, x, y);
      
      // Add floating particles
      const numParticles = 20;
      for (let i = 0; i < numParticles; i++) {
        const angle = (i / numParticles) * Math.PI * 2 + timestamp * 0.001;
        const radius = 80 + Math.sin(timestamp * 0.003 + i) * 20;
        const px = x + Math.cos(angle) * radius;
        const py = y + Math.sin(angle) * radius;
        
        ctx.fillStyle = '#FCD34D';
        ctx.globalAlpha = 0.5 + Math.sin(timestamp * 0.002 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
};