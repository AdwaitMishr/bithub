import { WebSocketServer, WebSocket } from 'ws';
import { gameState } from '@/server/game/gameState';

interface ConnectionData {
  roomId: string;
  playerId: string;
  ws: WebSocket;
}

const wss = new WebSocketServer({ port: 3001 });
const connections = new Map<WebSocket, ConnectionData>();

console.log('WebSocket Server started on port 3001');

// Handle new WebSocket connections
wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected');

  // Handle incoming messages
  ws.on('message', (message: string) => {
    try {
      const data = JSON.parse(message.toString());
      const connection = connections.get(ws);

      if (!connection && data.type !== 'joinRoom') {
        console.warn('Received message from unauthenticated connection');
        return;
      }

      switch (data.type) {
        case 'joinRoom':
          handleJoinRoom(ws, data);
          break;
          
        case 'playerMove':
          if (connection) {
            handlePlayerMove(connection, data);
          }
          break;
          
        case 'chatMessage':
          if (connection) {
            handleChatMessage(connection, data);
          }
          break;
          
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    const connection = connections.get(ws);
    if (connection) {
      const { roomId, playerId } = connection;
      gameState.removePlayerFromRoom(roomId, playerId);
      connections.delete(ws);
      
      // Notify other players in the room
      broadcastToRoom(roomId, JSON.stringify({
        type: 'playerLeft',
        playerId,
        timestamp: Date.now()
      }), ws);
      
      console.log(`Player ${playerId} disconnected from room ${roomId}`);
    }
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Handle player joining a room
function handleJoinRoom(ws: WebSocket, data: any) {
  const { roomId, playerId, x = 0, y = 0 } = data;
  
  if (!roomId || !playerId) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Missing roomId or playerId'
    }));
    return;
  }

  // Store the connection
  connections.set(ws, { roomId, playerId, ws });
  
  // Add player to the game state
  gameState.addPlayerToRoom(roomId, { id: playerId, x, y });
  
  // Send current room state to the new player
  const roomState = gameState.getRoomState(roomId);
  ws.send(JSON.stringify({
    type: 'roomState',
    ...roomState
  }));
  
  // Notify other players in the room
  broadcastToRoom(roomId, JSON.stringify({
    type: 'playerJoined',
    player: { id: playerId, x, y },
    timestamp: Date.now()
  }), ws);
  
  console.log(`Player ${playerId} joined room ${roomId}`);
}

// Handle player movement
function handlePlayerMove(connection: ConnectionData, data: any) {
  const { roomId, playerId, ws } = connection;
  const { position } = data;
  
  if (!position || typeof position.x !== 'number' || typeof position.y !== 'number') {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Invalid position data'
    }));
    return;
  }
  
  // Update player position in the game state
  gameState.updatePlayerPosition(roomId, playerId, position);
  
  // Broadcast the movement to other players in the room
  broadcastToRoom(roomId, JSON.stringify({
    type: 'playerMoved',
    playerId,
    position,
    timestamp: Date.now()
  }), ws);
}

// Handle chat messages
function handleChatMessage(connection: ConnectionData, data: any) {
  const { roomId, playerId } = connection;
  const { message } = data;
  
  if (!message || typeof message !== 'string') {
    return;
  }
  
  // Broadcast the chat message to all players in the room
  broadcastToRoom(roomId, JSON.stringify({
    type: 'chatMessage',
    playerId,
    message,
    timestamp: Date.now()
  }));
}

// Broadcast a message to all connections in a room except the sender
function broadcastToRoom(roomId: string, message: string, excludeWs?: WebSocket) {
  let clientCount = 0;
  
  connections.forEach((connection, ws) => {
    if (connection.roomId === roomId && ws.readyState === WebSocket.OPEN && ws !== excludeWs) {
      ws.send(message);
      clientCount++;
    }
  });
  
  return clientCount;
}

// Clean up dead connections periodically
setInterval(() => {
  connections.forEach((connection, ws) => {
    if (ws.readyState !== WebSocket.OPEN) {
      // Connection is dead, clean up
      const { roomId, playerId } = connection;
      gameState.removePlayerFromRoom(roomId, playerId);
      connections.delete(ws);
      console.log(`Cleaned up dead connection for player ${playerId} in room ${roomId}`);
    }
  });
}, 30000); // Check every 30 seconds

// Handle server shutdown
process.on('SIGINT', () => {
  console.log('Shutting down WebSocket server...');
  
  // Notify all connected clients
  broadcastToAll(JSON.stringify({
    type: 'serverShutdown',
    message: 'Server is shutting down',
    timestamp: Date.now()
  }));
  
  // Close all connections
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.close(1001, 'Server is shutting down');
    }
  });
  
  wss.close(() => {
    console.log('WebSocket server closed');
    process.exit(0);
  });
});

// Helper function to broadcast to all connected clients
function broadcastToAll(message: string) {
  let clientCount = 0;
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
      clientCount++;
    }
  });
  return clientCount;
}

export { wss };