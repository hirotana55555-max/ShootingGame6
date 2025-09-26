// components/GameCanvas.tsx
'use client';

import { useEffect, useRef } from 'react';
import { startGame, stopGame } from '../game/core/main.js'; // 変更点

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    startGame(canvas); // 変更点：ゲームを開始する

    // コンポーネントが不要になった時にクリーンアップする
    return () => {
      stopGame(); // 変更点：ゲームを停止する
    };
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} style={{ border: '1px solid white' }} />;
}
