import { useState } from 'react';
import { UploadButton } from '@/components/upload-button';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUploadComplete = (imageUrl: string) => {
    setContent(prev => prev + `\n![image](${imageUrl})`);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!content.trim() || isUploading) return;

    try {
      await onSend(content);
      setContent('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t">
      <UploadButton onUploadComplete={handleUploadComplete} />
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 min-h-[44px] max-h-[200px]"
        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
          }
        }}
      />
      <Button type="submit" size="icon" disabled={!content.trim() || isUploading}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
} 