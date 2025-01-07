"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { MessageReactions } from "./message-reactions";
import { formatTimeAgo } from "@/lib/utils";
import type { Message as MessageType } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { UserAvatarButton } from "@/components/user-avatar-button";

interface MessageProps {
  message: MessageType;
  onThreadClick?: () => void;
  threadCount?: number;
}

export function Message({ message, onThreadClick, threadCount }: MessageProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Listen for message updates
    socket.on(`message:update:${message.id}`, (updatedMessage: MessageType) => {
      queryClient.setQueryData(['messages'], (oldData: MessageType[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg);
      });
    });

    // Listen for thread count updates
    socket.on(`thread:update:${message.id}`, (newThreadCount: number) => {
      queryClient.setQueryData(['threadCounts', message.id], newThreadCount);
    });

    // Add specific reaction update listener
    socket.on(`reaction:update:${message.id}`, (updatedReactions: MessageType['reactions']) => {
      queryClient.setQueryData(['messages'], (oldData: MessageType[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map(msg => 
          msg.id === message.id 
            ? { ...msg, reactions: updatedReactions }
            : msg
        );
      });
    });

    return () => {
      socket.off(`message:update:${message.id}`);
      socket.off(`thread:update:${message.id}`);
      socket.off(`reaction:update:${message.id}`);
    };
  }, [message.id, queryClient]);

  return (
    <div className="group px-4 py-2 hover:bg-gray-50 flex gap-4">
      <div className="flex-shrink-0 w-10 h-10">
        <UserAvatarButton user={message.user} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-medium">{message.user.name}</span>
          <span className="text-xs text-gray-500">
            {formatTimeAgo(new Date(message.createdAt))}
          </span>
        </div>
        <p className="mt-1">{message.content}</p>

        <div className="mt-2 flex items-center gap-4">
          <MessageReactions
            messageId={message.id}
            reactions={message.reactions.map(r => ({
              emoji: r.emoji,
              count: 1,
              hasReacted: r.userId === session?.user?.id
            }))}
          />
          {onThreadClick && (
            <button
              onClick={onThreadClick}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {threadCount || 0} replies
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 