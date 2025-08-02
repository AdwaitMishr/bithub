"use client";
import { useEffect } from 'react';
import { useWebSocketStore } from '@/stores/useWebSocketStore';

export const WebSocketInitializer = () => {
  const { connect, disconnect } = useWebSocketStore();

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return null;
};