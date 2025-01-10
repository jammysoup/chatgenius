"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PaperclipIcon, SendIcon, XIcon } from "lucide-react"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import type { Message } from "@/types"

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "video/mp4",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]

interface MessageInputProps {
  channelId: string
  parentId?: string
  placeholder?: string
  onSend?: () => void
}

export function MessageInput({ channelId, parentId, placeholder, onSend }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{
    url: string
    type: string
    name: string
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File size must be less than 5MB")
      return
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      toast.error("File type not supported")
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const { url } = await response.json()
      setUploadedFile({
        url,
        type: file.type,
        name: file.name,
      })
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!content.trim() && !uploadedFile) return

    try {
      const messageContent = uploadedFile
        ? `${content}\n${uploadedFile.type.startsWith("image/") ? "!" : ""}[${
            uploadedFile.name
          }](${uploadedFile.url})`
        : content

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: messageContent,
          channelId,
          parentId,
        }),
      })

      if (!response.ok) throw new Error("Failed to send message")

      const newMessage = await response.json()

      // Update cache with new message
      queryClient.setQueryData<Message[]>(["messages", channelId], (oldData) => {
        if (!oldData) return [newMessage]
        return [...oldData, newMessage]
      })

      // Clear input
      setContent("")
      setUploadedFile(null)
      if (onSend) onSend()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-t">
      {uploadedFile && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
          <span className="text-sm text-gray-600 truncate flex-1">
            {uploadedFile.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-gray-200"
            onClick={() => setUploadedFile(null)}
          >
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type a message..."}
          className="min-h-[60px] flex-1"
          rows={1}
        />
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept={ALLOWED_FILE_TYPES.join(",")}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <PaperclipIcon className="h-5 w-5" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="h-10 w-10"
            onClick={handleSubmit}
            disabled={(!content.trim() && !uploadedFile) || isUploading}
          >
            <SendIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
} 