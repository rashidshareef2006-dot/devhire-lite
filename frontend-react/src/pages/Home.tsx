import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Briefcase, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/types';

const features = [
  {
    icon: '📝',
    title: 'Post a Job',
    desc: 'Get started with a job post. Reach 20.1M unique monthly users.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: '🔍',
    title: 'Find Quality Applicants',
    desc: 'Customise your post with screening tools to narrow down candidates.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: '💬',
    title: 'Make Connections',
    desc: 'Track, message, invite and interview directly on DevHire Lite.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: '✅',
    title: 'Hire Confidently',
    desc: 'Helpful resources for every step of the hiring process.',
    color: 'from-green-500 to-emerald-500',
  },
];

const stats = [
  { icon: Users, value: '20.1M+', label: 'Monthly Users' },
  { icon: Briefcase, value: '250M+', label: 'Resumes' },
  { icon: TrendingUp, value: '98%', label: 'Success Rate' },
  { icon: Award, value: '10K+', label: 'Companies' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
};

export function Home() {
  const [featured, setFeatured] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    jobsService
      .list({ limit: 6 })
      .then(({ jobs }) => {
        if (!cancelled) setFeatured(jobs);
      })
      .catch(() => {
        if (!cancelled) setFeatured([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-slate-950">
        {/* Background image (subtle) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80')",
            opacity: 0.35,
          }}
        />

        {/* Dark gradient overlay — makes text readable */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/85 to-blue-950/70" />

        {/* Mesh gradient on top */}
        <div className="absolute inset-0 bg-mesh-gradient opacity-50" />

        {/* Floating blobs */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-500/25 rounded-full blur-3xl animate-float" />
        <div
          className="absolute top-40 -right-20 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-20 left-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: '4s' }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl">
            {/* Badge */}
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-blue-100 mb-6">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                Hiring is live — 6 new jobs today
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Let's hire your next{' '}
              <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                great developer
              </span>
              . Fast.
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={fadeUp}
              custom={2}
              className="mt-6 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl"
            >
              No matter the skills, experience or qualifications you're looking for,
              you'll find the right people here.
            </motion.p>

            {/* Glass Search Bar */}
            <motion.div
              variants={fadeUp}
              custom={3}
              className="mt-8 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl shadow-blue-500/10 flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="flex items-center gap-2 flex-1 px-3">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, skill or company"
                  className="w-full py-3 bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm"
                />
              </div>
              <div className="hidden sm:block w-px bg-white/20 my-2" />
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Location"
                  className="w-full py-3 bg-transparent text-white placeholder:text-slate-400 focus:outline-none text-sm"
                />
              </div>
              <Link
                to="/jobs"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/40 transition-all btn-shimmer text-center"
              >
                Search
              </Link>
            </motion.div>

            {/* Small stats */}
            <motion.div variants={fadeUp} custom={4} className="mt-6 flex flex-wrap gap-6">
              {[
                { v: '20.1M+', l: 'users' },
                { v: '250M+', l: 'resumes' },
                { v: '4.8★', l: 'rating' },
              ].map((s) => (
                <div key={s.l} className="flex items-center gap-2">
                  <span className="text-xl font-bold text-white">{s.v}</span>
                  <span className="text-sm text-slate-400">{s.l}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {s.value}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="bg-slate-50 dark:bg-slate-950 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              Manage your hiring from start to finish
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Everything you need to find, attract, and hire the best developers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group relative p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-transparent hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                />
                <div
                  className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-2xl mb-5 shadow-lg`}
                >
                  {f.icon}
                </div>
                <h3 className="relative text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="relative text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED JOBS ═══════════ */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Fresh Opportunities
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
                Featured Jobs
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Latest openings from top companies
              </p>
            </div>
            <Link
              to="/jobs"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-slate-100 dark:bg-slate-800 rounded-3xl p-6 h-52"
                />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((job, i) => (
                <JobCard key={job.id} job={job} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <p className="text-5xl mb-3">📭</p>
              <p className="text-slate-600 dark:text-slate-400">
                No jobs yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight"
          >
            Ready to find your next great developer?
          </motion.h2>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl mx-auto">
            Join thousands of companies already hiring on DevHire Lite.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:bg-blue-50 transition-all shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5"
          >
            Get Started for Free <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}