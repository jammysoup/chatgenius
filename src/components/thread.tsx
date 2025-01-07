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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);

  const fetchReplies = async () => {
    try {
      console.log('Fetching replies for message:', parentMessage.id);
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched replies:', data);
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      console.log('Submitting reply to message:', parentMessage.id);
      
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newReply }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send reply');
      }

      const reply = await response.json();
      console.log('Reply created:', reply);
      
      setReplies(prev => [...prev, reply]);
      setNewReply('');
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply. Please try again.');
    } finally {
      setIsSubmitting(false);
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
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className={`px-4 py-2 rounded ${
              isSubmitting 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
} 