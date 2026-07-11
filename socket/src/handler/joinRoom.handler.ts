import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";
import { Language } from "../types/room";

export function roomHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on(
    "room:join",
    async ({ roomId, language }: { roomId: string; language: Language }) => {
      if (!socket.user) return;

      socket.join(roomId);

      const room = await roomManager.joinRoom(roomId, language, {
        socketId: socket.id,
        name: socket.user.name,
        email: socket.user.email,
        avatar: socket.user.avatar,
      });

      const codeToSync = room.document.content;

      socket.emit("code:update", {
        roomId,
        code: codeToSync,
        revision: room.document.revision,
      });

      socket.emit("room:users", {
        users: Array.from(room.users.values()),
      });

      socket.to(roomId).emit("room:user_join", {
        socketId: socket.id,
        name: socket.user.name,
        avatar: socket.user.avatar,
      });
    },
  );

  socket.on("disconnecting", () => {
    void (async () => {
      for (const roomId of socket.rooms) {
        if (roomId === socket.id) continue;

        await roomManager.leaveRoom(roomId, socket.id);

        socket.to(roomId).emit("room:user_leave", {
          socketId: socket.id,
        });
      }
    })();
  });
}
