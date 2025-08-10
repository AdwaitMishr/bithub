"use client";

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client'; // Or 'next-auth/react'
import { useWebSocketStore } from '@/stores/useWebSocketStore';

export const WebSocketInitializer = () => {
  const { data: session, isPending } = useSession();
  const { connect, disconnect, isConnected, joinGame, myPlayerId } = useWebSocketStore();

  // This effect manages the raw WebSocket connection
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  useEffect(() => {
    const hasJoined = !!myPlayerId;

    if (isConnected && !isPending && session?.user.username && !hasJoined) {
      joinGame(session.user.username);
    }
  }, [isConnected, isPending, session, joinGame, myPlayerId]);

  return null;
};