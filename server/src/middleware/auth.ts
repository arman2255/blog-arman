import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
  isAdmin?: boolean;
}

const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader) { res.status(401).json({ msg: "No token provided" }); return; }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT_SECRET not configured");
    const decoded = jwt.verify(token, secret) as { id: string; username: string; isAdmin: boolean };
    req.userId   = decoded.id;
    req.username = decoded.username;
    req.isAdmin  = decoded.isAdmin || false;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid or expired token" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.isAdmin) {
    res.status(403).json({ msg: "Access denied. Admins only." });
    return;
  }
  next();
};

export default authMiddleware;
