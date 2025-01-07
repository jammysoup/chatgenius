import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { MessageSquarePlus } from "lucide-react";
import { StartDmDialog } from "./start-dm-dialog";
import type { ChannelType } from "@/types";

interface DmListProps {
  activeChannel: ChannelType;
  onChannelSelect: (channel: ChannelType) => void;
}

export function DmList({ activeChannel, onChannelSelect }: DmListProps) {
  const [directMessages, setDirectMessages] = useState<ChannelType[]>([]);

  useEffect(() => {
    fetchDirectMessages();
  }, []);

  const fetchDirectMessages = async () => {
    try {
      const response = await fetch('/api/channels/dms');
      if (!response.ok) throw new Error('Failed to fetch DMs');
      const data = await response.json();
      setDirectMessages(data);
    } catch (error) {
      console.error('Error fetching DMs:', error);
    }
  };

  const handleDmCreated = () => {
    fetchDirectMessages();
  };

  return (
    <div className="mt-6">
      <div className="px-2 flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-gray-100">Direct Messages</h2>
        <StartDmDialog onDmCreated={handleDmCreated} />
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
              {dm.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
} 