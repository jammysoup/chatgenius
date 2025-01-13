"use client"

import { useEffect, useState } from "react";
import { cn } from '@/common/utils'
import { Button } from "./ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"]

interface Reaction {
  emoji: string
  count: number
  hasReacted: boolean
}

interface CommentReactionsProps {
  commentId: string
  initialReactions: Reaction[]
}

export function CommentReactions({
  commentId,
  initialReactions,
}: CommentReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>(initialReactions)

  const handleReaction = async (emoji: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
        cache: 'no-store'
      })

      if (!res.ok) {
        const error = await res.json()
        console.error('Reaction error:', error)
        throw new Error(error.message || "Failed to react")
      }

      const { status } = await res.json()
      
      setReactions((prev) =>
        prev.map((reaction) =>
          reaction.emoji === emoji
            ? {
                ...reaction,
                count: status === "added" ? reaction.count + 1 : reaction.count - 1,
                hasReacted: status === "added",
              }
            : reaction
        )
      )
    } catch (error) {
      console.error("Failed to toggle reaction:", error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {reactions.map((reaction) => (
        reaction.count > 0 && (
          <Button
            key={reaction.emoji}
            variant="ghost"
            size="sm"
            className={cn(
              "flex items-center gap-1 px-2 hover:bg-muted",
              reaction.hasReacted && "bg-muted"
            )}
            onClick={() => handleReaction(reaction.emoji)}
          >
            <span>{reaction.emoji}</span>
            <span className="text-xs">{reaction.count}</span>
          </Button>
        )
      ))}

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="px-2">
            <span className="text-lg">😀</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-1" align="start">
          <div className="flex flex-wrap gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="hover:bg-muted px-2"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 