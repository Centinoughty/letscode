const axios = require("axios");
const Y = require("yjs");

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
        const ydoc = new Y.Doc();

        try {
          const response = await axios.get(
            `${BACKEND_URL}/api/code/${roomId}`,
            { headers: { Authorization: `Bearer ${socket.user.token}` } }
          );

          const initialCode = response.data.code || "";
          const text = ydoc.getText("codetext");

          if (text.length === 0) {
            text.insert(0, initialCode);
          }

          // ydoc.getText("codetext").insert(0, initialCode);

          // ROOM_STATE[roomId] = {
          //   code: response.data.code || "",
          //   isSaved: true,
          // };

          ROOM_STATE[roomId] = {
            ydoc,
            isSaved: true,
          };
        } catch (error) {
          // ROOM_STATE[roomId] = { code: null, isSaved: false };
          ROOM_STATE[roomId] = { code: ydoc, isSaved: false };
        }
      }

      const { ydoc } = ROOM_STATE[roomId];
      const stateUpdate = Y.encodeStateAsUpdate(ydoc);

      // socket.emit("code-update", ROOM_STATE[roomId].code);

      socket.emit("yjs-init", stateUpdate);

      addUserToRoom(roomId, socket.id);
      io.to(roomId).emit("active-users", {
        count: getActiveUsersCount(roomId),
      });

      socket.emit("permission-update", { permission });
      console.log(
        `${socket.user.email} joined room: ${roomId} with permission ${permission}`
      );
    });

    socket.on("yjs-update", ({ roomId, update }) => {
      const room = ROOM_STATE[roomId];
      if (!room) {
        return;
      }

      Y.applyUpdate(room.ydoc, update);
      room.isSaved = false;

      socket.to(roomId).emit("yjs-update", { roomId, update });
    });

    // socket.on("code-change", ({ roomId, code }) => {
    //   if (socket.permission !== "write") {
    //     return socket.emit("error", "Permission denied");
    //   }

    //   if (code === "" && ROOM_STATE[roomId]?.code !== "") {
    //     return;
    //   }

    //   ROOM_STATE[roomId].code = code;
    //   ROOM_STATE[roomId].isSaved = false;

    //   socket.to(roomId).emit("code-update", code);
    // });

    socket.on("save-code", async ({ roomId }) => {
      const roomData = ROOM_STATE[roomId];
      if (!roomData) {
        return socket.emit("save-error", "Room not found");
      }

      // check if user has permission to run code
      if (socket.permission !== "write") {
        return socket.emit("error", "Permission denied");
      }

      if (roomData.isSaved) {
        return socket.emit("code-saved");
      }

      const code = roomData.ydoc.getText("codetext").toString();

      try {
        await axios.put(
          `${BACKEND_URL}/api/code/${roomId}/save`,
          { code_input: code },
          { headers: { Authorization: `Bearer ${socket.user.token}` } }
        );

        roomData.isSaved = true;
        io.to(roomId).emit("code-saved");

        console.log(`DEBUG: code saved for room ${roomId}`);
      } catch (error) {
        console.log("Error saving code", error);
        socket.emit("error", "Failed to save code");
      }
    });

    socket.on("leave-room", ({ roomId }) => {
      socket.leave(roomId);
      removeUserFromRoom(roomId, socket.id);

      const count = getActiveUsersCount(roomId);
      if (count === 0 && ROOM_STATE[roomId]?.isSaved) {
        delete ROOM_STATE[roomId];
      }

      io.to(roomId).emit("active-users", {
        count,
      });
    });

    // CHAT FUNCTION
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
