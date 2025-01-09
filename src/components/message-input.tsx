"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Paperclip, X } from "lucide-react"
import { toast } from "sonner"

interface MessageInputProps {
  onSend: (content: string) => Promise<void>
}

type AttachmentPreview = {
  file: File;
  previewUrl: string;
  type: 'image' | 'video' | 'file';
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [attachment, setAttachment] = useState<AttachmentPreview | null>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log("No file selected");
      return;
    }

    console.log("File selected:", { name: file.name, type: file.type, size: file.size });

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB")
      return
    }

    // Create preview
    let type: 'image' | 'video' | 'file' = 'file';
    if (file.type.startsWith('image/')) {
      type = 'image';
    } else if (file.type.startsWith('video/')) {
      type = 'video';
    }

    const previewUrl = URL.createObjectURL(file);
    setAttachment({ file, previewUrl, type });
  }

  const handleUploadAndSend = async () => {
    if (!content.trim() && !attachment) return;

    try {
      let messageContent = content;

      // Upload file if there's an attachment
      if (attachment) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", attachment.file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const data = await response.json();
        
        // Add file URL to message based on type
        if (attachment.type === 'image') {
          messageContent += `\n![image](${data.url})`;
        } else if (attachment.type === 'video') {
          messageContent += `\n<video controls src="${data.url}"></video>`;
        } else {
          messageContent += `\n[${attachment.file.name}](${data.url})`;
        }
      }

      await onSend(messageContent);
      setContent("");
      setAttachment(null);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsUploading(false);
    }
  }

  const removeAttachment = () => {
    if (attachment) {
      URL.revokeObjectURL(attachment.previewUrl);
      setAttachment(null);
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 border-t">
      {/* Attachment Preview */}
      {attachment && (
        <div className="relative inline-block max-w-xs">
          {attachment.type === 'image' && (
            <img 
              src={attachment.previewUrl} 
              alt="attachment preview" 
              className="max-h-32 rounded"
            />
          )}
          {attachment.type === 'video' && (
            <video 
              src={attachment.previewUrl} 
              className="max-h-32 rounded" 
              controls
            />
          )}
          {attachment.type === 'file' && (
            <div className="p-2 bg-gray-100 rounded flex items-center gap-2">
              <Paperclip className="h-4 w-4" />
              <span className="text-sm truncate">{attachment.file.name}</span>
            </div>
          )}
          <button
            onClick={removeAttachment}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Message Input */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-gray-500 hover:text-gray-700"
          onClick={(e) => {
            e.preventDefault()
            const fileInput = document.querySelector('#file-upload') as HTMLInputElement
            if (fileInput) {
              fileInput.click()
            }
          }}
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 resize-none"
          disabled={isUploading}
        />
        <Button 
          onClick={handleUploadAndSend}
          disabled={(!content.trim() && !attachment) || isUploading}
        >
          Send
        </Button>
      </div>
    </div>
  )
} 