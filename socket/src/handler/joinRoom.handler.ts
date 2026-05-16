import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";

export function roomHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on(
    "room:join",
    ({ roomId, content }: { roomId: string; content?: string }) => {
      if (!socket.user) return;

      socket.join(roomId);

      const room = roomManager.joinRoom(roomId, {
        socketId: socket.id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar,
      });

      let codeToSync = room.code;

      // Seed room code from persisted content only when the room has no in-memory code yet.
      if (codeToSync === null) {
        const fallbackCode = content ?? "";

        roomManager.updateCode(roomId, fallbackCode);
        codeToSync = fallbackCode;
      }

      socket.emit("code:update", {
        roomId,
        code: codeToSync,
      });

      io.to(roomId).emit("room:user_join", {
        socketId: socket.id,
        name: socket.user.name,
      });
    },
  );

  socket.on("disconnecting", () => {
    socket.rooms.forEach((roomId) => {
      if (roomId === socket.id) return;

      roomManager.leaveRoom(roomId, socket.id);

      socket.to(roomId).emit("room:user_leave", {
        socketId: socket.id,
      });
    });
  });
}
