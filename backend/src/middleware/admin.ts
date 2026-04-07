import { NextFunction, Response } from "express";
import { AuthRequest } from "./auth";

export function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
}
