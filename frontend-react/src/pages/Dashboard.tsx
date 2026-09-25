import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  FileText,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Inbox,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { applicationsService } from '@/services/applications.service';
import type { Application, Job } from '@/types';

export function Dashboard() {
  const { user } = useAuthStore();
  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Hi, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {isRecruiter
            ? "Here's what's happening with your job posts"
            : "Here's what's happening with your applications"}
        </p>
      </motion.div>

      {isRecruiter ? <RecruiterView /> : <CandidateView />}
    </div>
  );
}

// ═══════════════════════════════════════════
// CANDIDATE VIEW
// ═══════════════════════════════════════════
function CandidateView() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    applicationsService
      .mine()
      .then(setApps)
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: 'Total Applications',
      value: apps.length,
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'In Review',
      value: apps.filter((a) => a.status === 'IN_REVIEW').length,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Interview',
      value: apps.filter((a) => a.status === 'INTERVIEW').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
    {
      label: 'Rejected',
      value: apps.filter((a) => a.status === 'REJECTED').length,
      icon: XCircle,
      color: 'from-red-500 to-pink-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Applications */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            My Applications
          </h2>
          <Link
            to="/jobs"
            className="text-sm font-semibold text-indeed-blue dark:text-indigo-400 hover:underline"
          >
            Browse Jobs →
          </Link>
        </div>

        {apps.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No applications yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Start applying to jobs you're interested in
            </p>
            <Link to="/jobs" className="inline-block mt-5 btn-primary text-sm">
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-left text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-6 py-3 font-medium">Job</th>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Applied</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {apps.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition"
                  >
                    <td className="px-6 py-4">
                      <Link
                        to={`/jobs/${a.jobId}`}
                        className="font-medium text-slate-800 dark:text-slate-200 hover:text-indeed-blue dark:hover:text-indigo-400"
                      >
                        {a.job?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {a.job?.company}
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                      {formatRelative(a.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════
// RECRUITER VIEW
// ═══════════════════════════════════════════
function RecruiterView() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([applicationsService.myJobs(), applicationsService.received()])
      .then(([j, a]) => {
        setJobs(j);
        setApps(a);
      })
      .catch(() => {
        setJobs([]);
        setApps([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const totalApps = jobs.reduce((sum, j) => sum + (j._count?.applications || 0), 0);

  const stats = [
    {
      label: 'Posted Jobs',
      value: jobs.length,
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: 'Total Applications',
      value: totalApps,
      icon: FileText,
      color: 'from-purple-500 to-pink-500',
    },
    {
      label: 'In Review',
      value: apps.filter((a) => a.status === 'IN_REVIEW').length,
      icon: Clock,
      color: 'from-amber-500 to-orange-500',
    },
    {
      label: 'Interviews',
      value: apps.filter((a) => a.status === 'INTERVIEW').length,
      icon: CheckCircle2,
      color: 'from-green-500 to-emerald-500',
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="skeleton h-28" />
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800"
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3`}
            >
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Received Applications — the important one */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-white">
            Recent Applications
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            People who applied to your jobs
          </p>
        </div>

        {apps.length === 0 ? (
          <div className="py-16 text-center">
            <Inbox className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              No applications yet
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Applications will appear here when candidates apply
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {apps.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition flex items-center gap-4"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                  {a.candidate?.name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm">
                    <span className="text-indeed-blue dark:text-indigo-400">
                      {a.candidate?.name}
                    </span>{' '}
                    applied for{' '}
                    <Link
                      to={`/jobs/${a.jobId}`}
                      className="text-slate-900 dark:text-white hover:underline"
                    >
                      {a.job?.title}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {a.candidate?.email} · {formatRelative(a.createdAt)}
                  </p>
                  {a.coverLetter && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2 italic">
                      "{a.coverLetter}"
                    </p>
                  )}
                </div>

                {/* Status */}
                <div className="hidden sm:block shrink-0">
                  <StatusBadge status={a.status} />
                </div>

                {/* Message button */}
                <button
                  onClick={() => navigate(`/messages?u=${a.candidate?.id}`)}
                  className="shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transition"
                  title={`Message ${a.candidate?.name}`}
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* My Jobs */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-semibold text-slate-900 dark:text-white text-lg">
          Your Job Posts
        </h2>
        <Link
          to="/post-job"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 py-16 text-center">
          <Briefcase className="w-14 h-14 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            You haven't posted any jobs yet
          </p>
          <Link to="/post-job" className="inline-block mt-5 btn-primary text-sm">
            Post Your First Job
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((j) => (
            <div
              key={j.id}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-start gap-4 hover:border-indeed-blue dark:hover:border-indigo-400 transition"
            >
              <div className="min-w-0 flex-1">
                <Link
                  to={`/jobs/${j.id}`}
                  className="font-semibold text-slate-900 dark:text-white hover:text-indeed-blue dark:hover:text-indigo-400"
                >
                  {j.title}
                </Link>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {j.company} · {j.location} · Posted {formatRelative(j.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-indeed-blue dark:text-indigo-400 text-xs font-semibold">
                  {j._count?.applications || 0} applications
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    APPLIED: {
      label: 'Applied',
      cls: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    },
    IN_REVIEW: {
      label: 'In Review',
      cls: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    },
    INTERVIEW: {
      label: 'Interview',
      cls: 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    },
    OFFERED: {
      label: 'Offered',
      cls: 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
    },
    REJECTED: {
      label: 'Rejected',
      cls: 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
    },
  };
  const s = map[status] || map.APPLIED;
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

function formatRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}