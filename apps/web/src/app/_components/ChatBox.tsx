import React, { useState, useEffect, useRef } from "react";
import { useWebSocketStore } from "@/stores/useWebSocketStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderIcon, SendHorizonalIcon } from "lucide-react";

export const ChatBox = () => {
  const { isConnected, messages, sendChatMessage, myPlayerId } = useWebSocketStore();
  const [newMessage, setNewMessage] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      sendChatMessage(newMessage);
      setNewMessage("");
    }
  };

  if (!isConnected) {
    return (
      <div className="flex h-96 w-80 flex-col items-center justify-center rounded-lg bg-card p-4 text-card-foreground shadow-xl">
        <LoaderIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Connecting...</p>
      </div>
    );
  }

  return (
    <div className="flex h-96 w-80 flex-col rounded-lg bg-card p-4 text-card-foreground shadow-xl">
      <h2 className="pb-2 mb-4 text-lg font-bold border-b">Room Chat</h2>
      
      {/* Message Display Area */}
      <div className="flex-grow mb-4 pr-2 space-y-4 overflow-y-auto">
        {messages.map((message, index) => {
          const isMyMessage = message.senderId === myPlayerId;
          return (
            <div
              key={index}
              className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-xs rounded-lg px-3 py-2 ${
                  isMyMessage
                    ? "rounded-br-none bg-primary text-primary-foreground"
                    : "rounded-bl-none bg-muted"
                }`}
              >
                {!isMyMessage && (
                  <p className="text-xs font-bold text-muted-foreground">
                    {message.senderId.substring(0, 8)}...
                  </p>
                )}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          );
        })}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Message Input Area */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say something..."
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <SendHorizonalIcon className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};