"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DmUserSelector } from "./dm-user-selector";
import type { ChannelType } from "@/types";

interface DMSectionProps {
  activeChannel: ChannelType;
  onChannelSelect: (channel: ChannelType) => void;
}

export function DMSection({ activeChannel, onChannelSelect }: DMSectionProps) {
  const [directMessages, setDirectMessages] = useState<ChannelType[]>([]);

  useEffect(() => {
    fetchDirectMessages();
  }, []);

  const fetchDirectMessages = async () => {
    try {
      const response = await fetch('/api/dm');
      if (!response.ok) throw new Error('Failed to fetch DMs');
      const data = await response.json();
      setDirectMessages(data);
    } catch (error) {
      console.error('Error fetching DMs:', error);
    }
  };

  const handleDmCreated = () => {
    fetchDirectMessages(); // Refresh the DM list
  };

  return (
    <div className="mt-6">
      <div className="px-2 flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-100">Direct Messages</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 hover:bg-[#5D477F] rounded-sm"
            >
              <Plus className="h-4 w-4 text-gray-100" />
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>New Direct Message</DialogTitle>
            </DialogHeader>
            <DmUserSelector onDmCreated={handleDmCreated} />
          </DialogContent>
        </Dialog>
      </div>
      
      <ul>
        {directMessages.map((dm) => (
          <li key={dm.id}>
            <Button
              variant="ghost"
              className={`w-full px-2 py-1 text-gray-100 hover:bg-[#5D477F] rounded justify-start font-normal ${
                activeChannel.id === dm.id ? 'bg-[#5D477F]' : ''
              }`}
              onClick={() => onChannelSelect(dm)}
            >
              <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
              {dm.otherUser?.name || 'Unknown User'}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
} 