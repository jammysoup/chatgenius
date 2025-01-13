"use client";

import { useState } from 'react';
import { Message } from '@/components/messages/message';
import { MessageInput } from '@/components/messages/message-input';
import { Thread } from '@/components/thread';
import type { Message as MessageType } from '@/types';

export default function ChannelPage({ params }: { params: { channelId: string } }) {
  const [activeThread, setActiveThread] = useState<MessageType | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);
  
  const handleThreadClick = (message: MessageType) => {
    setActiveThread(message);
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  return (
    <div className="flex h-full">
      <div className="flex-1">
        {/* Main channel messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.map((message: MessageType) => (
            <Message 
              key={message.id} 
              message={message}
              onThreadClick={handleThreadClick}
            />
          ))}
        </div>
        
        {/* Message input */}
        <MessageInput channelId={params.channelId} />
      </div>

      {/* Thread sidebar */}
      {activeThread && (
        <Thread
          parentMessage={activeThread}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
} 