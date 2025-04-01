const axios = require("axios");

const { authenticateUser } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middlewares/permission.middleware");
const {
  addUserToRoom,
  getActiveUsersCount,
  removeUserFromRoom,
  removeUserFromAllRooms,
} = require("./users.handler");
const { BACKEND_URL } = require("../config/env");

const ROOM_STATE = {};

const setupSocket = (io) => {
  io.use(authenticateUser);

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId }) => {
      const permission = await checkPermission(socket.user.token, roomId);
      if (!permission) {
        return socket.emit("error", "Permission denied");
      }

      socket.join(roomId);
      socket.permission = permission;

      if (ROOM_STATE[roomId] === undefined) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/code/${roomId}`,
            { headers: { Authorization: `Bearer ${socket.user.token}` } }
          );

          ROOM_STATE[roomId] = response.data.code || "";
        } catch (error) {
          ROOM_STATE[roomId] = null;
        }
      }

      socket.emit("code-update", ROOM_STATE[roomId]);

      addUserToRoom(roomId, socket.id);
      io.to(roomId).emit("active-users", {
        count: getActiveUsersCount(roomId),
      });

      console.log(
        `${socket.user.email} joined room: ${roomId} with permission ${permission}`
      );
      socket.emit("permission-update", { permission });
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      const count = getActiveUsersCount(roomId);
      if (count === 0) {
        delete ROOM_STATE[roomId];
      }

      io.to(roomId).emit("active-users", {
        count,
      });
    });

    socket.on("code-change", ({ roomId, code }) => {
      if (socket.permission !== "write") {
        return socket.emit("error", "Permission denied");
      }

      if (code === "" && ROOM_STATE[roomId] !== "") {
        return;
      }

      ROOM_STATE[roomId] = code;
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("disconnect", () => {
      removeUserFromAllRooms(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
