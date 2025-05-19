const ROOM_STATE = {};

const setupSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", (roomId) => {
      socket.join(roomId);

      if (ROOM_STATE[roomId] === undefined) {
        ROOM_STATE[roomId] = {
          code: "",
          version: 0,
          history: [],
          clients: new Set(),
        };
      }

      ROOM_STATE[roomId].clients.add(socket.id);

      socket.emit("initial-doc", {
        initialCode: "khfgb",
        version: ROOM_STATE[roomId].version,
      });

      console.log(`${socket.id} joined room: ${roomId} with permission`);
    });

    socket.on("code-change", ({ id: roomId, operation }) => {
      const room = ROOM_STATE[roomId];
      if (!room) return;

      const incomingVersion = operation.version;
      const serverVersion = room.version;

      if (incomingVersion <= serverVersion) {
        return;
      }

      const { rangeOffset, rangeLength = 0, text } = operation.change;

      const before = room.code.slice(0, rangeOffset);
      const after = room.code.slice(rangeOffset + rangeLength);
      room.code = before + text + after;

      room.version++;
      operation.version = room.version;

      room.history.push(operation);
      io.to(roomId).emit("remote-change", { operation });
    });
  });
};

module.exports = { setupSocket };
