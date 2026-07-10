import { parse } from "cookie";
import { Socket } from "socket.io";
import { verifyJwtToken } from "../utils/token";

export interface AuthUser {
  name: string;
  email: string;
  avatar?: string;
}

declare module "socket.io" {
  interface Socket {
    user?: AuthUser;
  }
}

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      return next(new Error("Unauthorized"));
    }

    const cookies = parse(rawCookie);
    const token = cookies.accessToken;
    if (!token) {
      return next(new Error("Unauthorized"));
    }

    const decoded = verifyJwtToken(token);
    socket.user = decoded;

    next();
  } catch (error) {
    console.log(error);
    next(new Error("Unauthorized"));
  }
}
