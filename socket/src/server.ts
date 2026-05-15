import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { MemoryStore } from "./store/memoryStore";
import { RoomManager } from "./managers/roomManager";
import { socketAuth } from "./middlewares/socketAuth.middleware";
import { roomHandler } from "./handler/joinRoom.handler";
import { chatHandler } from "./handler/chat.handler";

export function initializeSocketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
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
  });

  httpServer.listen(env.PORT, () => {
    console.log(`Socket server running on port ${env.PORT}`);
  });

  return { httpServer, io };
}
