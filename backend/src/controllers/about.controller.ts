import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

const DEFAULT_ABOUT = {
  id: 'singleton',
  name: 'Rashid Shareef',
  title: 'Full Stack Developer',
  photoUrl: null as string | null,
  location: 'Vaniyambadi, Tamil Nadu',
  email: 'rashidshareef2006@gmail.com',
  bio: `I'm a passionate full-stack developer and final-year Computer Science student who loves building products that solve real problems. DevHire Lite is my flagship project — a modern job portal that connects developers with opportunities through real-time chat, role-based dashboards, and an admin analytics panel. I specialize in React, TypeScript, Node.js, and PostgreSQL, and I'm always chasing the perfect balance between clean code and beautiful UI.`,
  skills: [
    'React 19',
    'TypeScript',
    'JavaScript (ESM)',
    'Vite',
    'Tailwind CSS',
    'React Router',
    'Zustand',
    'Framer Motion',
    'react-hook-form',
    'Zod',
    'Axios',
    'Lucide React',
    'Node.js',
    'Express',
    'PostgreSQL',
    'Neon',
    'Prisma ORM',
    'JWT (Dual Token)',
    'bcryptjs',
    'Socket.IO',
    'Nodemailer',
    'Helmet',
    'CORS',
    'Express Rate Limit',
    'REST APIs',
    'RBAC',
    'Real-time Chat',
    'Service Layer Architecture',
    'Middleware Chain',
    'Error Boundaries',
    'Protected Routes',
    'Admin Dashboard',
    'Data Visualization',
    'Recharts',
    'Vitest',
    'React Testing Library',
    'Git & GitHub',
    'A11y (WCAG)',
    'Responsive Design',
    'Connection Pooling',
  ],
  education: 'B.Sc. Computer Science',
  educationUrl: 'https://www.islamiahcollege.edu.in/',
  socialLinks: [] as { label: string; url: string; icon: string }[],
  projects: [
    {
      name: 'DevHire Lite',
      description:
        'A full-stack job portal with role-based dashboards, real-time chat, job posting, application tracking, and an admin analytics panel.',
      tech: ['React', 'TypeScript', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Socket.IO', 'JWT'],
      url: '',
    },
  ],
};

const updateSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  photoUrl: z.string().optional().nullable(), // local path allowed (/rashi.jpg)
  location: z.string().min(1),
  email: z.string().email(),
  bio: z.string().min(10),
  skills: z.array(z.string()),
  education: z.string().min(2),
  educationUrl: z
    .string()
    .optional()
    .nullable()
    .refine((v) => !v || /^https?:\/\//.test(v), 'Invalid URL'),
  socialLinks: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
        icon: z.string().default('Link'),
      }),
    )
    .default([]),
  projects: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string(),
        tech: z.array(z.string()).default([]),
        url: z.string().optional().default(''),
      }),
    )
    .default([]),
});

// ─── PUBLIC: Get about profile ───
export async function getAbout(_req: Request, res: Response, next: NextFunction) {
  try {
    let about = await prisma.aboutProfile.findUnique({ where: { id: 'singleton' } });

    if (!about) {
      about = await prisma.aboutProfile.create({
        data: DEFAULT_ABOUT as never,
      });
    }

    res.json({ success: true, data: about });
  } catch (err) {
    next(err);
  }
}

// ─── ADMIN: Update about ───
export async function updateAbout(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);

    const about = await prisma.aboutProfile.upsert({
      where: { id: 'singleton' },
      update: data,
      create: { id: 'singleton', ...data } as never,
    });

    res.json({ success: true, data: about });
  } catch (err) {
    next(err);
  }
}