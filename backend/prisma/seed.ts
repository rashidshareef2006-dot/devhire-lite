import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 12);

  const recruiter = await prisma.user.upsert({
    where: { email: 'rashi@test.com' },
    update: {},
    create: {
      name: 'Rashi Sharma',
      email: 'rashi@test.com',
      passwordHash,
      role: 'RECRUITER',
    },
  });

  console.log('✅ Recruiter ready:', recruiter.email);

  const existing = await prisma.job.count();
  if (existing > 0) {
    console.log(`ℹ️  ${existing} jobs already exist — skipping seed`);
    return;
  }

  const sampleJobs = [
    {
      title: 'Frontend Developer',
      company: 'TechNova',
      location: 'Remote',
      type: 'FULL_TIME' as const,
      category: 'Engineering',
      salaryMin: 800000,
      salaryMax: 1200000,
      currency: 'INR',
      description:
        'We are looking for a passionate Frontend Developer to join our growing team. You will build beautiful, performant UIs used by thousands of users.',
      requirements:
        '2+ years experience with React and TypeScript\nStrong understanding of HTML5, CSS3, and modern JS\nExperience with Tailwind CSS',
    },
    {
      title: 'Backend Engineer',
      company: 'DataFlow',
      location: 'Bangalore',
      type: 'FULL_TIME' as const,
      category: 'Engineering',
      salaryMin: 1000000,
      salaryMax: 1600000,
      currency: 'INR',
      description:
        'DataFlow is hiring a Backend Engineer to design and scale APIs. You will work on high-throughput services and caching strategies.',
      requirements:
        '3+ years with Node.js and Express\nStrong SQL skills and PostgreSQL experience\nExperience with Redis and job queues',
    },
    {
      title: 'Full Stack Developer',
      company: 'CloudNine',
      location: 'Hyderabad',
      type: 'FULL_TIME' as const,
      category: 'Engineering',
      salaryMin: 900000,
      salaryMax: 1400000,
      currency: 'INR',
      description:
        'Join CloudNine as a Full Stack Developer and own features from UI to database.',
      requirements:
        'Experience building full-stack apps with React + Node\nComfortable with Prisma ORM and PostgreSQL',
    },
    {
      title: 'React Native Developer',
      company: 'AppWorks',
      location: 'Remote',
      type: 'CONTRACT' as const,
      category: 'Mobile',
      salaryMin: 600000,
      salaryMax: 1000000,
      currency: 'INR',
      description: 'Build cross-platform mobile apps with React Native.',
      requirements:
        '2+ years React Native\nPublished apps on Play Store / App Store',
    },
    {
      title: 'DevOps Engineer',
      company: 'InfraLab',
      location: 'Pune',
      type: 'FULL_TIME' as const,
      category: 'DevOps',
      salaryMin: 1200000,
      salaryMax: 1800000,
      currency: 'INR',
      description: 'Manage cloud infrastructure and CI/CD pipelines.',
      requirements: 'AWS certified\nKubernetes production experience',
    },
    {
      title: 'UI Engineer',
      company: 'PixelCraft',
      location: 'Remote',
      type: 'FULL_TIME' as const,
      category: 'Design',
      salaryMin: 700000,
      salaryMax: 1100000,
      currency: 'INR',
      description: 'Design and build beautiful UI components.',
      requirements: 'Strong CSS skills\nFigma to code conversion',
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.create({
      data: {
        ...job,
        postedById: recruiter.id,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${sampleJobs.length} jobs`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });