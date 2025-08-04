import SimplePeer from 'simple-peer';
import { create } from 'zustand';
import type { Instance as SimplePeerInstance } from 'simple-peer';

// This is the message you send from the client
export interface ChatMessage {
  senderId: string;
  text: string;
}

// --- START: New Discriminated Union Types for Server Messages ---

// This defines the shape of the payload for each message type
interface MessagePayloads {
  'chat_message': { senderId: string; text: string };
  'webrtc_initiate': { targetId: string; initiator: boolean };
  'webrtc_signal': { senderId: string; signal: SimplePeer.SignalData };
  'user_left': { userId: string };
}

// This creates a master type for any message from the server.
// It maps over the keys of MessagePayloads to create a union of all possible message shapes.
// e.g., { type: 'chat_message', payload: { senderId: string; text: string } } | { type: 'user_left', payload: { userId: string } }
type ServerMessage = {
  [K in keyof MessagePayloads]: {
    type: K;
    payload: MessagePayloads[K];
  }
}[keyof MessagePayloads];

// --- END: New Types ---


interface WebSocketState {
  ws: WebSocket | null;
  isConnected: boolean;
  messages: ChatMessage[];
  myPlayerId: string | null;
  connect: () => void;
  disconnect: () => void;
  sendChatMessage: (text: string) => void;
  localStream: MediaStream | null;
  peers: Map<string,SimplePeerInstance>;
  remoteStreams: Map<string, MediaStream>;
  startLocalStream: ()=> Promise<void>;
  addPeer: (targetId: string, initiator: boolean)=>void;
  handleIncomingSignal: (payload: MessagePayloads['webrtc_signal'])=>void;
  removePeer: (targetId: string)=> void;
  isMuted: boolean;
  toggleMute: ()=>void;
  peerQueue: Array<{targetId:string;initiator:boolean}>;
}


export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  ws: null,
  isConnected: false,
  messages: [],
  myPlayerId: null,
  localStream: null,
  peers: new Map(),
  remoteStreams: new Map(),
  isMuted: false,
  peerQueue: [],
  startLocalStream: async ()=>{
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true, video: false});
      set({localStream: stream})

      const {peerQueue, addPeer} = get();

      if(peerQueue.length>0){
        peerQueue.forEach(req=>addPeer(req.targetId, req.initiator));
        set({peerQueue:[]});
      }
    }
    catch(err){
      console.error("Error getting mediastream from user")
    }
  },
  addPeer: (targetId, initiator)=>{
    const { localStream, ws, myPlayerId } = get();
    if (!localStream) {
      set(state => ({ peerQueue: [...state.peerQueue, { targetId, initiator }] }));
      return;
    }
    if (!ws || !myPlayerId) {
      return;
    }

    const peer = new SimplePeer({
      initiator: initiator,
      stream: localStream,
      trickle: true,
    });
    peer.on('signal',(signal)=>{
      ws.send(JSON.stringify({
        type: 'webrtc_signal',
        payload: {targetId, signal}
      }));
    })
    peer.on('stream',(stream)=>{
      console.log('received remote stream from',targetId);

      set((state)=>{
        const newStreams = new Map(state.remoteStreams);
        newStreams.set(targetId,stream);
        return {remoteStreams: newStreams}
      })
    })

    peer.on('close',()=>{
      console.log('Peer connection closed with',targetId);
      get().peers.delete(targetId);
      set((state)=>{
        const newStreams = new Map(state.remoteStreams);
        newStreams.delete(targetId);
        return { remoteStreams: newStreams, peers: new Map(state.peers)};
      })
    })

    peer.on('error', (err) => {
      console.error('Peer error with', targetId, err);
    });

    set((state) => ({ peers: new Map(state.peers).set(targetId, peer) }));
  },
  handleIncomingSignal: (payload)=>{
    const peer = get().peers.get(payload.senderId);
    if (peer){
      peer.signal(payload.signal)
    }
  },

  connect: () => {
    if (get().ws) return;
    const socket = new WebSocket('ws://localhost:8080');

    socket.onopen = () => {
      const newPlayerId = 'user-' + Math.random().toString(16).slice(2);
      set({ isConnected: true, myPlayerId: newPlayerId }); // Set the user's ID
      socket.send(
        JSON.stringify({
          type: "join_room",
          payload: { roomId: "main-floor", playerId: newPlayerId },
        }),
      );
    };
    
    // The onmessage handler is now outside onopen
    socket.onmessage = (event:MessageEvent<string>) => {
      console.log("1. Raw message received from server:", event.data);

      try {
        const message: ServerMessage = JSON.parse(event.data) as ServerMessage;
        console.log("2. Parsed message object:", message);

        switch (message.type) {
          case 'webrtc_initiate':
            console.log("3. It's a webrtc_initiate message! Calling addPeer with payload:", message.payload);
            // TypeScript now knows payload has targetId and initiator
            get().addPeer(message.payload.targetId, message.payload.initiator);
            break;

          case 'webrtc_signal':
            console.log("3. It's a webrtc_signal message! Handling signal.");
            // TypeScript now knows payload has senderId and signal
            get().handleIncomingSignal(message.payload);
            break;
            
          case 'chat_message':
            console.log("3. It's a chat_message! Updating state.");
             // TypeScript now knows payload has senderId and text
            set((state) => ({ messages: [...state.messages, message.payload] }));
            break;

          case 'user_left':
            console.log("3. It's a user_left message! Removing peer.");
            // TypeScript now knows payload has userId
            get().removePeer(message.payload.userId);
            break;

          default:
            // This part helps catch any unexpected message types
            const exhaustiveCheck: never = message;
            console.log("3. Received unhandled message type:", exhaustiveCheck);
        }
      } catch (error) {
        console.error("Failed to parse incoming message:", error);
      }
    };


    set({ ws: socket });
  },

  disconnect: () => { 
    get().ws?.close();
   },

  sendChatMessage: (text: string) => {
    const { ws, myPlayerId } = get();
    if (ws && myPlayerId) {
      const optimisticMessage: ChatMessage = { senderId: myPlayerId, text };

      set((state) => ({ messages: [...state.messages, optimisticMessage] }));

      ws.send(JSON.stringify({ type: 'chat_message', payload: { text } }));
      console.log("sent message to server:"+text);
    }
  },
  removePeer: (targetId: string)=>{
    const peer = get().peers.get(targetId);
    if (peer){
      console.log('Destroying peer connection with', targetId);

      peer.destroy();
      get().peers.delete(targetId);

      set((state)=>{
        const newStreams = new Map(state.remoteStreams);
        newStreams.delete(targetId);

        return { remoteStreams: newStreams, peers: new Map(state.peers)};
      })
    }
  },
  toggleMute: ()=>{
    const {localStream, isMuted} = get();
    if (localStream){
      localStream.getAudioTracks().forEach((track)=>{
        track.enabled = isMuted;
      });
      set({isMuted: !isMuted});
    }
  }
}));
