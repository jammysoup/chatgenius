import type { Message, ChannelType, Member } from '@/types';

export async function fetchMessages(channelId: string): Promise<Message[]> {
  const response = await fetch(`/api/messages?channelId=${channelId}`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  
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
  
  return messagesWithReactions;
}

export async function fetchChannels(): Promise<ChannelType[]> {
  const response = await fetch("/api/channels");
  if (!response.ok) throw new Error('Failed to fetch channels');
  
  const data = await response.json();
  return data.map((channel: any) => ({
    id: channel.id,
    name: channel.name,
    type: 'channel'
  }));
}

export async function fetchWorkspaceMembers(): Promise<Member[]> {
  const response = await fetch('/api/workspace/members', {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to fetch members: ${data.error}`);
  }
  
  return Array.isArray(data.members) ? data.members : [];
}

export async function sendMessage(content: string, channelId: string): Promise<void> {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      channelId,
    }),
  });

  if (!response.ok) throw new Error("Failed to send message");
} 