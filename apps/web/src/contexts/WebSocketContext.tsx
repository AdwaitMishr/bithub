"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface WebSocketContextType {
  ws: WebSocket | null;
  isConnected: boolean;
  sendChatMessage: (text: string) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("WebSocket Connected");
      setIsConnected(true);
      socket.send(
        JSON.stringify({
          type: "join_room",
          payload: { roomId: "main-floor" },
        }),
      );
    };

    socket.onclose = () => {
      console.log("WebSocket Disconnected");
      setIsConnected(false);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("Received message:", message);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, []);
  
  const sendChatMessage = (text: string) => {
    if (ws && isConnected) {
      ws.send(JSON.stringify({ type: 'chat_message', payload: { text } }));
    }
  };

  const value = {
    ws,
    isConnected,
    sendChatMessage,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};