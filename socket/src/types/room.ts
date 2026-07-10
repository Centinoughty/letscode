import { Operation } from "./operation";

export interface User {
  socketId: string;
  name: string;
  email: string;
  avatar?: string;
}

export type Language = "CPP" | "JAVASCRIPT" | "PYTHON" | "TYPESCRIPT";

export interface Document {
  content: string;
  revision: number;
  history: Operation[];
  hydrated: boolean;
}

export interface Room {
  roomId: string;
  language: Language;
  users: Map<string, User>;

  document: Document;
}
