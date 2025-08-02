import { create } from 'zustand';

export interface ChatMessage {
  senderId: string;
  text: string;
}

interface WebSocketState {
  ws: WebSocket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  myPlayerId: string | null;
  connect: () => void;
  disconnect: () => void;
  sendChatMessage: (text: string) => void;
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  messages: [],
  myPlayerId: null,

  connect: () => {
    if (get().ws) return;
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      console.log('WebSocket Connected (Zustand)');
      const newPlayerId = 'user-' + Math.random().toString(16).slice(2);
      set({ isConnected: true, myPlayerId: newPlayerId }); // Set the user's ID
      socket.send(
        JSON.stringify({
          type: "join_room",
          payload: { roomId: "main-floor", playerId: newPlayerId },
        }),
      );
      socket.onmessage = (event) => {

      try {
        const message = JSON.parse(event.data);

        switch (message.type) {
          case 'chat_message':
            set((state) => ({ messages: [...state.messages, message.payload] }));
            break;
          default:
        }
      } catch (error) {
        throw new Error('Erraneous message')
      }
    };
    };


    set({ ws: socket });
  },

  disconnect: () => { /* ... */ },

  sendChatMessage: (text: string) => {
    const { ws, myPlayerId } = get();
    if (ws && myPlayerId) {
      const optimisticMessage: ChatMessage = { senderId: myPlayerId, text };

      set((state) => ({ messages: [...state.messages, optimisticMessage] }));

      ws.send(JSON.stringify({ type: 'chat_message', payload: { text } }));
      console.log("sent message to server:"+text);
    }
  },
}));