const axios = require("axios");
const { BACKEND_URL } = require("../config/env");

const authenticateUser = async (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token) {
    return next(new Error("Authentication failed: No token"));
  }

  try {
    const response = await axios.get(`${BACKEND_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    socket.user = response.data.user;
    socket.user.token = token;
    next();
  } catch (error) {
    console.log(error);
    next(new Error("Authentication failed: Invalid token"));
  }
};

module.exports = { authenticateUser };
