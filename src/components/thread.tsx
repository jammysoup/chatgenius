"use client";

import { useState, useEffect } from 'react';
import { MessageReactions } from './message-reactions';

interface ThreadProps {
  parentMessage: Message;
  onClose: () => void;
}

export function Thread({ parentMessage, onClose }: ThreadProps) {
  const [replies, setReplies] = useState<Message[]>([]);
  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`);
      if (response.ok) {
        const data = await response.json();
        setReplies(data);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    try {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReply }),
      });

      if (response.ok) {
        const reply = await response.json();
        setReplies([...replies, reply]);
        setNewReply('');
      }
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  return (
    <div className="w-96 border-l border-gray-300 bg-white h-full flex flex-col">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Thread</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* Parent message */}
        <div className="mb-4 pb-4 border-b border-gray-300">
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{parentMessage.user?.name}</span>
                <span className="text-sm text-gray-500">
                  {new Date(parentMessage.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="mt-1">{parentMessage.content}</p>
              <div className="mt-2">
                <MessageReactions 
                  messageId={parentMessage.id} 
                  initialReactions={parentMessage.reactions || []} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        {replies.map((reply) => (
          <div key={reply.id} className="mb-4">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{reply.user?.name}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(reply.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="mt-1">{reply.content}</p>
                <div className="mt-2">
                  <MessageReactions 
                    messageId={reply.id} 
                    initialReactions={reply.reactions || []} 
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reply input */}
      <div className="p-4 border-t border-gray-300">
        <form onSubmit={handleSubmitReply} className="flex gap-2">
          <input
            type="text"
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
            placeholder="Reply in thread..."
            className="flex-1 rounded border border-gray-300 p-2 
              focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
} 