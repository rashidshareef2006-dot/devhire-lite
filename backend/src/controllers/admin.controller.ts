import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

// ─── LOGIN ───
export async function adminLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const okUser = username === env.ADMIN_USERNAME;
    const okPass = password === env.ADMIN_PASSWORD;
    if (!okUser || !okPass) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid admin credentials');
    }

    const token = jwt.sign(
      { admin: true, username },
      env.ADMIN_JWT_SECRET,
      { expiresIn: '4h' },
    );

    res.json({
      success: true,
      data: { token, username, expiresIn: '4h' },
    });
  } catch (err) {
    next(err);
  }
}

// ─── STATS ───
export async function getAdminStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalJobs,
      totalApplications,
      totalCandidates,
      totalRecruiters,
      activeJobs,
      loginsToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.job.count(),
      prisma.application.count(),
      prisma.user.count({ where: { role: 'CANDIDATE' } }),
      prisma.user.count({ where: { role: 'RECRUITER' } }),
      prisma.job.count({ where: { isActive: true } }),
      prisma.user.count({ where: { lastLoginAt: { gte: dayAgo } } }),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalJobs,
        totalApplications,
        totalCandidates,
        totalRecruiters,
        activeJobs,
        loginsToday,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── USERS ───
export async function getAllUsers(_req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        location: true,
        createdAt: true,
        lastLoginAt: true,
        lastLoginIp: true,
        _count: {
          select: { jobs: true, applications: true, savedJobs: true },
        },
      },
    });
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
}

// ─── JOBS ───
export async function getAllJobs(_req: Request, res: Response, next: NextFunction) {
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: { select: { id: true, name: true, email: true } },
        _count: { select: { applications: true } },
      },
    });
    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
}

// ─── APPLICATIONS ───
export async function getAllApplications(_req: Request, res: Response, next: NextFunction) {
  try {
    const applications = await prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        job: { select: { id: true, title: true, company: true, location: true } },
        candidate: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE USER ───
export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) throw new AppError(404, 'USER_NOT_FOUND', 'User not found');

    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'User deleted' } });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE JOB ───
export async function deleteJobAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Job deleted' } });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE APPLICATION ───
export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await prisma.application.findUnique({ where: { id: req.params.id } });
    if (!app) throw new AppError(404, 'APPLICATION_NOT_FOUND', 'Application not found');

    await prisma.application.delete({ where: { id: req.params.id } });
    res.json({ success: true, data: { message: 'Application deleted' } });
  } catch (err) {
    next(err);
  }
}