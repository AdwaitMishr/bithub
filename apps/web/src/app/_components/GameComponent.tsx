import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

const GameCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const app = new PIXI.Application({
      width: 1024,
      height: 768,
      backgroundColor: 0x1099bb,
    });

    canvasRef.current.appendChild(app.view as unknown as Node);

    // Load background
    const background = PIXI.Sprite.from('/backgrounds/office-bg.png');
    app.stage.addChild(background);


    return () => {
      app.destroy(true, true);
    };
  }, []);

  return <div ref={canvasRef} />;
};

export default GameCanvas;