import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';

// ─── Candidate: my applications ───
export async function myApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;

    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
            currency: true,
            salaryMin: true,
            salaryMax: true,
            isActive: true,
          },
        },
      },
    });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

// ─── Recruiter: applications on my posted jobs ───
export async function receivedApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;

    if (req.user!.role !== 'RECRUITER' && req.user!.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'Only recruiters can view received applications');
    }

    const applications = await prisma.application.findMany({
      where: { job: { postedById: userId } },
      orderBy: { createdAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: true,
            location: true,
            type: true,
          },
        },
        candidate: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    res.json({ success: true, data: applications });
  } catch (err) {
    next(err);
  }
}

// ─── Recruiter: my posted jobs ───
export async function myPostedJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.sub;

    const jobs = await prisma.job.findMany({
      where: { postedById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });

    res.json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
}