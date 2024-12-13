import { GAME_CONFIG } from '../../config/gameConfig';

interface CharacterRenderProps {
  x: number;
  y: number;
  habit: any;
  hasShield: boolean;
  timestamp: number;
}

export function drawCharacter(ctx: CanvasRenderingContext2D, props: CharacterRenderProps) {
  const { x, y, habit, hasShield, timestamp } = props;

  if (!habit) return;

  // Draw shield effect if active
  if (hasShield) {
    ctx.beginPath();
    ctx.arc(
      x + GAME_CONFIG.characterSize / 2,
      y + GAME_CONFIG.characterSize / 2,
      GAME_CONFIG.characterSize * 0.8,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = `rgba(79, 70, 229, ${0.3 + Math.sin(timestamp / 200) * 0.2})`;
    ctx.fill();
  }

  // Draw character with glow effect
  ctx.shadowColor = habit.color;
  ctx.shadowBlur = 15;
  ctx.fillStyle = habit.color;
  ctx.beginPath();
  ctx.roundRect(
    x,
    y,
    GAME_CONFIG.characterSize,
    GAME_CONFIG.characterSize,
    8
  );
  ctx.fill();
  ctx.shadowBlur = 0;
  
  // Draw habit name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    habit.title.slice(0, 10),
    x + GAME_CONFIG.characterSize / 2,
    y + GAME_CONFIG.characterSize / 2 + 4
  );
}