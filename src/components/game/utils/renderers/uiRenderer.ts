interface UIRenderProps {
  score: number;
  powerUps: {
    shield: boolean;
    doublePoints: boolean;
    slowMotion: boolean;
  };
}

export function drawUI(ctx: CanvasRenderingContext2D, props: UIRenderProps) {
  const { score, powerUps } = props;

  // Draw score with glow effect
  ctx.shadowColor = '#4F46E5';
  ctx.shadowBlur = 10;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Score: ${score}`, 20, 40);
  ctx.shadowBlur = 0;

  // Draw power-up indicators
  let yOffset = 70;
  
  if (powerUps?.shield) {
    ctx.fillStyle = '#4F46E5';
    ctx.font = '16px sans-serif';
    ctx.fillText('Shield Active', 20, yOffset);
    yOffset += 25;
  }

  if (powerUps?.doublePoints) {
    ctx.fillStyle = '#F59E0B';
    ctx.font = '16px sans-serif';
    ctx.fillText('2x Points!', 20, yOffset);
    yOffset += 25;
  }

  if (powerUps?.slowMotion) {
    ctx.fillStyle = '#10B981';
    ctx.font = '16px sans-serif';
    ctx.fillText('Slow Motion', 20, yOffset);
  }
}