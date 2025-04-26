const axios = require("axios");

const { authenticateUser } = require("../middlewares/auth.middleware");
const { checkPermission } = require("../middlewares/permission.middleware");
const {
  addUserToRoom,
  getActiveUsersCount,
  removeUserFromAllRooms,
  removeUserFromRoom,
} = require("../socket/users.handler");
const { BACKEND_URL } = require("../config/env");

const ROOM_STATE = {};

const setupSocket = (io) => {
  io.use(authenticateUser);

  io.on("connection", (socket) => {
    socket.on("join-room", async ({ roomId }) => {
      const permission = await checkPermission(socket.user.token, roomId);
      if (!permission) {
        return socket.emit("error", "Permission Denied");
      }

      socket.join(roomId);
      socket.permission = permission;

      if (ROOM_STATE[roomId] === undefined) {
        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/code/${roomId}`,
            { headers: { Authorization: `Bearer ${socket.user.token}` } }
          );

          ROOM_STATE[roomId] = {
            code: response.data.code || "",
            language: response.data.language || "cpp",
            isSaved: true,
          };
        } catch (error) {
          ROOM_STATE[roomId] = { code: null, isSaved: false };
        }
      }

      socket.emit("permission-update", { permission: socket.permission });
      socket.emit("language-update", { language: ROOM_STATE[roomId].language });
      socket.emit("code-update", ROOM_STATE[roomId].code);

      addUserToRoom(roomId, socket.id);
      io.to(roomId).emit("active-users", {
        count: getActiveUsersCount(roomId),
      });

      console.log(
        `${socket.user.email} joined room: ${roomId} with permission ${permission}`
      );
    });

    // -- -- FUNCTION TO HANDLE CODE CHANGE -- --
    socket.on("code-change", ({ roomId, code }) => {
      if (socket.permission !== "write") {
        return socket.emit("error", "Permission Denied");
      }

      if (code === "" && ROOM_STATE[roomId]?.code !== "") return;

      ROOM_STATE[roomId].code = code;
      ROOM_STATE[roomId].isSaved = false;

      socket.to(roomId).emit("code-update", code);
    });

    // -- -- FUNCTION TO SAVE CODE -- --
    socket.on("save-code", async ({ roomId }) => {
      const roomData = ROOM_STATE[roomId];
      if (!roomData) {
        return socket.emit("save-error", "Room Not Found");
      }

      if (socket.permission !== "write") {
        return socket.emit("error", "Permission Denied");
      }

      if (roomData.isSaved) {
        return socket.emit("code-saved");
      }

      try {
        await axios.put(
          `${BACKEND_URL}/api/code/${roomId}/save`,
          { code_input: roomData.code },
          { headers: { Authorization: `Bearer ${socket.user.token}` } }
        );

        roomData.isSaved = true;
        io.to(roomId).emit("code-saved");

        console.log(`DEBUG: Code saved for room ${roomId}`);
      } catch (error) {
        console.log("error saving code");
        socket.emit("error", "Failed to save code");
      }
    });

    // -- FUNCTION TO HANDLE LEAVE -- --
    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      const count = getActiveUsersCount(roomId);
      if (count == 0 && ROOM_STATE[roomId]?.isSaved) {
        delete ROOM_STATE[roomId];
      }

      io.to(roomId).emit("active-users", { count });
    });

    // -- -- FUNCTION TO SEND CHAT MESSAGES -- --
    socket.on("send-message", ({ roomId, message }) => {
      const username = socket.user.email.split("@")[0];
      io.to(roomId).emit("send-message", {
        username,
        message,
        time: new Date().toISOString(),
      });
    });

    socket.on("disconnect", () => {
      removeUserFromAllRooms(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
