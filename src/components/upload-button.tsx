import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface UploadButtonProps {
  onUploadComplete: (url: string) => void;
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) throw new Error("Upload failed");
      
      const { url } = await response.json();
      onUploadComplete(url);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <Button variant="ghost" className="p-2" asChild>
      <label>
        <Upload className="h-5 w-5" />
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
        />
      </label>
    </Button>
  );
} 