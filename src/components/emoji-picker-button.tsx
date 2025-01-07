"use client";

import { useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="p-2 hover:bg-gray-100 rounded-md text-gray-500 hover:text-gray-700"
        >
          <Smile className="h-5 w-5" />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-full p-0 border-none shadow-xl" 
        side="top" 
        align="start"
      >
        <EmojiPicker
          onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
          width="100%"
        />
      </PopoverContent>
    </Popover>
  );
} 