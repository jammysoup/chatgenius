export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string;
}

export interface Reaction {
  id: string;
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  channelId: string;
  parentId?: string | null;
  user: User;
  reactions: Reaction[];
  threadCount?: number;
}

export interface Channel {
  id: string;
  name: string;
  type?: 'channel' | 'dm';
  isPrivate?: boolean;
  members?: User[];
  ownerId?: string;
}

export type ChannelType = {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  isPrivate?: boolean;
  members?: User[];
  otherUser?: User;
} 