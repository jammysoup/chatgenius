"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { toast } from "sonner";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (e.g., 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      await update({ image: data.imageUrl });
      toast.success("Profile picture updated successfully");
    } catch (error) {
      console.error("Error uploading image:", error);
      setError(typeof error === 'string' ? error : "Failed to upload image. Please try again.");
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#222529] text-gray-200 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Profile Settings</h1>
        
        <div className="bg-[#2C2D30] rounded-lg p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-medium">Profile Picture</label>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white text-2xl overflow-hidden">
                  {(previewUrl || session?.user?.image) ? (
                    <Image
                      src={previewUrl || session.user.image || ''}
                      alt="Profile"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    session?.user?.name?.[0] || "U"
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                  id="avatar-upload"
                />
                <label htmlFor="avatar-upload">
                  <Button
                    type="button"
                    variant="outline"
                    className="cursor-pointer"
                    disabled={isUploading}
                  >
                    {isUploading ? "Uploading..." : "Change Picture"}
                  </Button>
                </label>
                {error && <p className="text-red-400 text-sm">{error}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                type="text"
                value={session?.user?.name || ""}
                disabled
                className="bg-[#3F3F3F] border-0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="bg-[#3F3F3F] border-0"
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              Back to Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 