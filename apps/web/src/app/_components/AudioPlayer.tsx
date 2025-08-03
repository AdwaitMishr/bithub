"use client";
import { useEffect, useRef } from 'react';

// This component takes a MediaStream object and plays it in an audio element.
export const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      // Don't re-assign the stream if it's already the same one
      if (audioRef.current.srcObject !== stream) {
        audioRef.current.srcObject = stream;
      }
    }
  }, [stream]);

  // We don't mute the audio here so we can hear the other person.
  return <audio ref={audioRef} autoPlay />;
};