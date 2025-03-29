const room = {};

const addUserToRoom = (roomId, socketId) => {
  if (!room[roomId]) {
    room[roomId] = new Set();
  }

  room[roomId].add(socketId);
};

const removeUserFromRoom = (roomId, socketId) => {
  if (room[roomId]) {
    room[roomId].delete(socketId);
    if (room[roomId].size === 0) {
      delete room[roomId];
    }
  }
};

const getActiveUsersCount = (roomId) => {
  return room[roomId] ? room[roomId].size : 0;
};

const removeUserFromAllRooms = (socketId) => {
  Object.keys(room).forEach((roomId) => {
    if (room[roomId].has(socketId)) {
      room[roomId].delete(socketId);
      if (room[roomId].size === 0) {
        delete room[roomId];
      }
    }
  });
};

module.exports = {
  addUserToRoom,
  removeUserFromRoom,
  getActiveUsersCount,
  removeUserFromAllRooms,
};
