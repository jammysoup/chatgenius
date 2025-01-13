import { Socket as ClientSocket } from "socket.io-client";
import io from "socket.io-client";
import type { Message } from "@/types";

class SocketService {
  private static instance: SocketService;
  private socket: ClientSocket | null = null;

  private constructor() {
    const url = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
    this.socket = io(url, {
      path: '/api/socket',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    this.socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public subscribeToMessages(channelId: string, callback: (message: Message) => void) {
    this.socket?.on(`message:new:${channelId}`, callback);
  }

  public subscribeToThreadMessages(threadId: string, callback: (message: Message) => void) {
    this.socket?.on(`thread:message:${threadId}`, callback);
  }

  public emitNewMessage(channelId: string, message: Message) {
    if (message.parentId) {
      // This is a thread message
      this.socket?.emit('server:thread:message', message);
    } else {
      // This is a channel message
      this.socket?.emit('server:message', { channelId, message });
    }
  }

  public unsubscribeFromMessages(channelId: string) {
    this.socket?.off(`message:new:${channelId}`);
  }

  public unsubscribeFromThreadMessages(threadId: string) {
    this.socket?.off(`thread:message:${threadId}`);
  }

  public subscribeToMessageUpdates(messageId: string, callback: (message: Message) => void) {
    this.socket?.on(`message:update:${messageId}`, callback);
  }

  public unsubscribeFromMessageUpdates(messageId: string) {
    this.socket?.off(`message:update:${messageId}`);
  }

  public subscribeToReactions(messageId: string, callback: (reactions: Array<{ emoji: string; count: number; hasReacted: boolean; userId: string }>) => void) {
    this.socket?.on(`message:reactions:${messageId}`, callback);
  }

  public unsubscribeFromReactions(messageId: string) {
    this.socket?.off(`message:reactions:${messageId}`);
  }
}

export const socketService = SocketService.getInstance(); 