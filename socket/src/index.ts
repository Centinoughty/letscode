import { initializeSocketServer } from "./server";

const { httpServer } = initializeSocketServer();

process.on("SIGTERM", () => {
  console.log("SIGTERM recieved, shutting down");
  httpServer.close(() => {
    console.log("Socket server closed");
    process.exit(0);
  });
});
