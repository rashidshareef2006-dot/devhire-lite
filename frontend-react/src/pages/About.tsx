import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  MapPin,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  GraduationCap,
  Briefcase,
  Code2,
  Loader2,
  AlertCircle,
  Server,
  Rocket,
  Brain,
  Trophy,
  Sparkles,
} from 'lucide-react';
import { aboutService } from '@/services/about.service';
import type { AboutProfile } from '@/types';

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/api\/?$/,
  '',
);

const FALLBACK_PHOTO = '/admin-photo.jpg';

function resolveApiPhoto(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_ORIGIN}${url}`;
}

/* ─────────────────────────────────────────────────────────
   Complete Tech Stack — 107+ skills (from project)
   ───────────────────────────────────────────────────────── */
const TECH_STACK: {
  category: string;
  icon: typeof Code2;
  accent: string;
  count: string;
  groups: { title: string; items: string[] }[];
}[] = [
  {
    category: 'Frontend',
    icon: Code2,
    accent: 'from-blue-500 to-indigo-600',
    count: '40+',
    groups: [
      {
        title: 'Core',
        items: [
          'React 18 — Component architecture',
          'TypeScript — Type safety, generics, interfaces',
          'Vite — Build tool, HMR, fast dev server',
          'JSX / TSX — Declarative UI',
        ],
      },
      {
        title: 'Routing & State',
        items: [
          'React Router DOM v6 — Nested & dynamic routes',
          'Protected Routes — Auth-gated pages',
          'Route Guards by Role — allowedRoles',
          'Zustand — Lightweight state management',
          'Zustand Persist Middleware — localStorage hydration',
          'React Context API — ToastContext, ThemeContext',
          'Custom Hooks — useToast(), useAuthStore()',
        ],
      },
      {
        title: 'Forms & Validation',
        items: [
          'react-hook-form — Form state, isSubmitting',
          'Zod — Schema validation',
          '@hookform/resolvers — Zod + RHF integration',
          'Type inference — z.infer<typeof schema>',
        ],
      },
      {
        title: 'Styling',
        items: [
          'Tailwind CSS v4 — Utility-first CSS',
          'Dark Mode — dark: variants',
          'Responsive Design — sm:, md:, lg: breakpoints',
          'Custom theme tokens — indeed-blue, indeed-ink',
          'CSS Grid & Flexbox — Complex layouts',
          'has-[:checked] — Modern CSS selectors',
          'Gradient backgrounds — bg-gradient-to-r',
        ],
      },
      {
        title: 'UI/UX',
        items: [
          'Framer Motion — Animations, page transitions',
          'Lucide React — Icon library',
          'Skeleton Loaders — animate-pulse',
          'Modal Components — Reusable modals',
          'Toast Notifications — Custom toast system',
          'Loading Spinners — Inline SVG spinners',
          'Optimistic UI — Instant feedback',
          'Error Boundaries — Crash protection',
          'Accessibility — aria-label, aria-pressed, role',
          'Empty States — Nice "not found" pages',
        ],
      },
      {
        title: 'API & Data',
        items: [
          'Axios — HTTP client',
          'Axios Interceptors — Auto token, 401 logout',
          'Error handling — Try/catch with typed errors',
          'Promise cancellation — cancelled flag pattern',
          'Conditional data fetching',
        ],
      },
      {
        title: 'Advanced',
        items: [
          'Path Aliases — @/ → src/',
          'Named Exports Pattern — Consistent imports',
          'Component Composition — Reusable primitives',
          'forwardRef — Ref forwarding',
          'TypeScript Discriminated Unions',
          'Vite Env Variables — import.meta.env.VITE_*',
          'localStorage — Auth persistence',
          'Image fallback cascade — 3-tier with onError',
        ],
      },
    ],
  },
  {
    category: 'Backend',
    icon: Server,
    accent: 'from-emerald-500 to-teal-600',
    count: '32+',
    groups: [
      {
        title: 'Core',
        items: [
          'Node.js — Runtime',
          'Express.js — Web framework',
          'TypeScript (Backend) — Type-safe server',
          'ES Modules — "type": "module", .js extensions',
          'REST API Design — Resource-based endpoints',
          'HTTP Methods — GET, POST, PUT, PATCH, DELETE',
          'HTTP Status Codes — 200, 201, 400, 401, 403, 404, 409, 500',
        ],
      },
      {
        title: 'Database & ORM',
        items: [
          'Prisma ORM — Type-safe DB access',
          'PostgreSQL — Relational DB',
          'Prisma Schema — Models, relations, indexes',
          'Prisma Migrations — Version-controlled schema',
          'Prisma Client — Query builder',
          'Relations — One-to-many, many-to-many',
          'Seed Data — Demo accounts',
          'Neon Serverless Postgres — Cloud DB (Mumbai)',
        ],
      },
      {
        title: 'Auth & Security',
        items: [
          'JWT — Dual token (Access 15m + Refresh 7d)',
          'jsonwebtoken — Token signing/verification',
          'bcryptjs — Password hashing (12 rounds)',
          'Refresh Token Rotation',
          'Auth Middleware — requireAuth',
          'RBAC — requireRole("RECRUITER", "ADMIN")',
          'Role-based access — CANDIDATE / RECRUITER / ADMIN',
          'CORS — Cross-origin config',
          'Environment Variables — .env, secrets',
          'dotenv — Env loading',
          'Input Validation — Zod schemas',
        ],
      },
      {
        title: 'Architecture',
        items: [
          'MVC Pattern — Controllers, routes, models',
          'Service Layer — Business logic separation',
          'Middleware Pattern — Composable handlers',
          'Centralized Error Handling',
          'Custom AppError Class — (status, code, message)',
          'Async/Await — Modern async patterns',
          'Controller → Service → Prisma flow',
        ],
      },
      {
        title: 'Real-time & Files',
        items: [
          'Socket.io — Real-time messaging',
          'WebSockets — Bidirectional communication',
          'Multer — File uploads',
          'Static file serving — /uploads',
          'File validation — MIME type, size limits',
        ],
      },
      {
        title: 'Utilities',
        items: [
          'Zod — Request body validation',
          'Type-safe controllers — Request, Response, NextFunction',
          'Param validation — param.ts helper',
          'Custom middleware — upload, admin, auth',
        ],
      },
    ],
  },
  {
    category: 'DevOps & Deployment',
    icon: Rocket,
    accent: 'from-purple-500 to-pink-600',
    count: '15+',
    groups: [
      {
        title: 'Version Control',
        items: [
          'Git — Version control',
          'GitHub — Repo hosting',
          'Git branching — main, feature branches',
          'Commit conventions — fix(ui), feat:',
        ],
      },
      {
        title: 'Hosting & CI/CD',
        items: [
          'Vercel — Frontend hosting (auto-deploy)',
          'Render — Backend hosting (auto-deploy)',
          'Neon — Postgres cloud',
          'Environment Management — Vercel + Render env vars',
          'CI/CD — Push → auto build → deploy',
          'Production Build — vite build, tsc',
          'SPA Rewrite Rules — vercel.json',
        ],
      },
      {
        title: 'Ops & Config',
        items: [
          'NPM Scripts — dev, build, start',
          'Dependency Management — dev vs prod deps',
          'NPM_CONFIG_PRODUCTION=false — Render devDeps trick',
          'CORS in Prod — CLIENT_URL env var',
        ],
      },
    ],
  },
  {
    category: 'Concepts & Patterns',
    icon: Brain,
    accent: 'from-amber-500 to-orange-600',
    count: '20+',
    groups: [
      {
        title: 'Architecture',
        items: [
          'SPA Architecture — Single Page Application',
          'Component-Based Architecture',
          'Separation of Concerns — Frontend/Backend split',
          'Type Safety Across Stack — Shared types/',
          'Monorepo Structure — backend/ + frontend-react/',
          'Environment-based Config — dev vs prod',
        ],
      },
      {
        title: 'Patterns',
        items: [
          'Graceful Degradation — Fallbacks everywhere',
          'Optimistic Updates — Instant UI feedback',
          'Cancellation Tokens — Prevent memory leaks',
          'Debouncing — Search inputs',
          'Lazy Loading',
          'Code Splitting',
          'Memoization — React.memo, useMemo',
          'Ref Forwarding — forwardRef',
          'Controlled Components — React forms',
          'Uncontrolled Components — RHF register',
          'Error Boundaries — React 18 feature',
          'Hydration — Zustand persist',
          'Race Condition Prevention — cancelled flag',
          'Idempotency — Prevent double-apply',
        ],
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   Top 15 for Resume / Interview
   ───────────────────────────────────────────────────────── */
const RESUME_HIGHLIGHTS = [
  'React + TypeScript — production-grade frontend',
  'Node.js + Express + Prisma — typed backend',
  'PostgreSQL (Neon) — cloud DB',
  'JWT Dual Token Auth — access + refresh rotation',
  'RBAC — 3 roles (Candidate/Recruiter/Admin)',
  'Zustand — modern state management',
  'Tailwind CSS v4 — utility-first styling',
  'Zod + react-hook-form — type-safe validation',
  'Socket.io — real-time messaging',
  'Multer — file uploads',
  'Vercel + Render + Neon — lifetime free deploy',
  'CI/CD — auto-deploy on push',
  'Axios Interceptors — auto token refresh',
  'Framer Motion — animations',
  'Dark mode + Responsive design',
];

function SocialIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes('github')) return <Github className="w-4 h-4" />;
  if (l.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
  if (l.includes('mail') || l.includes('email')) return <Mail className="w-4 h-4" />;
  if (l.includes('web') || l.includes('portfolio')) return <Globe className="w-4 h-4" />;
  return <ExternalLink className="w-4 h-4" />;
}

export function About() {
  const [profile, setProfile] = useState<AboutProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    aboutService
      .get()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.error?.message ||
              err?.message ||
              'Failed to load profile',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!profile) return;
    setImgFailed(false);
    if (profile.photoUrl) {
      setImgSrc(resolveApiPhoto(profile.photoUrl));
    } else {
      setImgSrc(FALLBACK_PHOTO);
    }
  }, [profile]);

  const handleImgError = () => {
    if (imgSrc !== FALLBACK_PHOTO) {
      setImgSrc(FALLBACK_PHOTO);
    } else {
      setImgFailed(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indeed-blue animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {error || 'About page not available'}
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          This profile hasn't been set up yet.
        </p>
      </div>
    );
  }

  const showPhoto = !!imgSrc && !imgFailed;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <div className="shrink-0">
              {showPhoto ? (
                <img
                  src={imgSrc!}
                  alt={profile.name}
                  onError={handleImgError}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-indeed-blue/20"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white text-5xl font-bold ring-4 ring-indeed-blue/20">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-indeed-blue dark:text-indigo-400 font-semibold mt-2 text-lg">
                {profile.title}
              </p>

              <div className="mt-4 flex flex-wrap gap-4 justify-center sm:justify-start text-sm text-slate-600 dark:text-slate-400">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="inline-flex items-center gap-1.5 hover:text-indeed-blue transition"
                  >
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </a>
                )}
              </div>

              {profile.socialLinks?.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2 justify-center sm:justify-start">
                  {profile.socialLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indeed-blue hover:text-white dark:hover:bg-indigo-600 transition text-xs font-semibold"
                    >
                      <SocialIcon label={link.label} />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* BIO */}
        {profile.bio && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indeed-blue" />
              About Me
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </motion.section>
        )}

        {/* SKILLS (short list from API) */}
        {profile.skills?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-indeed-blue" />
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-sm font-semibold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* ═══════════════════════════════════════════════
            COMPLETE TECH STACK — 107+ skills, category-wise
            ═══════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.18 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
        >
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indeed-blue" />
              Complete Tech Stack
            </h2>
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-sm">
              107+ Skills
            </span>
          </div>

          <div className="space-y-10">
            {TECH_STACK.map((cat, catIdx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.05 * catIdx }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.accent} flex items-center justify-center shadow-sm`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {cat.category}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {cat.count} skills
                      </p>
                    </div>
                  </div>

                  {/* Sub-groups */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cat.groups.map((group) => (
                      <div
                        key={group.title}
                        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4"
                      >
                        <h4 className="text-sm font-semibold text-indeed-blue dark:text-indigo-400 mb-3 uppercase tracking-wide">
                          {group.title}
                        </h4>
                        <ul className="space-y-1.5">
                          {group.items.map((item, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-700 dark:text-slate-300 flex gap-2 leading-relaxed"
                            >
                              <span className="text-indeed-blue dark:text-indigo-400 shrink-0 mt-0.5">
                                ▸
                              </span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ═══════════════════════════════════════════════
            PROJECTS
            ═══════════════════════════════════════════════ */}
        {profile.projects?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indeed-blue" />
              Projects
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {profile.projects.map((project, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-indeed-blue dark:hover:border-indigo-500 transition group"
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-indeed-blue dark:group-hover:text-indigo-400 transition">
                    {project.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {project.description}
                  </p>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {project.techStack.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {(project.liveUrl || project.repoUrl) && (
                    <div className="flex gap-3 mt-4 text-xs font-semibold">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-indeed-blue dark:text-indigo-400 hover:underline"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Live Demo
                        </a>
                      )}
                      {project.repoUrl && (
                        <a
                          href={project.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:underline"
                        >
                          <Github className="w-3.5 h-3.5" />
                          Code
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ── Top 15 for Resume / Interview ── */}
            <div className="mt-10 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Resume / Interview ke liye highlight karne wale TOP 15
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Recruiters ke saamne bolne wale points
                  </p>
                </div>
              </div>

              <ol className="grid gap-3 sm:grid-cols-2">
                {RESUME_HIGHLIGHTS.map((item, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: 0.02 * idx }}
                    className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 to-white dark:from-slate-950/50 dark:to-slate-900 hover:border-indeed-blue dark:hover:border-indigo-500 transition-colors"
                  >
                    <span className="shrink-0 w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ol>
            </div>
          </motion.section>
        )}

        {/* EDUCATION */}
        {profile.education && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 mt-6 shadow-sm"
          >
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indeed-blue" />
              Education
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              {profile.educationUrl ? (
                <a
                  href={profile.educationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indeed-blue dark:text-indigo-400 hover:underline"
                >
                  {profile.education}
                </a>
              ) : (
                profile.education
              )}
            </p>
          </motion.section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-8 mt-6 text-white text-center shadow-lg"
        >
          <h2 className="text-2xl font-bold">Let's work together</h2>
          <p className="text-indigo-100 mt-2 text-sm">
            Open to opportunities, collaborations, and interesting conversations.
          </p>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition"
          >
            <Mail className="w-4 h-4" />
            Get in touch
          </a>
        </motion.section>
      </div>
    </div>
  );
}