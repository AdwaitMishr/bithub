// src/store/zustand.ts
import { create } from 'zustand';

interface PlayerState {
  position: { x: number; y: number };
  isMuted: boolean;
  setPosition: (pos: { x: number; y: number }) => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  position: { x: 100, y: 100 },
  isMuted: false,
  setPosition: (pos) => set({ position: pos }),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));