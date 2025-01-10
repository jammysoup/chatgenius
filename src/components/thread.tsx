"use client";

import { useState, useEffect } from 'react';
import { Message } from '@/components/messages/message';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "lucide-react";
import type { Message as MessageType } from '@/types';
import { toast } from 'sonner';

interface ThreadProps {
  parentMessage: MessageType;
  onClose: () => void;
}

export function Thread({ parentMessage, onClose }: ThreadProps) {
  const [replies, setReplies] = useState<MessageType[]>([]);
  const [replyContent, setReplyContent] = useState('');

  // Fetch replies when thread opens
  useEffect(() => {
    fetchReplies();
  }, [parentMessage.id]);

  const fetchReplies = async () => {
    try {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setReplies(data);
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch(`/api/messages/${parentMessage.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent }),
      });

      if (!response.ok) throw new Error('Failed to send reply');

      setReplyContent('');
      fetchReplies();
    } catch (error) {
      console.error('Error sending reply:', error);
      toast.error('Failed to send reply');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-lg border border-gray-300 h-[600px] flex flex-col">
      <div className="p-4 border-b border-gray-300 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Thread</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 pb-4 border-b border-gray-300">
          <Message message={parentMessage} onThreadClick={undefined} />
        </div>

        {replies.map((reply) => (
          <div key={reply.id} className="mb-4">
            <Message message={reply} onThreadClick={undefined} />
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-300">
        <div className="flex gap-2">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Reply in thread..."
            className="flex-1 min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendReply();
              }
            }}
          />
          <Button 
            onClick={handleSendReply}
            disabled={!replyContent.trim()}
            className="self-end"
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
} 