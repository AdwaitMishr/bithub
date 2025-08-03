import { WebSocket } from 'ws';
import { handleJoinRoom, leaveRoom } from './rooms';
import { handleChatMessage } from './handlers/chatHandler';
import { relaySignal } from './handlers/webrtcHandler';


export function handleConnection(ws: any) {
  console.log('A new client connected!');

  ws.on('message', (rawMessage:any) => {
    try {
      const { type, payload } = JSON.parse(rawMessage.toString());

      // The 'join_room' message is special and must be handled first
      if (type === 'join_room' && payload.roomId && payload.playerId) {
        handleJoinRoom(ws, payload);
        return; // Done with this message
      }

      // For all other messages, first verify the client has joined a room
      if (!ws.playerId || !ws.roomId) {
        console.warn('Ignoring message from a client that has not joined a room.');
        return;
      }

      // Now that we know the client is authenticated, route their message
      switch (type) {
        case 'chat_message':
          handleChatMessage(ws, payload);
          break;
        case 'webrtc_signal':
          relaySignal(ws.playerId, payload)
          break;
        // case 'move_intent':
        //   handleMoveIntent(ws, payload);
        //   break;

        default:
          console.log(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Failed to parse message or invalid message format.');
    }
  });

  ws.on('close', () => {
    leaveRoom(ws);
  });
}