import {rooms} from '../rooms';
import type { Direction } from '../../game/Room';

export function handleMoveIntent(ws: any, payload: { direction: Direction }) {
  const { roomId, playerId } = ws;

  // --- ADD THIS DEBUGGING LOG ---
  console.log(`Received move_intent ('${payload.direction}') from playerId: ${playerId}`);
  // --- END DEBUGGING LOG ---

  const room = rooms.get(roomId);

  if (room && playerId) {
    const player = room.players.get(playerId);
    if (player) {
      player.lastIntent = payload.direction;
    }
  }
}