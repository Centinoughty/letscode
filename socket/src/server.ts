import { createServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";

export function initializeSocketServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  httpServer.listen(env.PORT, () => {
    console.log(`Socket server running on port ${env.PORT}`);
  });

  return { httpServer, io };
}
