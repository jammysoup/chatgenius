export const EMOJI_OPTIONS = ["👍", "❤️", "😄", "😮", "😢", "😡"];

export const DEFAULT_CHANNEL = {
  id: 'general',
  name: 'general',
  type: 'channel' as const
};

export const API_ENDPOINTS = {
  MESSAGES: '/api/messages',
  CHANNELS: '/api/channels',
  WORKSPACE_MEMBERS: '/api/workspace/members',
  USER_STATUS: '/api/user/status',
  DM: '/api/dm',
} as const;

export const ROLE_STYLES = {
  owner: {
    bg: 'bg-purple-100',
    text: 'text-purple-800'
  },
  admin: {
    bg: 'bg-blue-100',
    text: 'text-blue-800'
  },
  member: {
    bg: 'bg-gray-100',
    text: 'text-gray-800'
  }
} as const; 