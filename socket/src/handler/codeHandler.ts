import { Server, Socket } from "socket.io";
import { RoomManager } from "../managers/roomManager";
import { Operation } from "../types/operation";

export function codeHandler(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
) {
  socket.on("operation", (operation: Operation) => {
    const result = roomManager.applyOperation(operation);

    if (!result) return;

    socket.to(operation.roomId).emit("operation", result.operation);

    socket.emit("operation:ack", {
      id: operation.id,
      revision: result.room.document.revision,
    });
  });
}
