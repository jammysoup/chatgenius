import { UploadButton } from '@/components/upload-button';

export function MessageInput() {
  const handleUploadComplete = (imageUrl: string) => {
    // Add the image URL to your message content
    // Send the message with the image URL
  };

  return (
    <div className="flex items-center gap-2 p-4">
      <UploadButton onUploadComplete={handleUploadComplete} />
      {/* Your existing message input components */}
    </div>
  );
} 