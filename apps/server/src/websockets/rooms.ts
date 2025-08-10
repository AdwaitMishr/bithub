import { WebSocket } from 'ws';
import { Room } from '../game/Room';

export const rooms = new Map<string, Room>();
const clientRooms = new Map<WebSocket, string>();

export const clients = new Map<string,WebSocket>();

// We now need a playerId to manage state within the room
export function handleJoinRoom(ws: any, payload: { roomId: string; playerId: string }){
  const {roomId, playerId}= payload;

  let room = rooms.get(roomId);
  if (!room){
    room = new Room(roomId);
    rooms.set(roomId,room);
  }

  const existingPlayerIds = Array.from(room.players.keys());

  // room.addPlayer(ws, playerId);
  clientRooms.set(ws,roomId);
  clients.set(playerId,ws);

  ws.roomId = roomId;
  ws.playerId = playerId;

  console.log(`[Join Room] Associating new connection with playerId: ${ws.playerId}`);
  room.addPlayer(ws, playerId);

  existingPlayerIds.forEach(existingPlayerId=>{
    const existingPlayerSocket = clients.get(existingPlayerId);

    if (existingPlayerSocket){
      ws.send(JSON.stringify({
        type: 'webrtc_initiate',
        payload: {targetId: existingPlayerId, initiator: true}
      }));


      existingPlayerSocket.send(JSON.stringify({
        type: 'webrtc_initiate',
        payload: {targetId: playerId, initiator: false}
      }));
    }
  })
}
// Function is deprecated and should not be used
//
//
// export function joinRoom(ws: any, roomId: string, playerId: string) {
//   let room = rooms.get(roomId);

//   // If room doesn't exist, create it
//   if (!room) {
//     room = new Room(roomId);
//     rooms.set(roomId, room);
//   }

//   // Use the Room's method to add the player
//   room.addPlayer(ws, playerId);
//   clientRooms.set(ws, roomId);

//   // Attach metadata to the connection for easy lookup on disconnect
//   ws.roomId = roomId;
//   ws.playerId = playerId;

//   console.log(`Player ${playerId} joined room: ${roomId}`);
//   clients.set(playerId,ws);
// }

export function leaveRoom(ws: any) {
  const roomId = ws.roomId;
  const playerId = ws.playerId;

  if (roomId && playerId) {
    const room = rooms.get(roomId);
    if (room) {
      room.removePlayer(ws, playerId);
      clientRooms.delete(ws);
      clients.delete(playerId);
      console.log(`Player ${playerId} left the room: ${roomId}`);

      const leaveMessage = JSON.stringify({
        type: 'user_left',
        payload: {userId: playerId}
        }
      )

      room.clients.forEach(client =>{
        client.send(leaveMessage);
      })

      if (room.clients.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} is empty and has been closed.`);
      }
    }
    if (playerId){
      clients.delete(playerId);
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