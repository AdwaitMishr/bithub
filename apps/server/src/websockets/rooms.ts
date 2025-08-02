import { WebSocket } from 'ws';
import { Room } from '../game/Room';

const rooms = new Map<string, Room>();
const clientRooms = new Map<WebSocket, string>();

// We now need a playerId to manage state within the room
export function joinRoom(ws: any, roomId: string, playerId: string) {
  let room = rooms.get(roomId);

  // If room doesn't exist, create it
  if (!room) {
    room = new Room(roomId);
    rooms.set(roomId, room);
  }

  // Use the Room's method to add the player
  room.addPlayer(ws, playerId);
  clientRooms.set(ws, roomId);

  // Attach metadata to the connection for easy lookup on disconnect
  ws.roomId = roomId;
  ws.playerId = playerId;

  console.log(`Player ${playerId} joined room: ${roomId}`);
}

export function leaveRoom(ws: any) {
  const roomId = ws.roomId;
  const playerId = ws.playerId;

  if (roomId && playerId) {
    const room = rooms.get(roomId);
    if (room) {
      // Use the Room's method to remove the player
      room.removePlayer(ws, playerId);
      clientRooms.delete(ws);
      console.log(`Player ${playerId} left the room: ${roomId}`);

      // Optional: if the room is empty, delete it
      if (room.clients.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} is empty and has been closed.`);
      }
    }
  }
}

export function broadcastToRoom(ws: WebSocket, message: object) {
  const roomId = clientRooms.get(ws);
  if (!roomId) return;

  const room = rooms.get(roomId);
  if (!room) return;

  const messageString = JSON.stringify(message);

  // Access the 'clients' Set from the Room object
  room.clients.forEach((client) => {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
      client.send(messageString);
    }
  });
}