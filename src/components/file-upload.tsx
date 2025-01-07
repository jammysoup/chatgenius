"use client"

import { UploadCloud } from "lucide-react"
import { Button } from "./ui/button"

interface FileUploadProps {
  onChange: (url?: string) => void
  value: string
  endpoint: "messageFile" | "serverImage"
}

export const FileUpload = ({
  onChange,
  value,
  endpoint
}: FileUploadProps) => {
  const fileType = endpoint === "messageFile" ? "file" : "image"

  return (
    <Button
      onClick={() => {
        const input = document.createElement("input")
        input.type = "file"
        input.accept = endpoint === "messageFile" ? "*" : "image/*"
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const formData = new FormData()
            formData.append(fileType, file)
            
            try {
              const response = await fetch(`/api/${endpoint}`, {
                method: "POST",
                body: formData
              })
              
              if (!response.ok) throw new Error("Upload failed")
              
              const data = await response.json()
              onChange(data.url)
            } catch (error) {
              console.error("Upload error:", error)
            }
          }
        }
        input.click()
      }}
      variant="ghost"
      className="flex items-center gap-2 hover:bg-zinc-700/10 dark:hover:bg-zinc-700/50"
    >
      <UploadCloud className="h-5 w-5" />
      Upload {endpoint === "messageFile" ? "File" : "Image"}
    </Button>
  )
} 