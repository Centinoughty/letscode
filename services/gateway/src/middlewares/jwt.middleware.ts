import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface GatewayUser {
  userId: string;
}

export interface GatewayRequest extends Request {
  user?: GatewayUser;
}

export function jwtAuthorization(
  req: GatewayRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (payload.userId) {
      req.user = { userId: payload.userId };
    }
  } catch (error) {}

  next();
}
