import { WebSocket } from 'ws';
import { broadcastToRoom } from '../rooms';

export function handleChatMessage(ws: any, payload: { text: string }) {
  // Get the sender's ID from the WebSocket object itself
  const senderId = ws.playerId;

  // A quick check to make sure the sender is properly identified
  if (!senderId) {
    console.error("Cannot handle chat message from a client without a playerId.");
    return;
  }

  const message = {
    type: 'chat_message',
    payload: {
      senderId: senderId, // Use the actual ID
      text: payload.text,
    },
  };

  // This function sends the message to everyone else in the room
  broadcastToRoom(ws, message);
  console.log('received message from:'+senderId+'says '+payload.text)
}