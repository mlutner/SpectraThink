import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";

/**
 * Requires authentication and attaches userId to request.
 * ALL data queries must be scoped to this userId.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({
      data: null,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    });
    return;
  }
  // Attach to request for downstream use
  req.auth = { userId };
  next();
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      auth?: { userId: string };
    }
  }
}
