const axios = require("axios");
require("dotenv").config();

const BACKEND_URL = process.env.BACKEND_URL;

const authenticateUser = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication failed: No token"));
  }

  try {
    const response = await axios.get(`${BACKEND_URL}api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    socket.user = response.data.user;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication failed: Invalid token"));
  }
};

module.exports = { authenticateUser };
