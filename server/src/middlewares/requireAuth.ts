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
    req.user = { id: payload.id, email: payload.email };

    next();
  } catch (error) {
    console.log("JWT_MIDDLEWARE_ERROR", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
}
