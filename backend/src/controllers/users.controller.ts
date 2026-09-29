import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';

// ─── Validation ───
const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name too short').max(80).optional(),
  phone: z.string().trim().max(20).optional().nullable(),
  bio: z.string().trim().max(500).optional().nullable(),
  location: z.string().trim().max(100).optional().nullable(),
  headline: z.string().trim().max(120).optional().nullable(),
  company: z.string().trim().max(120).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(40)).max(30).optional(),
  website: z.string().trim().max(200).optional().nullable(),
  linkedin: z.string().trim().max(200).optional().nullable(),
  github: z.string().trim().max(200).optional().nullable(),
  resumeUrl: z.string().trim().max(500).optional().nullable(),
});

// ─── Shared select ───
const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  avatar: true,
  bio: true,
  location: true,
  company: true,
  phone: true,
  headline: true,
  skills: true,
  website: true,
  linkedin: true,
  github: true,
  resumeUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

// ─── GET /api/users/profile ───
export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id ?? (req as any).userId;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: USER_SELECT,
    });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/users/profile ───
export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.id ?? (req as any).userId;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');

    const data = updateProfileSchema.parse(req.body);

    // Convert '' → null (so optional text fields clear properly)
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === undefined) continue;
      if (typeof v === 'string' && v === '') {
        cleaned[k] = null;
        continue;
      }
      cleaned[k] = v;
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: cleaned,
      select: USER_SELECT,
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/users/avatar ───
export async function uploadAvatarHandler(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = req.user?.id ?? (req as any).userId;
    if (!userId) throw new AppError(401, 'UNAUTHORIZED', 'Not authenticated');
    if (!req.file) throw new AppError(400, 'NO_FILE', 'No file uploaded');

    const url = `/uploads/avatars/${req.file.filename}`;

    // Best-effort: delete old avatar file from disk
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });
    if (current?.avatar?.startsWith('/uploads/avatars/')) {
      const oldPath = path.resolve(
        'uploads/avatars',
        path.basename(current.avatar),
      );
      fs.promises.unlink(oldPath).catch(() => {
        /* ignore — old file may not exist */
      });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: url },
      select: USER_SELECT,
    });

    res.json(user);
  } catch (err) {
    next(err);
  }
}