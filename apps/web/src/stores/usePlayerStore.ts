import { create } from "zustand";

export interface Position {
  x: number;
  y: number;
}

import { useWebSocketStore } from "./useWebSocketStore";

interface PlayerState {
  myPlayerId: string | null;
  players: Map<string, Position>;

  initializePlayer: (playerId: string) => void;
  sendMoveIntent: (direction: 'up' | 'down' | 'left' | 'right') => void;
  applyServerStateUpdate: (updates: { playerId: string, position: Position }[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  myPlayerId: null,
  players: new Map(),

  initializePlayer: (playerId) => {
    set({ myPlayerId: playerId });
  },

  sendMoveIntent: (direction) => {
    // We get the `send` function from our WebSocket store to send the message
    const { ws } = useWebSocketStore.getState();
    if (ws) {
      ws.send(JSON.stringify({
        type: 'move_intent',
        payload: { direction },
      }));
    }
  },

  applyServerStateUpdate: (updates) => {
    set(state => {
      const newPlayers = new Map(state.players);
      updates.forEach(update => {
        newPlayers.set(update.playerId, update.position);
      });
      return { players: newPlayers };
    });
  },
}));