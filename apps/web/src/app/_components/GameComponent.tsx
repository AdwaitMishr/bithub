"use client";

import React, { useEffect } from 'react';
import { usePlayerStore } from "../../stores/usePlayerStore";

export const GameCanvas = () => {
  const { players, myPlayerId, sendMoveIntent } = usePlayerStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w') sendMoveIntent('up');
      if (e.key === 'ArrowDown' || e.key === 's') sendMoveIntent('down');
      if (e.key === 'ArrowLeft' || e.key === 'a') sendMoveIntent('left');
      if (e.key === 'ArrowRight' || e.key === 'd') sendMoveIntent('right');
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sendMoveIntent]);

  return (
    <div className="relative w-[800px] h-[600px] bg-gray-900 border rounded-lg overflow-hidden">
      
      {Array.from(players.entries()).map(([playerId, position]) => (
        <div
          key={playerId}
          className={`absolute w-8 h-8 transition-transform duration-50 ease-linear ${
            playerId === myPlayerId ? 'bg-indigo-600 rounded-md' : 'bg-red-600 rounded-md'
          }`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
      ))}
    </div>
  );
};