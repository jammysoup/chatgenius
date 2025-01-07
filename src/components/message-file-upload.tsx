"use client"

import { UploadCloud, X } from "lucide-react"
import { Button } from "./ui/button"
import Image from "next/image"
import { useState } from "react"
import { toast } from "sonner"

interface MessageFileUploadProps {
  onFileUpload: (url: string, type: "file" | "image") => void
}

export function MessageFileUpload({ onFileUpload }: MessageFileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async (file: File) => {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()
      const fileType = file.type.startsWith("image/") ? "image" : "file"
      
      // If it's an image, show preview
      if (fileType === "image") {
        setPreview(data.url)
      }

      onFileUpload(data.url, fileType)
      toast.success("File uploaded successfully")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  const clearPreview = () => {
    setPreview(null)
  }

  return (
    <div className="relative">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
        }}
      />
      
      {preview ? (
        <div className="relative w-32 h-32 mb-2">
          <Image
            src={preview}
            alt="Upload preview"
            fill
            className="object-cover rounded-md"
          />
          <Button
            size="sm"
            variant="destructive"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={clearPreview}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isUploading}
          >
            <UploadCloud className="h-4 w-4" />
            {isUploading ? "Uploading..." : "Upload File"}
          </Button>
        </label>
      )}
    </div>
  )
} 