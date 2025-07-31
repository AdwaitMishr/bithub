// src/server/api/routers/player.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

// In-memory store for this example, replace with Prisma for persistence
const players = new Map<string, { x: number; y: number }>();

export const playerRouter = createTRPCRouter({
  getAll: publicProcedure.query(() => {
    return Object.fromEntries(players);
  }),
  move: publicProcedure
    .input(z.object({ x: z.number(), y: z.number() }))
    .mutation(({ ctx, input }) => {
      
      const playerId = 'some-unique-id';
      players.set(playerId, { x: input.x, y: input.y });
      
      return { status: 'success' };
    }),
});