import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { rooms, players, type Room, type NewRoom } from '@/server/db/schema';
import { eq, and, count, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

function generateRoomCode(length = 6): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
    .toUpperCase();
}

export const roomRouter = createTRPCRouter({
  create: publicProcedure
    .mutation(async () => {
      let code: string;
      let attempts = 0;
      const maxAttempts = 5;

      do {
        code = generateRoomCode();
        const [existingRoom] = await db
          .select()
          .from(rooms)
          .where(eq(rooms.code, code))
          .limit(1);

        if (!existingRoom) break;
        attempts++;
      } while (attempts < maxAttempts);

      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate a unique room code');
      }

      const [newRoom] = await db
        .insert(rooms)
        .values({
          id: crypto.randomUUID(),
          code,
          status: 'active',
          maxPlayers: 6,
          password: '',
        })
        .returning();

      return newRoom;
    }),

  join: publicProcedure
    .input(z.object({
      roomCode: z.string().length(6, 'Room code must be 6 characters'),
      playerId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { roomCode, playerId } = input;

      const [room] = await db
        .select()
        .from(rooms)
        .where(and(
          eq(rooms.code, roomCode.toUpperCase()),
          eq(rooms.status, 'active')
        ))
        .limit(1);

      if (!room) {
        throw new Error('Room not found or inactive');
      }

      const [playerCountResult] = await db
        .select({ count: count() })
        .from(players)
        .where(eq(players.roomId, room.id));

      const currentPlayerCount = playerCountResult?.count ?? 0;
      if (currentPlayerCount >= room.maxPlayers) {
        throw new Error('Room is full');
      }

      const [existingPlayer] = await db
        .select()
        .from(players)
        .where(eq(players.id, playerId))
        .limit(1);

      if (existingPlayer) {
        await db
          .update(players)
          .set({ roomId: room.id, updatedAt: new Date() })
          .where(eq(players.id, playerId));
      } else {
        // Create new player in the room
        await db.insert(players).values({
          id: playerId,
          roomId: room.id,
          x: 0, // Default position
          y: 0, // Default position
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true, room };
    }),

  get: publicProcedure
    .input(z.object({
      roomId: z.string(),
    }))
    .query(async ({ input }) => {
      const { roomId } = input;

      const [room] = await db
        .select()
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .limit(1);

      if (!room) {
        throw new Error('Room not found');
      }

      const roomPlayers = await db
        .select()
        .from(players)
        .where(eq(players.roomId, roomId));

      return {
        ...room,
        players: roomPlayers,
        playerCount: roomPlayers.length,
      };
    }),

  // Mark room as inactive
  leave: publicProcedure
    .input(z.object({
      roomId: z.string(),
      playerId: z.string(),
    }))
    .mutation(async ({ input }) => {
      const { roomId, playerId } = input;

      // Remove player from room
      await db
        .delete(players)
        .where(and(
          eq(players.id, playerId),
          eq(players.roomId, roomId)
        ));

      // Check if room is empty
      const [playerCountResult] = await db
        .select({ count: count() })
        .from(players)
        .where(eq(players.roomId, roomId));

      const currentPlayerCount = playerCountResult?.count ?? 0;
      // Mark room as inactive if empty
      if (currentPlayerCount === 0) {
        await db
          .update(rooms)
          .set({ status: 'inactive', updatedAt: new Date() })
          .where(eq(rooms.id, roomId));
      }

      return { success: true };
    }),
});
