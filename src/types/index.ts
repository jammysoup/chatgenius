export interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  channelId: string;
  parentId?: string | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
  reactions: {
    emoji: string;
    count: number;
    hasReacted: boolean;
    userId: string;
  }[];
  threadCount: number;
}

export interface ChannelType {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  otherUser?: Member; // For DM channels
}

export interface Reaction {
  emoji: string;
  count: number;
  hasReacted: boolean;
  userId: string;
} 