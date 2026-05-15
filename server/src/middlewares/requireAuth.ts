import { NextFunction, Response } from "express";
import { TypedRequest } from "../types/request";
import { verifyAccessToken } from "../utils/token";

export function requireAuth(
  req: TypedRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.id,
      name: payload.name,
      email: payload.email,
      avatar: payload.avatar,
    };

    next();
  } catch (error) {
    console.log("JWT_MIDDLEWARE_ERROR", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
