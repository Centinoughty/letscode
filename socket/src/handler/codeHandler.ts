import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";

export function codeHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on(
    "code:update",
    ({ roomId, code }: { roomId: string; code: string }) => {
      const room = roomManager.getOrCreateRoom(roomId);
      const user = room.users.get(socket.id);

      if (!user) return;

      roomManager.updateCode(roomId, code);

      socket.to(roomId).emit("code:update", {
        roomId,
        code,
      });
    },
  );
}
