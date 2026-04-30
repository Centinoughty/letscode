import { Request } from "express";

export interface AuthUser {
  user?: {
    id: string;
    email: string;
  };
}

export type TypedRequest<P = unknown, B = unknown, Q = unknown> = AuthUser &
  Request<P, any, B, Q>;
