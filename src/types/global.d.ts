import { Server } from "socket.io";

declare global {
  var messageControllers: Map<string, Set<ReadableStreamDefaultController>>;
  var io: Server;
}

export {}