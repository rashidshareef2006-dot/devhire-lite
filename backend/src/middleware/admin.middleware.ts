import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './error.middleware.js';

export interface AdminPayload {
  admin: true;
  username: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminPayload;
    }
  }
}

export function authenticateAdmin(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError(401, 'UNAUTHORIZED', 'Missing admin token'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, env.ADMIN_JWT_SECRET) as AdminPayload;
    if (!payload.admin) {
      throw new Error('Not an admin token');
    }
    req.admin = payload;
    next();
  } catch {
    next(new AppError(401, 'TOKEN_INVALID', 'Invalid or expired admin token'));
  }
}