import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

declare global {
  var socketServer: SocketIOServer | undefined;
}

export function initSocketServer(httpServer: HTTPServer) {
  if (!global.socketServer) {
    global.socketServer = new SocketIOServer(httpServer);
  }
  return global.socketServer;
}