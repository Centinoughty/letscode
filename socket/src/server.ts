import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { MemoryStore } from "./store/memoryStore";
import { RoomManager } from "./managers/roomManager";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import { roomHandler } from "./handler/joinRoom.handler";
import { chatHandler } from "./handler/chat.handler";
import { codeHandler } from "./handler/codeHandler";

export function initializeSocketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const store = new MemoryStore();
  const roomManager = new RoomManager(store);

  io.use(socketAuth);

  io.on("connection", (socket) => {
    roomHandler(io, socket, roomManager);
    chatHandler(io, socket, roomManager);
    codeHandler(io, socket, roomManager);
  });

  httpServer.listen(env.PORT, () => {
    console.log(`Socket server running on port ${env.PORT}`);
  });

  return { httpServer, io };
}
