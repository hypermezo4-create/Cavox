import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

export interface AuthRequest extends Request {
  user?: { id: string; role: UserRole };
}

export function auth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: "JWT secret is not configured" });
  }

  try {
    const payload = jwt.verify(token, secret) as AuthRequest["user"];
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
