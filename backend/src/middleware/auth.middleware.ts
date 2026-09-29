import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';
import type { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;        // JWT standard
  id?: string;        // 👈 normalize (runtime pe set karte hain)
  email: string;
  role: Role;
  userId?: string;    // 👈 backward-compat
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(
      new AppError(401, 'UNAUTHORIZED', 'Missing or invalid Authorization header'),
    );
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;

    // 🔑 NORMALIZE: har controller `req.user.id` padh raha hai —
    // JWT me sirf `sub` hai, isliye yahan map kar dete hain.
    req.user = {
      ...payload,
      id:     payload.sub,
      userId: payload.sub,
    };

    next();
  } catch {
    next(new AppError(401, 'TOKEN_INVALID', 'Invalid or expired token'));
  }
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'UNAUTHORIZED', 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'FORBIDDEN', 'Insufficient permissions'));
    }
    next();
  };
}