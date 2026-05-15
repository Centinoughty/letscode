import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";

export function roomHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on("room:join", ({ roomId }: { roomId: string }) => {
    if (!socket.user) return;

    socket.join(roomId);

    roomManager.joinRoom(roomId, {
      socketId: socket.id,
      name: socket.user.name,
      email: socket.user.email,
      avatar: socket.user.avatar,
    });

    io.to(roomId).emit("room:user_join", {
      socketId: socket.id,
      name: socket.user.name,
    });
  });

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
