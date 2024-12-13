import { RenderProps } from '../types/game';
import { GAME_CONFIG } from '../config/gameConfig';
import { effectsSystem } from './effectsSystem';

// Separate rendering systems for better organization
const backgroundRenderer = {
  render(ctx: CanvasRenderingContext2D, timestamp: number) {
    // Base gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, GAME_CONFIG.canvasHeight);
    gradient.addColorStop(0, '#1F2937');
    gradient.addColorStop(1, '#111827');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    // Parallax stars
    const starOffset = (timestamp * GAME_CONFIG.starSpeed) % GAME_CONFIG.canvasWidth;

    for (let i = 0; i < GAME_CONFIG.starCount; i++) {
      const baseX = (i * (GAME_CONFIG.canvasWidth / GAME_CONFIG.starCount));
      const x = ((baseX - starOffset) + GAME_CONFIG.canvasWidth) % GAME_CONFIG.canvasWidth;
      
      const y = (Math.sin((timestamp + i * 1000) * 0.0001) * 5) + 
               (i * (GAME_CONFIG.canvasHeight / GAME_CONFIG.starCount));
      
      const size = Math.sin((timestamp + i * 500) * 0.001) * 0.5 + 1.5;
      const opacity = 
        GAME_CONFIG.starOpacityMin + 
        (Math.sin((timestamp + i * 700) * 0.0005) * 0.5 + 0.5) * 
        (GAME_CONFIG.starOpacityMax - GAME_CONFIG.starOpacityMin);

      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

const obstacleRenderer = {
  render(ctx: CanvasRenderingContext2D, props: RenderProps, timestamp: number) {
    props.gameState.obstacles.forEach(obstacle => {
      // Create cactus-like obstacles
      const drawCactus = (x: number, height: number, isTop: boolean) => {
        const baseWidth = GAME_CONFIG.obstacleWidth;
        const spikeHeight = 15;
        const numSpikes = 3;
        
        // Base gradient
        const gradient = ctx.createLinearGradient(x, 0, x + baseWidth, 0);
        gradient.addColorStop(0, '#047857');  // Darker green
        gradient.addColorStop(0.5, '#059669'); // Medium green
        gradient.addColorStop(1, '#047857');  // Darker green
        
        ctx.fillStyle = gradient;

        // Main body
        ctx.beginPath();
        ctx.roundRect(x, isTop ? 0 : obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
                     baseWidth, height, [0, 0, 8, 8]);
        ctx.fill();

        // Add spikes
        ctx.fillStyle = '#065F46'; // Darker green for spikes
        for (let i = 0; i < numSpikes; i++) {
          const spikeY = isTop ? height - (height / numSpikes) * i - spikeHeight :
                               obstacle.gapY + GAME_CONFIG.obstacleGap / 2 + (height / numSpikes) * i;
          
          // Left spike
          ctx.beginPath();
          ctx.moveTo(x, spikeY);
          ctx.lineTo(x - 10, spikeY + spikeHeight / 2);
          ctx.lineTo(x, spikeY + spikeHeight);
          ctx.fill();

          // Right spike
          ctx.beginPath();
          ctx.moveTo(x + baseWidth, spikeY);
          ctx.lineTo(x + baseWidth + 10, spikeY + spikeHeight / 2);
          ctx.lineTo(x + baseWidth, spikeY + spikeHeight);
          ctx.fill();
        }

        // Animated highlights
        const highlightOpacity = 0.3 + Math.sin(timestamp * 0.003) * 0.1;
        ctx.fillStyle = `rgba(255, 255, 255, ${highlightOpacity})`;
        ctx.fillRect(x + baseWidth * 0.2, isTop ? 0 : obstacle.gapY + GAME_CONFIG.obstacleGap / 2,
                    baseWidth * 0.1, height);
      };

      // Draw top and bottom obstacles
      drawCactus(obstacle.x, obstacle.gapY - GAME_CONFIG.obstacleGap / 2, true);
      drawCactus(obstacle.x, GAME_CONFIG.canvasHeight - (obstacle.gapY + GAME_CONFIG.obstacleGap / 2), false);

      // Draw power-up if present and not collected
      if (obstacle.hasPowerUp && !obstacle.powerUpCollected) {
        const powerUpX = obstacle.x + GAME_CONFIG.obstacleWidth / 2;
        const powerUpY = obstacle.gapY;
        const powerUpSize = 15;
        const glowSize = 20 + Math.sin(timestamp * 0.005) * 5;

        // Glow effect
        const gradient = ctx.createRadialGradient(
          powerUpX, powerUpY, 0,
          powerUpX, powerUpY, glowSize
        );
        gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
        gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(powerUpX, powerUpY, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Power-up orb
        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(powerUpX, powerUpY, powerUpSize, 0, Math.PI * 2);
        ctx.fill();

        // Shine effect
        const shineAngle = timestamp * 0.003;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
          powerUpX + Math.cos(shineAngle) * powerUpSize,
          powerUpY + Math.sin(shineAngle) * powerUpSize
        );
        ctx.lineTo(
          powerUpX + Math.cos(shineAngle + Math.PI) * powerUpSize,
          powerUpY + Math.sin(shineAngle + Math.PI) * powerUpSize
        );
        ctx.stroke();
      }
    });
  }
};

const characterRenderer = {
  render(ctx: CanvasRenderingContext2D, props: RenderProps) {
    const { gameState, selectedHabit, habits } = props;
    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return;

    const rotation = Math.min(Math.max(gameState.velocity.y * 0.05, -0.5), 0.5);

    ctx.save();
    ctx.translate(
      gameState.position.x + GAME_CONFIG.characterSize / 2,
      gameState.position.y + GAME_CONFIG.characterSize / 2
    );
    ctx.rotate(rotation);

    // Shield effect
    if (gameState.powerUps.shield) {
      ctx.beginPath();
      ctx.arc(0, 0, GAME_CONFIG.characterSize * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(79, 70, 229, 0.3)';
      ctx.fill();
    }

    // Character body with glow
    ctx.shadowColor = habit.color;
    ctx.shadowBlur = 15;
    ctx.fillStyle = habit.color;
    ctx.beginPath();
    ctx.roundRect(
      -GAME_CONFIG.characterSize / 2,
      -GAME_CONFIG.characterSize / 2,
      GAME_CONFIG.characterSize,
      GAME_CONFIG.characterSize,
      8
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    // Habit name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(habit.title.slice(0, 10), 0, 4);

    ctx.restore();
  }
};

const particleRenderer = {
  render(ctx: CanvasRenderingContext2D, props: RenderProps) {
    props.gameState.particles.forEach(particle => {
      const lifePercent = particle.life / GAME_CONFIG.particleLifetime;
      ctx.fillStyle = `${particle.color}${Math.floor(lifePercent * 255).toString(16).padStart(2, '0')}`;
      ctx.beginPath();
      ctx.arc(particle.position.x, particle.position.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

const uiRenderer = {
  render(ctx: CanvasRenderingContext2D, props: RenderProps) {
    const { gameState } = props;

    // Score with flash effect
    ctx.save();
    if (gameState.scoreFlash > 0) {
      ctx.shadowColor = '#4F46E5';
      ctx.shadowBlur = 20;
      ctx.font = 'bold 32px sans-serif';
    } else {
      ctx.font = 'bold 24px sans-serif';
    }
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);
    ctx.restore();

    // Power-up indicators
    let yOffset = 70;
    if (gameState.powerUps.shield) {
      ctx.fillStyle = '#4F46E5';
      ctx.font = '16px sans-serif';
      ctx.fillText('Shield Active', 20, yOffset);
      yOffset += 25;
    }

    if (gameState.powerUps.doublePoints) {
      ctx.fillStyle = '#F59E0B';
      ctx.font = '16px sans-serif';
      ctx.fillText('2x Points!', 20, yOffset);
      yOffset += 25;
    }

    // Speed effect indicator
    if (gameState.score >= 50) {
      ctx.fillStyle = '#10B981';
      ctx.font = '16px sans-serif';
      ctx.fillText('Speed Boost!', 20, yOffset);
    }
  }
};

// Main render system that coordinates all renderers
export const renderSystem = {
  render(ctx: CanvasRenderingContext2D, props: RenderProps) {
    const { timestamp } = props;

    // Clear canvas
    ctx.clearRect(0, 0, GAME_CONFIG.canvasWidth, GAME_CONFIG.canvasHeight);

    // Render layers in order
    backgroundRenderer.render(ctx, timestamp);
    
    // Add speed and champion effects
    effectsSystem.createSpeedUpEffect(ctx, props.gameState, timestamp);
    effectsSystem.createFireEffect(ctx, props.gameState, timestamp);
    effectsSystem.createChampionEffect(ctx, props.gameState, timestamp);
    
    obstacleRenderer.render(ctx, props, timestamp);
    particleRenderer.render(ctx, props);
    characterRenderer.render(ctx, props);
    uiRenderer.render(ctx, props);
  }
};