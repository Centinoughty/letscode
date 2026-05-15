import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";

export function chatHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on(
    "chat:message",
    ({ roomId, message }: { roomId: string; message: string }) => {
      const room = roomManager.getOrCreateRoom(roomId);
      const user = room.users.get(socket.id);

      if (!user) return;

      io.to(roomId).emit("chat:message", {
        id: `msg-${Date.now()}`,
        text: message,
        sender: {
          socketId: user.socketId,
          name: user.name,
          avatar: user.avatar,
        },
        timestamp: new Date(),
      });
    },
  );
}
