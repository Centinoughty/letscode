import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";
import { Operation } from "../types/operation";

export function codeHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on("operation", (operation: Operation) => {
    const room = roomManager.applyOperation(operation);

    if (!room) return;

    socket.to(operation.roomId).emit("operation", operation);

    socket.emit("operation:ack", {
      id: operation.id,
      revision: room.document.revision,
    });
  });
}
