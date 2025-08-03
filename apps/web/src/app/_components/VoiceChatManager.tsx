"use client";
import { useEffect } from 'react';
import { useWebSocketStore } from '@/stores/useWebSocketStore';
import { AudioPlayer } from './AudioPlayer';

// This component manages getting microphone access and rendering the audio players.
export const VoiceChatManager = () => {
  const { startLocalStream, remoteStreams } = useWebSocketStore();

  // On mount, ask for microphone permission to get the local audio stream.
  useEffect(() => {
    startLocalStream();
  }, [startLocalStream]);

  return (
    <div className="hidden">
      {[...remoteStreams.entries()].map(([playerId, stream]) => (
        <AudioPlayer key={playerId} stream={stream} />
      ))}
    </div>
  );
};