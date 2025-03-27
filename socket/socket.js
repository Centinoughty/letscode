const { authenticateUser } = require("./auth");

const setupSocket = (io) => {
  io.use(authenticateUser);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, user: ${socket.user.email}`);

    socket.on("join-room", ({ roomId }) => {
      socket.join(roomId);
      console.log(`${socket.user.email} joined room: ${roomId}`);
    });

    socket.on("code-change", ({ roomId, code }) => {
      socket.to(roomId).emit("code-update", code);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
