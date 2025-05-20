const { transformOp } = require("../util/ot");

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
        initialCode: ROOM_STATE[roomId].code,
        version: ROOM_STATE[roomId].version,
      });

      console.log(`${socket.id} joined room: ${roomId} with permission`);
    });

    socket.on("code-change", ({ id: roomId, operation }) => {
      // console.log("hello")

      const room = ROOM_STATE[roomId];
      if (!room) return;

      const incomingVersion = operation.version;
      const serverVersion = room.version;

      const relevantOps = room.history.filter(
        (op) => op.version > incomingVersion
      );

      const transformedOp = transformOp(operation.change, relevantOps);

      if (incomingVersion <= serverVersion) {
        return;
      }

      const { rangeOffset, rangeLength = 0, text } = transformedOp;

      const before = room.code.slice(0, rangeOffset);
      const after = room.code.slice(rangeOffset + rangeLength);
      room.code = before + text + after;

      room.version++;
      operation.version = room.version;
      operation.change = transformedOp;

      room.history.push(operation);
      io.to(roomId).emit("remote-change", { operation });
    });
  });
};

module.exports = { setupSocket };
