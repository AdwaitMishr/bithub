
interface PlayerState {
    id: string;
    x: number;
    y: number;
  }
  
  interface RoomState {
    id: string;
    players: Map<string, PlayerState>; 
  }
  
  
  class GameState {
    
    public rooms: Map<string, RoomState>;
  
    constructor() {
      this.rooms = new Map();
      console.log("In-Memory GameState is active");
    }
  
    getOrCreateRoom(roomId: string): RoomState {
      if (!this.rooms.has(roomId)) {
        this.rooms.set(roomId, {
          id: roomId,
          players: new Map(),
        });
      }
      return this.rooms.get(roomId)!;
    }
  
    addPlayerToRoom(roomId: string, player: PlayerState) {
      const room = this.getOrCreateRoom(roomId);
      room.players.set(player.id, player);
      return player;
    }
  
    removePlayerFromRoom(roomId: string, playerId: string) {
      const room = this.rooms.get(roomId);
      if (room) {
        room.players.delete(playerId);
        // Optional: Clean up empty rooms
        if (room.players.size === 0) {
          this.rooms.delete(roomId);
        }
      }
    }
  
    updatePlayerPosition(roomId: string, playerId: string, position: { x: number; y: number }) {
      const room = this.rooms.get(roomId);
      const player = room?.players.get(playerId);
      if (player) {
        player.x = position.x;
        player.y = position.y;
      }
      return player;
    }
    getRoomState(roomId: string) {
        const room = this.rooms.get(roomId);
        if (!room) {
          return {
            roomId,
            players: [],
            playerCount: 0,
            exists: false
          };
        }
      
        // Convert Map to array of players
        const players = Array.from(room.players.values());
        
        return {
          roomId: room.id,
          players,
          playerCount: players.length,
          exists: true
        };
      }
  }
  const globalForGameState = globalThis as unknown as {
    gameState: GameState | undefined;
  };
  
  export const gameState = globalForGameState.gameState ?? new GameState();
  
  if (process.env.NODE_ENV !== "production") {
    globalForGameState.gameState = gameState;
  }