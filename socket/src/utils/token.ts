import jwt, { Secret } from "jsonwebtoken";
import { env } from "../config/env";
import { AuthUser } from "../middlewares/socketAuth.middleware";

// environment variables
const JWT_SECRET: Secret = env.JWT_SECRET as Secret;

// verify jwt token
export function verifyJwtToken(token: string): AuthUser {
  return jwt.verify(token, JWT_SECRET) as AuthUser;
}
