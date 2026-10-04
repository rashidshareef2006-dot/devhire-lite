import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { applicationsService } from '@/services/applications.service';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/types';
import { Pencil } from 'lucide-react';
import { EditJobModal } from '@/components/jobs/EditJobModal';

const JOB_TYPE_LABEL: Record<Job['type'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

function formatSalary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return 'Salary not disclosed';
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
  return `Up to ${fmt(job.salaryMax!)}`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
}

export function JobDetail() {
  const { id } = useParams<{ id: string }>();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { toggle, isSaved } = useSavedJobsStore();

  useEffect(() => {
    if (!id || !isAuthenticated || user?.role !== 'CANDIDATE') {
      setHasApplied(false);
      return;
    }

    let cancelled = false;
    applicationsService
      .mine()
      .then((applications) => {
        if (!cancelled) {
          setHasApplied(applications.some((application) => application.jobId === id));
        }
      })
      .catch(() => {
        if (!cancelled) setHasApplied(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, user?.role]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    jobsService
      .get(id)
      .then((data) => {
        if (!cancelled) setJob(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.data?.error?.message || err?.message || 'Failed to load job',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="animate-pulse bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-8 h-64" />
        <div className="animate-pulse bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl p-8 h-48" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-bold text-indeed-ink dark:text-white">
          {error || 'Job not found'}
        </h1>
        <Link
          to="/jobs"
          className="inline-block mt-6 px-5 py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          Back to Jobs
        </Link>
      </div>
    );
  }

  const saved = isSaved(job.id);
  const isOwner = user?.id === job.postedById || user?.role === 'ADMIN';
  const isCandidate = user?.role === 'CANDIDATE';

  const handleSaveToggle = () => {
    toggle(job.id);
    toast(saved ? 'Removed from saved' : '❤️ Job saved!', 'success');
  };

  // ✅ Direct apply — no modal, no cover letter
  const handleApplyClick = async () => {
    if (!isAuthenticated) {
      toast('Please login first', 'error');
      return;
    }
    if (user?.role !== 'CANDIDATE') {
      toast('Only candidates can apply to jobs', 'error');
      return;
    }
    if (hasApplied || isApplying) return;

    setIsApplying(true);
    try {
      await jobsService.apply(job.id);
      setHasApplied(true);
      toast('✅ Application submitted successfully!', 'success');
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        'Failed to apply. Try again.';
      toast(msg, 'error');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/jobs"
        className="text-sm text-indeed-blue dark:text-indigo-400 font-medium hover:underline mb-6 inline-block"
      >
        ← Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-indeed-ink dark:text-white">
              {job.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              {job.company} · 📍 {job.location}
            </p>

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
              <Badge variant="info">{JOB_TYPE_LABEL[job.type]}</Badge>
              <Badge>{job.category}</Badge>
              <span>💰 {formatSalary(job)}</span>
              <span>🕒 {formatRelative(job.createdAt)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
            {isOwner ? (
              <button
                onClick={() => setEditOpen(true)}
                type="button"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm bg-indeed-blue text-white hover:bg-indeed-hover transition"
              >
                <Pencil className="w-4 h-4" />
                Edit Job
              </button>
            ) : null}

            <button
              onClick={handleSaveToggle}
              type="button"
              aria-label={saved ? 'Remove from saved' : 'Save job'}
              aria-pressed={saved}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border-2 transition-all ${
                saved
                  ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                  : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indeed-blue hover:text-indeed-blue dark:hover:border-indigo-400 dark:hover:text-indigo-400'
              }`}
            >
              <span className="text-base">{saved ? '❤️' : '🤍'}</span>
              {saved ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>

        {/* Owner note */}
        {isOwner && (
          <div className="mt-4 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Pencil className="w-3.5 h-3.5" />
            You posted this job — recruiters can't apply to their own postings.
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          {/* Description */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-6 sm:p-8 shadow-sm transition-colors">
            <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">
              Job Description
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </section>

          {/* Requirements */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-6 sm:p-8 shadow-sm transition-colors">
            <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">
              Requirements
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.requirements}
            </p>
          </section>
        </div>

        {/* Apply section */}
        {(!isAuthenticated || isCandidate) && (
          <aside className="w-full rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm lg:sticky lg:top-24">
            <h2 className="text-lg font-semibold text-indeed-ink dark:text-white">
              Interested in this role?
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Apply now and get a response within 3 days.
            </p>

            {!isAuthenticated ? (
              <Link
                to="/login"
                className="mt-5 block w-full text-center px-4 py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Login to Apply
              </Link>
            ) : hasApplied ? (
              <button
                type="button"
                disabled
                className="mt-5 w-full px-4 py-3 rounded-xl font-semibold text-sm bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              >
                ✓ Already Applied
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyClick}
                disabled={isApplying}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isApplying ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Applying...
                  </>
                ) : (
                  'Apply Now'
                )}
              </button>
            )}
          </aside>
        )}
      </div>

      {/* Edit Job Modal — sirf owner/ADMIN */}
      {editOpen && isOwner && (
        <EditJobModal
          job={job}
          onClose={() => setEditOpen(false)}
          onUpdated={(updated) => {
            setJob(updated);
            setEditOpen(false);
          }}
        />
      )}
    </div>
  );
}