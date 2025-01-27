"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { socketService } from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/common/utils";
import { formatTimeAgo } from "@/common/utils";
import type { Message as MessageType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { UserAvatarButton } from "@/components/user-avatar-button";
import ReactMarkdown from 'react-markdown';
import { Plus, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"];

interface MessageProps {
  message: MessageType;
  onThreadClick?: (message: MessageType) => void;
  threadCount?: number;
}

export function Message({ message, onThreadClick, threadCount }: MessageProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentReactions, setCurrentReactions] = useState(
    message.reactions.filter(reaction => reaction.count > 0)
  );

  const canDelete = session?.user?.id === message.user.id || session?.user?.role === 'admin' || session?.user?.role === 'owner';

  const handleDelete = async () => {
    if (!canDelete) return;

    try {
      const response = await fetch(`/api/messages/${message.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');
      
      // Optimistically remove message from cache
      queryClient.setQueryData(['messages'], (oldData: MessageType[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter(msg => msg.id !== message.id);
      });

      toast.success('Message deleted');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${message.id}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (!res.ok) throw new Error("Failed to react");

      const { status } = await res.json();
      
      setCurrentReactions((prev) => {
        const existing = prev.find(r => r.emoji === emoji);
        if (existing) {
          // Update existing reaction
          if (status === "removed" && existing.count === 1) {
            // Remove reaction if count would be 0
            return prev.filter(r => r.emoji !== emoji);
          }
          return prev.map((reaction) =>
            reaction.emoji === emoji
              ? {
                  ...reaction,
                  count: status === "added" ? reaction.count + 1 : reaction.count - 1,
                  hasReacted: status === "added",
                }
              : reaction
          );
        } else if (status === "added") {
          // Add new reaction
          return [...prev, { emoji, count: 1, hasReacted: true, userId: session?.user?.id || '' }];
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Failed to add reaction");
    }
  };

  useEffect(() => {
    // Subscribe to message updates
    socketService.subscribeToMessageUpdates(message.id, (updatedMessage) => {
      queryClient.setQueryData(['messages'], (oldData: MessageType[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg);
      });
    });

    // Subscribe to reactions
    socketService.subscribeToReactions(message.id, (updatedReactions) => {
      setCurrentReactions(updatedReactions.filter(reaction => reaction.count > 0));
    });

    return () => {
      socketService.unsubscribeFromMessageUpdates(message.id);
      socketService.unsubscribeFromReactions(message.id);
    };
  }, [message.id, queryClient]);

  return (
    <div className="group relative flex items-start gap-3 py-2 px-4 hover:bg-gray-50">
      <UserAvatarButton user={message.user} />
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{message.user.name}</span>
          <span className="text-sm text-gray-500">
            {formatTimeAgo(new Date(message.createdAt))}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto p-1 text-gray-400 hover:text-red-500"
              title="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="prose prose-sm max-w-none text-gray-900">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-0 text-gray-900">{children}</p>,
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt || 'message image'} 
                  className="max-h-96 rounded-lg" 
                />
              ),
              video: ({ src, ...props }) => (
                <video 
                  src={src}
                  className="max-h-96 rounded-lg" 
                  controls 
                  {...props}
                />
              ),
              a: ({ href, children }) => (
                <a 
                  href={href}
                  className="text-blue-500 hover:underline" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        <div className="mt-2 flex items-center gap-4">
          <div className="flex items-center gap-1">
            {currentReactions.map((reaction) => (
              <Button
                key={reaction.emoji}
                variant="ghost"
                size="sm"
                className={cn(
                  "h-6 px-2 py-1 text-xs bg-blue-50 border border-gray-300 hover:bg-blue-100",
                  reaction.hasReacted && "bg-blue-100"
                )}
                onClick={() => handleReaction(reaction.emoji)}
              >
                <span>{reaction.emoji}</span>
                {reaction.count > 0 && (
                  <span className="ml-1 text-black font-medium">{reaction.count}</span>
                )}
              </Button>
            ))}
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 bg-blue-50 border border-gray-300 hover:bg-blue-100"
                >
                  <Plus className="h-3 w-3 text-gray-500" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-auto p-2 bg-white border border-gray-200 shadow-lg" 
                align="start"
              >
                <div className="flex gap-1">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 px-2"
                      onClick={() => handleReaction(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {message.threadCount > 0 ? (
              <button
                onClick={() => onThreadClick?.(message)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                {message.threadCount} {message.threadCount === 1 ? 'reply' : 'replies'}
              </button>
            ) : (
              <button
                onClick={() => onThreadClick?.(message)}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                <MessageSquare className="h-4 w-4" />
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 