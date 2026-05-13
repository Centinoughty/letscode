export interface User {
  socketId: string;
  name: string;
  avatar?: string;
}

export interface Room {
  roomId: string;
  users: Map<string, User>;
  code: string;
}
