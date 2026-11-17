import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthRequest extends Request {
  adminId?: string;
}

export function requireAuth(request: AuthRequest, response: Response, next: NextFunction) {
  const token = request.cookies?.token as string | undefined;
  if (!token) {
    return response.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } });
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload;
    request.adminId = payload.sub as string;
    return next();
  } catch {
    return response.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Invalid or expired session" } });
  }
}
