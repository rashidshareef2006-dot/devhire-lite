import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error.middleware.js';

const createJobSchema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  category: z.string().min(2),
  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),
  description: z.string().min(20),
  requirements: z.string().min(10),
});

const querySchema = z.object({
  q: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  type: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export async function listJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, category, location, type, page, limit } = querySchema.parse(req.query);
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(q && {
        OR: [
          { title: { contains: q, mode: 'insensitive' as const } },
          { company: { contains: q, mode: 'insensitive' as const } },
          { description: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(category && { category: { equals: category, mode: 'insensitive' as const } }),
      ...(location && { location: { contains: location, mode: 'insensitive' as const } }),
      ...(type && { type: type as never }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          postedBy: { select: { id: true, name: true, company: true } },
          _count: { select: { applications: true } },
        },
      }),
      prisma.job.count({ where }),
    ]);

    res.json({
      success: true,
      data: jobs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        postedBy: { select: { id: true, name: true, company: true, avatar: true } },
        _count: { select: { applications: true } },
      },
    });

    if (!job) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized');

    const data = createJobSchema.parse(req.body);

    // 📸 Uploaded image (if any)
    const imageUrl = req.file ? `/uploads/jobs/${req.file.filename}` : undefined;

    const job = await prisma.job.create({
      data: { ...data, imageUrl, postedById: req.user.sub },
      include: {
        postedBy: { select: { id: true, name: true, company: true } },
      },
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized');

    const existing = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    if (existing.postedById !== req.user.sub && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'You can only edit your own jobs');
    }

    const data = createJobSchema.partial().parse(req.body);
    const updateData: Record<string, unknown> = { ...data };

    // 📸 Replace image only if a new file uploaded
    if (req.file) {
      updateData.imageUrl = `/uploads/jobs/${req.file.filename}`;
    }

    const job = await prisma.job.update({ where: { id: req.params.id }, data: updateData });

    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized');

    const existing = await prisma.job.findUnique({
      where: { id: req.params.id },
      select: { id: true, postedById: true, title: true },
    });
    if (!existing) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not found');

    if (existing.postedById !== req.user.sub && req.user.role !== 'ADMIN') {
      throw new AppError(403, 'FORBIDDEN', 'You can only delete your own jobs');
    }

    await prisma.job.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { id: existing.id, deleted: true } });
  } catch (err) {
    next(err);
  }
}

export async function applyToJob(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) throw new AppError(401, 'UNAUTHORIZED', 'Unauthorized');

    const coverLetter = z
      .object({ coverLetter: z.string().max(2000).optional() })
      .parse(req.body).coverLetter;

    const job = await prisma.job.findUnique({ where: { id: req.params.id } });
    if (!job || !job.isActive) throw new AppError(404, 'JOB_NOT_FOUND', 'Job not available');

    const existing = await prisma.application.findUnique({
      where: { jobId_candidateId: { jobId: job.id, candidateId: req.user.sub } },
    });
    if (existing) throw new AppError(409, 'ALREADY_APPLIED', 'Already applied to this job');

    const application = await prisma.application.create({
      data: { jobId: job.id, candidateId: req.user.sub, coverLetter },
    });

    res.status(201).json({ success: true, data: application });
  } catch (err) {
    next(err);
  }
}

export async function getPublicStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [totalJobs, totalUsers, totalApplications, distinctCompanies] = await Promise.all([
      prisma.job.count({ where: { isActive: true } }),
      prisma.user.count(),
      prisma.application.count(),
      prisma.job.findMany({ distinct: ['company'], select: { company: true } }),
    ]);

    res.json({
      success: true,
      data: {
        totalJobs,
        totalUsers,
        totalApplications,
        totalCompanies: distinctCompanies.length,
      },
    });
  } catch (err) {
    next(err);
  }
}