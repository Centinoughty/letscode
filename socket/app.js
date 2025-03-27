const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { setupSocket } = require("./socket");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

setupSocket(io);

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
