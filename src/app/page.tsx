"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DMSection } from "@/components/direct-messages/dm-section";
import { MessageInput } from "@/components/messages/message-input";
import { Message } from "@/components/messages/message";
import { Thread } from "@/components/thread";
import { MemberActions } from "@/components/member-actions";
import Image from "next/image";
import type { Message as MessageType, ChannelType, Member } from "@/types";
import { fetchMessages, fetchChannels, fetchWorkspaceMembers, sendMessage } from "@/common/api";
import { DEFAULT_CHANNEL, API_ENDPOINTS, ROLE_STYLES } from "@/common/constants";
import { formatTimeAgo, getInitials, sanitizeChannelName } from "@/common/utils";

interface ThreadProps {
  parentMessage: MessageType;
  onClose: () => void;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [activeChannel, setActiveChannel] = useState<ChannelType>(DEFAULT_CHANNEL);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [channels, setChannels] = useState<ChannelType[]>([]);
  const [newChannelName, setNewChannelName] = useState("");
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeThread, setActiveThread] = useState<MessageType | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) return;
    const loadMembers = async () => {
      try {
        const membersList = await fetchWorkspaceMembers();
        setMembers(membersList);
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };
    loadMembers();
  }, [session?.user?.id]);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const messagesList = await fetchMessages(activeChannel.id);
        setMessages(messagesList);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    loadMessages();
  }, [activeChannel.id]);

  useEffect(() => {
    const initializeChannels = async () => {
      if (!session?.user) return;
      try {
        const channelsList = await fetchChannels();
        setChannels(channelsList);
        if (!activeChannel.id && channelsList.length > 0) {
          setActiveChannel(channelsList[0]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };
    initializeChannels();
  }, [session]);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    setIsCreatingChannel(true);
    try {
      const response = await fetch(API_ENDPOINTS.CHANNELS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizeChannelName(newChannelName),
        }),
      });

      if (!response.ok) throw new Error("Failed to create channel");

      const channelsList = await fetchChannels();
      setChannels(channelsList);
      setNewChannelName("");
    } catch (error) {
      console.error("Error creating channel:", error);
    } finally {
      setIsCreatingChannel(false);
    }
  };

  const handleChannelClick = (channel: ChannelType) => {
    setActiveChannel(channel);
  };

  const handleStartThread = (message: MessageType) => {
    setActiveThread(message);
  };

  const handleCloseThread = () => {
    setActiveThread(null);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  if (status === "loading") return <div>Loading...</div>;
  if (status === "unauthenticated") redirect("/login");

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

        <DMSection
          activeChannel={activeChannel}
          onChannelSelect={handleChannelClick}
        />
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
                onClick={async () => {
                  try {
                    // Set status to offline before signing out
                    await fetch("/api/user/status", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ status: "offline" })
                    });
                  } catch (error) {
                    console.error("Error updating status:", error);
                  }
                  signOut({ callbackUrl: "/login" });
                }}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="text-gray-800 space-y-4">
            {messages.map((message) => (
              <Message
                key={message.id}
                message={message}
                onThreadClick={handleStartThread}
              />
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-gray-300">
          <MessageInput
            channelId={activeChannel.id}
            placeholder="Type a message..."
            onSend={() => {
              fetchMessages(activeChannel.id).then(setMessages);
            }}
          />
        </div>
      </div>

      <div className="bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">
            Members ({members.length})
          </h3>
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
                    {member.role && (
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                        member.role === 'owner' 
                          ? 'bg-purple-100 text-purple-800'
                          : member.role === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {member.email}
                  </p>
                </div>
                <MemberActions 
                  member={member} 
                  onUpdate={() => fetchWorkspaceMembers()}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeThread && (
        <Thread
          parentMessage={activeThread}
          onClose={handleCloseThread}
        />
      )}
    </div>
  );
}
