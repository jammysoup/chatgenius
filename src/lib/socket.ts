import { Manager, Socket } from "socket.io-client";
import io from "socket.io-client";

// Connect to the same host in production, or localhost in development
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Optional: Add connection status handlers
socket.on("connect", () => {
  console.log("Socket connected!");
});

socket.on("disconnect", () => {
  console.log("Socket disconnected!");
}); 