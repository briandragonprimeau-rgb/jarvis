import React, { useEffect, useRef } from 'react';

export default function SoundVisualizer({ isActive, color = 'rgba(6, 182, 212, ' }: { isActive: boolean; color?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!isActive) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 8;
      const barWidth = 3;
      const gap = 2;
      
      for (let i = 0; i < bars; i++) {
        const height = Math.random() * canvas.height;
        if (color.includes('(')) {
          ctx.fillStyle = `${color}${0.4 + Math.random() * 0.6})`;
        } else {
          ctx.fillStyle = color;
        }
        ctx.fillRect(i * (barWidth + gap), canvas.height - height, barWidth, height);
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, color]);

  return <canvas ref={canvasRef} width={40} height={20} className="inline-block align-middle ml-2" />;
}
