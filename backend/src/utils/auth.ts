import jwt from "jsonwebtoken";
import type { UserRole } from "@prisma/client";

export interface JwtUserPayload {
  id: string;
  role: UserRole;
}

export function signAccessToken(payload: JwtUserPayload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d"
  });
}
