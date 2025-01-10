"use client";

import { useState, useEffect } from 'react';
import { Message } from '@/components/messages/message';
import { MessageInput } from '@/components/messages/message-input';
import type { Message as MessageType } from '@/types';

interface ThreadProps {
  parentMessage: MessageType;
  onClose: () => void;
}

export function Thread({ parentMessage, onClose }: ThreadProps) {
  const [replies, setReplies] = useState<MessageType[]>([]);

  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-300 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Thread</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Parent message */}
        <div className="mb-4 pb-4 border-b border-gray-300">
          <Message message={parentMessage} />
        </div>

        {/* Replies */}
        {replies.map((reply) => (
          <div key={reply.id} className="mb-4">
            <Message message={reply} />
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="p-4 border-t border-gray-300">
        <MessageInput
          channelId={parentMessage.channelId}
          parentId={parentMessage.id}
          placeholder="Reply in thread..."
          onSend={fetchReplies}
        />
      </div>
    </div>
  );
} 