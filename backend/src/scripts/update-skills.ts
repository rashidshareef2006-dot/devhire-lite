import { prisma } from '../lib/prisma.js';

const NEW_SKILLS = [
  'React 19', 'TypeScript', 'Vite', 'Tailwind CSS v4', 'React Router',
  'Zustand', 'React Context API', 'react-hook-form', 'Zod', '@hookform/resolvers',
  'Framer Motion', 'Recharts', 'Lucide React', 'React Hooks', 'Custom Hooks',
  'useDebounce', 'useKeyboardShortcut', 'Canvas API', 'FileReader API', 'FormData API',
  'Accessibility (A11y)', 'Keyboard Navigation', 'Focus Management',
  'Node.js', 'Express', 'Socket.IO', 'Multer',
  'PostgreSQL', 'Neon', 'Prisma', 'Prisma Client Singleton', 'Connection Pooling',
  'JWT Authentication', 'bcryptjs', 'RBAC', 'Helmet', 'CORS', 'express-rate-limit',
  'REST API', 'MVC Pattern', 'Service Layer Pattern', 'Middleware Pattern',
  'Centralized Error Handling', 'AppError', 'Pagination', 'Optimistic UI',
  'Protected Routes', 'Error Boundaries', 'Axios Interceptors', 'Path Aliases',
  'Component Composition',
  'Vitest', 'React Testing Library', 'Unit Testing',
  'Environment Variables', 'ESM Modules', 'Monorepo Structure', 'Git', 'npm',
  'Dark Mode', 'Loading Skeletons', 'Toast Notifications', 'Empty States',
  'Responsive Design',
  'Debugging', 'Code Review', 'Performance Optimization', 'Security Awareness',
  'Clean Code',
];

async function main() {
  const updated = await prisma.aboutProfile.update({
    where: { id: 'singleton' },
    data: { skills: NEW_SKILLS },
  });
  console.log(`✅ Updated skills: ${updated.skills.length} items`);
  console.log(updated.skills);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});