export interface User {
  socketId: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Language = "CPP" | "JAVASCRIPT" | "PYTHON" | "TYPESCRIPT";

export interface Room {
  roomId: string;
  language: Language;
  users: Map<string, User>;
  code: string;
}
