import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  headers: Request["headers"] & {
    "x-user-id"?: string;
  };
}
