'use client';

import { useEffect, useRef } from 'react';

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;
        
    context.fillStyle = 'black';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid white' }} />;
}
