import { Request } from "express";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AuthenticatedUser {
  user?: AuthUser;
}

export type TypedRequest<
  P = unknown,
  B = unknown,
  Q = unknown,
> = AuthenticatedUser & Request<P, any, B, Q>;
