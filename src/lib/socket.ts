import { Socket } from "socket.io-client";
import io from "socket.io-client";
import { Message } from "@/types";

class SocketService {
  private static instance: SocketService;
  private socket: typeof Socket | null = null;
  
  private constructor() {
    const SOCKET_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    this.socket = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket!.on("connect", () => {
      console.log("Socket connected:", this.socket?.id);
    });

    this.socket!.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  }

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public joinChannel(channelId: string) {
    this.socket?.emit("channel:join", channelId);
  }

  public leaveChannel(channelId: string) {
    this.socket?.emit("channel:leave", channelId);
  }

  public subscribeToMessages(channelId: string, callback: (message: Message) => void) {
    this.socket?.on(`message:new:${channelId}`, callback);
  }

  public unsubscribeFromMessages(channelId: string) {
    this.socket?.off(`message:new:${channelId}`);
  }

  public subscribeToMessageUpdates(messageId: string, callback: (message: Message) => void) {
    this.socket?.on(`message:update:${messageId}`, callback);
  }

  public unsubscribeFromMessageUpdates(messageId: string) {
    this.socket?.off(`message:update:${messageId}`);
  }

  public subscribeToReactions(messageId: string, callback: (reactions: any[]) => void) {
    this.socket?.on(`reaction:update:${messageId}`, callback);
  }

  public unsubscribeFromReactions(messageId: string) {
    this.socket?.off(`reaction:update:${messageId}`);
  }

  public emitNewMessage(channelId: string, message: Message) {
    this.socket?.emit("message:new", { channelId, message });
  }

  public getSocket() {
    return this.socket;
  }
}

export const socketService = SocketService.getInstance(); 