import jwt, { Secret, SignOptions } from "jsonwebtoken";
import { AuthUser } from "../types/request";
import { env } from "../config/env";

// environment variables
const ACCESS_SECRET: Secret = env.ACCESS_SECRET as Secret;
const ACCESS_EXPIRY: SignOptions["expiresIn"] =
  (env.ACCESS_EXPIRY as SignOptions["expiresIn"]) || "1m";

const REFRESH_SECRET: Secret = env.REFRESH_SECRET as Secret;
const REFRESH_EXPIRY: SignOptions["expiresIn"] =
  (env.REFRESH_EXPIRY as SignOptions["expiresIn"]) || "7d";

const isProd = env.NODE_ENV === "production";

// sign access token
export function signAccessToken(payload: AuthUser) {
  const accessToken = jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRY,
  });

  return accessToken;
}

// sign refresh token
export function signRefreshToken(payload: AuthUser) {
  const refreshToken = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
  });

  return refreshToken;
}

// verify access token
export function verifyAccessToken(token: string): AuthUser {
  return jwt.verify(token, ACCESS_SECRET) as AuthUser;
}

// verify refresh token
export function verifyRefreshToken(token: string): AuthUser {
  return jwt.verify(token, REFRESH_SECRET) as AuthUser;
}

// cookie options
export const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};
