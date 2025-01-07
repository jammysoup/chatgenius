"use client";

import { useState } from "react"
import { MessageInput } from "./message-input"
import { useQueryClient } from "@tanstack/react-query"

export function ChatInterface() {
  const queryClient = useQueryClient()

  const handleSendMessage = async (content: string) => {
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          channelId: "your-channel-id" // Replace with actual channel ID
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to send message")
      }

      // Invalidate and refetch messages
      await queryClient.invalidateQueries({ queryKey: ["messages"] })
    } catch (error) {
      console.error("Error sending message:", error)
      throw error // Let MessageInput handle the error
    }
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto p-4">
        {/* Your messages list component here */}
      </main>
      
      <MessageInput onSend={handleSendMessage} />
    </div>
  )
}