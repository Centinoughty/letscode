const { authenticateUser } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middlewares/permission.middleware");
const {
  addUserToRoom,
  getActiveUsersCount,
  removeUserFromRoom,
  removeUserFromAllRooms,
} = require("./users.handler");

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

      io.to(roomId).emit("active-users", {
        count: getActiveUsersCount(roomId),
      });
    });

    socket.on("code-change", ({ roomId, code }) => {
      if (socket.permission !== "write") {
        return socket.emit("error", "Permission denied");
      }

      socket.to(roomId).emit("code-update", code);
    });

    socket.on("disconnect", () => {
      removeUserFromAllRooms(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
