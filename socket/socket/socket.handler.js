const axios = require("axios");
const { authenticateUser } = require("../middlewares/auth.middleware");
const { transform } = require("../util/ot");

const ROOM_STATE = {};
const BACKEND_URL = process.env.BACKEND_URL;

const setupSocket = (io) => {
  io.use(authenticateUser);

  io.on("connection", (socket) => {
    socket.on("join-room", async (roomId) => {
      socket.join(roomId);

      const response = await axios.get(`${BACKEND_URL}/api/code/${roomId}`, {
        headers: { Authorization: `Bearer ${socket.user.token}` },
      });

      if (ROOM_STATE[roomId] === undefined) {
        ROOM_STATE[roomId] = {
          code: response.data.code || "",
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

    socket.on("send-message", ({ roomId, message }) => {
      const username = socket.user.email.split("@")[0];
      io.to(roomId).emit("message", {
        sender: username,
        message,
        timestamp: new Date().toISOString(),
      });
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
