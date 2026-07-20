import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors.js";
import { verifyToken, type AuthTokenPayload } from "../auth/token.js";

// Augment Express Request with the authenticated user.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

// Rejects requests without a valid Bearer token; attaches req.user otherwise.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }
  const token = header.slice("Bearer ".length).trim();
  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return next(new AppError(401, "Invalid or expired token"));
  }
}

// Restricts a route to the given roles. Must run after requireAuth.
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(403, "You do not have permission to perform this action")
      );
    }
    return next();
  };
}
