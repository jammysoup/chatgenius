"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Paperclip } from "lucide-react"
import { MessageFileUpload } from "./message-file-upload"
import { toast } from "sonner"
import { EmojiPickerButton } from "./emoji-picker-button"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ url: string, type: "file" | "image" }>>([])
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && attachments.length === 0) return

    try {
      setIsSending(true)
      
      // Format message with attachments
      const messageContent = [
        content,
        ...attachments.map(att => {
          return att.type === "image" 
            ? `![Image](${att.url})`
            : `[File](${att.url})`
        })
      ].join("\n")

      await onSend(messageContent)
      
      // Reset state
      setContent("")
      setAttachments([])
      setIsAttachmentOpen(false)
    } catch (error) {
      toast.error("Failed to send message")
    } finally {
      setIsSending(false)
    }
  }

  const handleFileUpload = (url: string, type: "file" | "image") => {
    setAttachments(prev => [...prev, { url, type }])
    setIsAttachmentOpen(false) // Close the upload dialog after successful upload
  }

  const handleEmojiSelect = (emoji: string) => {
    setContent(prev => prev + emoji)
  }

  return (
    <div className="relative"> {/* Added wrapper div for positioning */}
      {/* File upload component */}
      {isAttachmentOpen && (
        <div className="absolute bottom-full left-0 mb-2 bg-white p-4 rounded-md shadow-lg border">
          <MessageFileUpload onFileUpload={handleFileUpload} />
        </div>
      )}

      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="absolute bottom-full left-0 flex gap-2 mb-2 p-2">
          {attachments.map((att, index) => (
            <div key={index} className="relative group">
              {att.type === "image" ? (
                <img 
                  src={att.url} 
                  alt="attachment" 
                  className="w-20 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center">
                  📎
                </div>
              )}
              <button
                type="button"
                onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSend} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded border border-gray-300">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.preventDefault()
              setIsAttachmentOpen(!isAttachmentOpen)
            }}
          >
            <Paperclip className="h-5 w-5" />
          </Button>

          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 p-2 focus:outline-none"
          />
          
          <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
        </div>

        <button
          type="submit"
          disabled={isSending || (!content.trim() && attachments.length === 0)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  )
} 