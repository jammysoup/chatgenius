'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"]

interface PostReactionsProps {
  post: {
    id: string;
    reactions: string[];
  };
}

export function PostReactions({ post }: PostReactionsProps) {
  const queryClient = useQueryClient()
  
  // Query for reactions
  const { data: reactions = [] } = useQuery({
    queryKey: ['reactions', post.id],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/reactions`)
      const data = await response.json()
      return data.reactions || []
    },
    // Initialize with any existing reactions from the server
    initialData: post.reactions || [],
  })

  // Mutation for updating reactions
  const { mutate: handleReaction } = useMutation({
    mutationFn: async (emoji: string) => {
      const response = await fetch(`/api/posts/${post.id}/reactions`, {
        method: 'POST',
        body: JSON.stringify({ emoji }),
      })
      if (!response.ok) throw new Error('Failed to update reaction')
      return response.json()
    },
    onSuccess: (data) => {
      // Invalidate and refetch reactions for this post
      queryClient.invalidateQueries({ queryKey: ['reactions', post.id] })
      
      // Also invalidate the parent post list if it exists
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })

  return (
    <div className="flex gap-2">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className={cn(
            "rounded-md p-2 hover:bg-accent",
            reactions.includes(emoji) 
              ? "bg-accent" 
              : "bg-background"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
} 