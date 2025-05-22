const { authenticateUser } = require("../middlewares/auth.middleware");
const { transform } = require("../util/ot");

const ROOM_STATE = {};

const setupSocket = (io) => {
  io.use(authenticateUser);

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

      socket.emit("init", {
        initialCode: ROOM_STATE[roomId].code,
        version: ROOM_STATE[roomId].version,
      });

      console.log(`${socket.user.email} joined the room ${roomId}`);
    });

    socket.on("code-change", ({ id: roomId, operation }) => {
      const room = ROOM_STATE[roomId];
      if (!room) return;

      const incomingVersion = operation.version;
      const { version: serverVersion, history } = room;

      let transformedOp = { ...operation };
      if (incomingVersion < serverVersion) {
        const missed = history.slice(incomingVersion);
        for (const op of missed) {
          transformedOp = transform(transformedOp, op);
        }
      }

      const before = room.code.slice(0, transformedOp.offset);
      const after = room.code.slice(
        transformedOp.offset + transformedOp.change.rangeLength
      );

      room.code = before + transformedOp.text + after;

      room.version++;
      transformedOp.version = room.version;

      room.history.push(transformedOp);
      io.to(roomId).emit("remote-change", { operation, transformedOp });
    });

    socket.on("leave-room", (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.user.email} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`${socket.user.email} disconnected from room`);
    });
  });
};

module.exports = { setupSocket };
