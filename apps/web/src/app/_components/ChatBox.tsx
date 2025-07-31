import React, { useState } from 'react';
import { useWebSocket } from '@/contexts/WebSocketContext';

export const ChatBox = () => {
  const { isConnected, sendChatMessage } = useWebSocket();
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      sendChatMessage(message);
      setMessage('');
    }
  };

  if (!isConnected) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>Send</button>
    </div>
  );
};