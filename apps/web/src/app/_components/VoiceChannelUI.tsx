"use client";
import { useWebSocketStore } from "@/stores/useWebSocketStore";
import { Mic, MicOff, Wifi, WifiOff, User } from "lucide-react";
import { Button } from "@/components/ui/button"; // Assuming you use shadcn/ui

export const VoiceChannelUI = () => {
  const { isConnected, remoteStreams, isMuted, toggleMute, myPlayerId } = useWebSocketStore();

  const participants = [myPlayerId, ...Array.from(remoteStreams.keys())];

  return (
    <div className="fixed bottom-5 right-5 z-50 w-72 rounded-lg border bg-card text-card-foreground shadow-xl">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold">Voice Channel</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Connected
            </>
          ) : (
            <>
              <WifiOff className="h-4 w-4 text-destructive" />
              Disconnected
            </>
          )}
        </div>
      </div>

      <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
        {participants.map((id) =>
          id ? (
            <div key={id} className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">
                {id.substring(0, 12)}... {id === myPlayerId && "(You)"}
              </p>
            </div>
          ) : null,
        )}
      </div>

      <div className="p-3 border-t bg-muted/50">
        <Button
          variant="secondary"
          className="w-full"
          onClick={toggleMute}
        >
          {isMuted ? (
            <MicOff className="w-4 h-4 mr-2 text-destructive" />
          ) : (
            <Mic className="w-4 h-4 mr-2" />
          )}
          {isMuted ? "Unmute" : "Mute"}
        </Button>
      </div>
    </div>
  );
};