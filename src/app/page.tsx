"use client";

import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { MessageReactions } from "@/components/message-reactions";

type ChannelType = {
  id: string;
  name: string;
  type: 'channel' | 'dm';
};

type Message = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
  reactions: {
    emoji: string;
    count: number;
    hasReacted: boolean;
  }[];
};

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [activeChannel, setActiveChannel] = useState<ChannelType>({
    id: 'general',
    name: 'general',
    type: 'channel'
  });
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [directMessages, setDirectMessages] = useState<ChannelType[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchMessages();
    fetchMembers(activeChannel.id);
  }, [activeChannel.id]);

  useEffect(() => {
    const initializeChannels = async () => {
      const response = await fetch("/api/channels");
      if (response.ok) {
        const data = await response.json();
        const channelsList = data.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          type: 'channel'
        }));
        setChannels(channelsList);

        // Set initial active channel if none selected
        if (!activeChannel.id && channelsList.length > 0) {
          setActiveChannel(channelsList[0]);
        }
      }
    };

    if (session?.user) {
      initializeChannels();
    }
  }, [session]);

  const fetchMessages = async () => {
    const response = await fetch(`/api/messages?channelId=${activeChannel.id}`);
    if (response.ok) {
      const data = await response.json();
      
      // Fetch reactions for each message
      const messagesWithReactions = await Promise.all(
        data.map(async (message: Message) => {
          const reactionsResponse = await fetch(`/api/messages/${message.id}/reactions`);
          if (reactionsResponse.ok) {
            const reactions = await reactionsResponse.json();
            return { ...message, reactions };
          }
          return { ...message, reactions: [] };
        })
      );
      
      setMessages(messagesWithReactions);
    }
  };

  const fetchMembers = async (channelId: string) => {
    const response = await fetch(`/api/channels/${channelId}/members`);
    if (response.ok) {
      const data = await response.json();
      setMembers(data);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: newMessage,
        channelId: activeChannel.id,
      }),
    });

    if (response.ok) {
      setNewMessage("");
      fetchMessages();
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    setIsCreatingChannel(true);
    try {
      const response = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newChannelName.toLowerCase().replace(/\s+/g, '-'),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create channel");
      }

      // Refresh channels list
      const channelsResponse = await fetch("/api/channels");
      if (channelsResponse.ok) {
        const data = await channelsResponse.json();
        setChannels(data.map((channel: any) => ({
          id: channel.id,
          name: channel.name,
          type: 'channel'
        })));
      }

      setNewChannelName("");
      setIsCreatingChannel(false);
    } catch (error) {
      console.error("Error creating channel:", error);
      setIsCreatingChannel(false);
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const handleChannelClick = (channel: ChannelType) => {
    setActiveChannel(channel);
  };

  return (
    <div className="h-screen grid grid-cols-[260px_1fr_240px]">
      <div className="bg-[#4F3B7B] text-gray-100 p-4">
        <div className="pb-4 px-2 border-b border-[#6B5494]">
          <h1 className="font-semibold text-white">ChatGenius</h1>
        </div>

        <div className="mt-4">
          <div className="px-2 flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium">Channels</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-[#5D477F] rounded-sm"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <form onSubmit={handleCreateChannel}>
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Create Channel</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <Input
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="channel-name"
                      className="bg-gray-50 border-gray-200"
                      disabled={isCreatingChannel}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-purple-500 hover:bg-purple-600 text-white"
                      disabled={isCreatingChannel}
                    >
                      {isCreatingChannel ? "Creating..." : "Create Channel"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <ul>
            {channels.map((channel) => (
              <li key={channel.id}>
                <Button
                  variant="ghost"
                  className={`w-full px-2 py-1 text-gray-100 hover:bg-[#5D477F] rounded justify-start font-normal ${
                    activeChannel.id === channel.id ? 'bg-[#5D477F]' : ''
                  }`}
                  onClick={() => handleChannelClick(channel)}
                >
                  <span className="text-gray-300 mr-2">#</span>
                  {channel.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6">
          <h2 className="px-2 text-sm font-medium mb-2">Direct Messages</h2>
          <ul>
            {directMessages.map((dm) => (
              <li key={dm.id}>
                <Button
                  variant="ghost"
                  className={`w-full px-2 py-1 text-gray-100 hover:bg-[#5D477F] rounded justify-start font-normal ${
                    activeChannel.id === dm.id ? 'bg-[#5D477F]' : ''
                  }`}
                  onClick={() => handleChannelClick(dm)}
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                  {dm.name}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col bg-white">
        <div className="h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white">
          <h2 className="text-gray-900 font-semibold">
            {activeChannel.type === 'channel' ? '#' : ''} {activeChannel.name}
          </h2>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 rounded-full bg-purple-500 p-0 text-white hover:bg-purple-600"
              >
                {session?.user?.name?.[0] || 'U'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border-gray-200" align="end">
              <DropdownMenuLabel className="text-gray-700">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-gray-100 text-gray-700"
                onClick={() => router.push("/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer hover:bg-gray-100 text-gray-700">
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                className="cursor-pointer text-red-500 hover:bg-gray-100"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-gray-800 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                  {message.user.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-gray-900">
                      {message.user.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{message.content}</p>
                  <div className="mt-1">
                    <MessageReactions
                      messageId={message.id}
                      initialReactions={message.reactions}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-2 border border-gray-200">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={`Message ${activeChannel.type === 'channel' ? '#' : ''}${activeChannel.name}`}
              className="bg-transparent border-0 focus-visible:ring-0 text-gray-700 placeholder:text-gray-400"
            />
          </div>
        </form>
      </div>

      <div className="bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700">Channel Members</h3>
          <p className="text-xs text-gray-500 mt-1">{members.length} members</p>
        </div>
        <div className="p-2">
          <div className="space-y-1">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-50"
              >
                <div className="relative w-8 h-8">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name || 'User'}
                      fill
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                      {member.name?.[0] || 'U'}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {member.name || 'Anonymous User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.email}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
