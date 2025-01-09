"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"]

interface Reaction {
  emoji: string
  count: number
  hasReacted: boolean
}

type MessageReactionsProps = {
  messageId: string;
  reactions: {
    emoji: string;
    count: number;
    hasReacted: boolean;
  }[];
};

export function MessageReactions({ messageId, reactions: initialReactions }: MessageReactionsProps) {
  const [currentReactions, setCurrentReactions] = useState<typeof initialReactions>(
    initialReactions.filter(reaction => reaction.count > 0)
  );

  const handleReaction = async (emoji: string) => {
    try {
      const res = await fetch(`/api/messages/${messageId}/reactions`, {
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
          return [...prev, { emoji, count: 1, hasReacted: true }];
        }
        return prev;
      });
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
    }
  };

  return (
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
                onClick={() => {
                  handleReaction(emoji);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 