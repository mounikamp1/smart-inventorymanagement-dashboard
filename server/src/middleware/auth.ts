import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import logger from "../lib/logger";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role: "ADMIN" | "STAFF" };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");
    const decoded = jwt.verify(token, secret) as {
      userId: string;
      email: string;
      role: "ADMIN" | "STAFF";
    };
    req.user = decoded;
    next();
  } catch {
    logger.warn("Invalid token attempt");
    res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

export const requireRole = (roles: ("ADMIN" | "STAFF")[]) =>
  (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "Forbidden: Insufficient permissions" });
      return;
    }
    next();
  };
