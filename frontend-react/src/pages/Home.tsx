import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { jobsService, type PublicStats } from '@/services/jobs.service';
import type { Job } from '@/types';

const CATEGORIES = [
  { key: 'all',         label: 'All Jobs',    icon: '💼' },
  { key: 'engineering', label: 'Engineering', icon: '⚙️' },
  { key: 'design',      label: 'Design',      icon: '🎨' },
  { key: 'product',     label: 'Product',     icon: '🚀' },
  { key: 'sales',       label: 'Sales',       icon: '📈' },
  { key: 'marketing',   label: 'Marketing',   icon: '📣' },
];

const features = [
  { icon: '📝', title: 'Post a Job',           desc: 'Create a job listing in minutes and reach qualified candidates instantly.' },
  { icon: '🔍', title: 'Find Quality Applicants', desc: 'Browse applications, filter by skills and experience, and shortlist the best.' },
  { icon: '💬', title: 'Make Connections',     desc: 'Track, message, invite and interview directly on DevHire Lite.' },
  { icon: '✅', title: 'Hire Confidently',     desc: 'Role-based dashboards keep every step of your hiring process organised.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: 'easeOut' as const },
  }),
};

export function Home() {
  const [featured, setFeatured] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      jobsService.list({ limit: 6 }).catch(() => ({ jobs: [], pagination: undefined })),
      jobsService.stats().catch(() => null),
    ]).then(([listRes, statsRes]) => {
      if (cancelled) return;
      setFeatured(listRes.jobs);
      setStats(statsRes);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const statsDisplay = [
    { icon: Briefcase, value: stats?.totalJobs ?? 0, label: 'Open Jobs' },
    { icon: Users, value: stats?.totalUsers ?? 0, label: 'Active Users' },
    { icon: TrendingUp, value: stats?.totalApplications ?? 0, label: 'Applications' },
    { icon: Building2, value: stats?.totalCompanies ?? 0, label: 'Companies' },
  ];

  return (
    <div className="bg-page overflow-x-hidden w-full max-w-full">

      {/* ═══════════ HEADLINE + SEARCH ═══════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 pt-8 sm:pt-10 lg:pt-14 pb-5 sm:pb-6">
        <motion.div initial="hidden" animate="visible">
          <motion.span
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] sm:text-[12px] font-bold uppercase tracking-wider"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            {stats && stats.totalJobs > 0
              ? `${stats.totalJobs} open job${stats.totalJobs > 1 ? 's' : ''} live now`
              : 'Hiring is live — be the first'}
          </motion.span>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight text-ink leading-[1.1] text-balance max-w-3xl break-words"
          >
            Find your dream job.{' '}
            <span className="text-brand">Fast.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="mt-4 text-[14px] sm:text-[15px] md:text-base text-ink-soft max-w-2xl"
          >
            Discover top tech roles from elite companies — engineering, design, product and more.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 w-full max-w-3xl"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-mute pointer-events-none" />
              <input
                type="text"
                placeholder="Search jobs, companies, skills..."
                className="input-field pl-12 h-11 sm:h-12 rounded-2xl w-full"
              />
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center justify-center gap-2 px-5 h-11 sm:h-12 rounded-2xl bg-nav text-white text-[13px] sm:text-[14px] font-semibold hover:bg-nav-elev transition-colors shrink-0"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════ PROMO BANNERS ═══════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 pb-8 sm:pb-10">
        <div className="grid gap-3 sm:gap-4 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="promo-gradient rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 text-white shadow-[0_8px_24px_rgba(249,115,22,0.25)] min-w-0"
          >
            <div className="min-w-0">
              <span className="inline-block px-2 sm:px-2.5 py-1 rounded-md bg-white/25 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                New This Week
              </span>
              <h3 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                50+ New Jobs Added
              </h3>
              <p className="mt-1 text-[12px] sm:text-[13px] text-white/85">
                From top companies across India
              </p>
            </div>
            <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] sm:text-[40px] text-white">
                trending_up
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="promo-gradient rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-between gap-3 sm:gap-4 text-white shadow-[0_8px_24px_rgba(249,115,22,0.25)] min-w-0"
          >
            <div className="min-w-0">
              <span className="inline-block px-2 sm:px-2.5 py-1 rounded-md bg-white/25 text-[9px] sm:text-[10px] font-bold tracking-wider uppercase">
                Featured
              </span>
              <h3 className="mt-2 sm:mt-3 text-lg sm:text-xl md:text-2xl font-bold tracking-tight">
                Top Companies Hiring
              </h3>
              <p className="mt-1 text-[12px] sm:text-[13px] text-white/85">
                Curated roles, verified recruiters
              </p>
            </div>
            <div className="shrink-0 w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-[28px] sm:text-[40px] text-white">
                workspace_premium
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ CATEGORY PILLS ═══════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 pb-8 sm:pb-10">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-ink-mute mb-3">
          Browse by category
        </h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.key}
              to={c.key === 'all' ? '/jobs' : `/jobs?category=${c.key}`}
              className={`chip ${i === 0 ? 'chip-active' : ''}`}
            >
              <span>{c.icon}</span>
              {c.label}
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURED JOBS ═══════════ */}
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 pb-12 sm:pb-16">
        <div className="flex items-end justify-between gap-4 mb-5 sm:mb-6">
          <div className="min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-ink flex items-center gap-2 flex-wrap">
              Popular jobs near you
              <span className="text-brand">🔥</span>
            </h2>
            <p className="mt-1 text-[12px] sm:text-[13px] text-ink-mute">
              Latest openings from top companies
            </p>
          </div>
          <Link
            to="/jobs"
            className="hidden sm:inline-flex items-center gap-1 text-[13px] font-semibold text-brand hover:gap-2 transition-all shrink-0"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton h-64 sm:h-72 rounded-2xl" />
            ))}
          </div>
        ) : featured.length > 0 ? (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-3xl border border-dashed border-line-strong">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-ink-soft">No jobs yet. Check back soon!</p>
          </div>
        )}
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section className="bg-surface border-y border-line w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-8 sm:py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {statsDisplay.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center gap-2.5 sm:gap-3 min-w-0"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0">
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5 text-brand" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg sm:text-2xl font-bold text-ink truncate">
                    {s.value.toLocaleString()}
                  </p>
                  <p className="text-[11px] sm:text-[12px] text-ink-mute truncate">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="bg-page py-14 sm:py-20 w-full">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-ink tracking-tight">
              Manage your hiring from start to finish
            </h2>
            <p className="mt-3 sm:mt-4 text-[14px] sm:text-base text-ink-soft">
              Everything you need to find, attract, and hire the best developers.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-surface border border-line hover:border-brand hover:shadow-[0_12px_28px_rgba(249,115,22,0.10)] transition-all duration-300 hover:-translate-y-1 min-w-0"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-brand/10 flex items-center justify-center text-xl sm:text-2xl mb-4 sm:mb-5 group-hover:bg-brand/15 transition-colors">
                  {f.icon}
                </div>
                <h3 className="text-[15px] sm:text-[17px] font-bold text-ink mb-2">{f.title}</h3>
                <p className="text-[12px] sm:text-[13px] text-ink-soft leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative promo-gradient py-14 sm:py-20 overflow-hidden w-full">
        <div className="absolute top-10 right-10 w-40 sm:w-64 h-40 sm:h-64 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-10 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-5 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight"
          >
            Ready to find your next great developer?
          </motion.h2>
          <p className="mt-3 sm:mt-4 text-white/90 text-[15px] sm:text-lg max-w-2xl mx-auto">
            Join a growing community of companies already hiring on DevHire Lite.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-white text-brand font-bold rounded-2xl hover:bg-brand-soft transition-all shadow-2xl hover:-translate-y-0.5 text-[14px] sm:text-base"
          >
            Get Started for Free <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}