import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { applicationsService } from '@/services/applications.service';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/types';
import { Pencil, MapPin, Clock, Wallet, Heart } from 'lucide-react';
import { EditJobModal } from '@/components/jobs/EditJobModal';

/* ── Image URL resolver ── */
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
  .replace(/\/api\/?$/, '');

function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}${path}`;
}

/* ── Pastel gradient per category (fallback) ── */
const CATEGORY_PASTELS: Record<string, string> = {
  design:      'linear-gradient(135deg, #FBE0CE 0%, #F5C9A8 100%)',
  engineering: 'linear-gradient(135deg, #D4F4E9 0%, #A5E6CA 100%)',
  product:     'linear-gradient(135deg, #E5DDF9 0%, #C9BAF5 100%)',
  sales:       'linear-gradient(135deg, #DDF1FC 0%, #A7DCF5 100%)',
  marketing:   'linear-gradient(135deg, #F8DDF0 0%, #F2B8E2 100%)',
};
const DEFAULT_PASTEL = 'linear-gradient(135deg, #E9EDF2 0%, #D1D6DE 100%)';

function getPastel(category: string): string {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_PASTELS)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT_PASTEL;
}

const JOB_TYPE_LABEL: Record<Job['type'], string> = {
  FULL_TIME:  'Full-time',
  PART_TIME:  'Part-time',
  CONTRACT:   'Contract',
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
  const [imageFailed, setImageFailed] = useState(false);

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
      .catch(() => { if (!cancelled) setHasApplied(false); });
    return () => { cancelled = true; };
  }, [id, isAuthenticated, user?.role]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    setImageFailed(false);

    jobsService
      .get(id)
      .then((data) => { if (!cancelled) setJob(data); })
      .catch((err) => {
        if (!cancelled) {
          setError(err?.response?.data?.error?.message || err?.message || 'Failed to load job');
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="bg-page min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
          <div className="skeleton h-56 sm:h-72 w-full rounded-2xl" />
          <div className="skeleton h-40 w-full rounded-2xl" />
          <div className="skeleton h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  /* ── Error state ── */
  if (error || !job) {
    return (
      <div className="bg-page min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-5xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-ink">{error || 'Job not found'}</h1>
          <Link
            to="/jobs"
            className="inline-block mt-6 px-5 py-3 rounded-xl font-semibold text-sm bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  const saved = isSaved(job.id);
  const isOwner = user?.id === job.postedById || user?.role === 'ADMIN';
  const isCandidate = user?.role === 'CANDIDATE';
  const hasImage = !!job.imageUrl && !imageFailed;

  const handleSaveToggle = () => {
    toggle(job.id);
    toast(saved ? 'Removed from saved' : '❤️ Job saved!', 'success');
  };

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
    <div className="bg-page min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">

        <Link
          to="/jobs"
          className="text-sm text-brand font-semibold hover:underline mb-5 sm:mb-6 inline-flex items-center gap-1"
        >
          ← Back to Jobs
        </Link>

        {/* ═══════════ HERO BANNER ═══════════ */}
        <div
          className="relative w-full h-44 sm:h-60 md:h-72 rounded-2xl overflow-hidden mb-5 sm:mb-6"
          style={hasImage ? undefined : { background: getPastel(job.category) }}
        >
          {hasImage ? (
            <>
              <img
                src={getImageUrl(job.imageUrl!)}
                alt={job.title}
                className="w-full h-full object-cover"
                onError={() => setImageFailed(true)}
              />
              {/* Bottom gradient for overlay text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />
              {/* Job type pill on image */}
              <span className="absolute top-3 left-3 sm:top-4 sm:left-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-ink text-[11px] font-bold">
                {JOB_TYPE_LABEL[job.type]}
              </span>
            </>
          ) : (
            /* Fallback: pastel header with large icon */
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-[80px] sm:text-[120px] text-ink/10">
                work
              </span>
            </div>
          )}

          {/* Company logo + name overlay */}
          {hasImage && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl bg-white flex items-center justify-center text-[16px] sm:text-[20px] font-bold text-ink shadow-lg shrink-0">
                {job.company.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-[13px] sm:text-[15px] font-bold truncate drop-shadow-md">
                  {job.company}
                </p>
                <p className="text-white/85 text-[11px] sm:text-[12px] flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{job.location}</span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════ HEADER CARD ═══════════ */}
        <div className="bg-surface rounded-2xl border border-line p-5 sm:p-7 shadow-[0_2px_6px_rgba(23,24,25,0.04)]">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Company row (only shown if no image — otherwise overlay handles it) */}
              {!hasImage && (
                <p className="text-[13px] text-ink-mute mb-1.5 flex items-center gap-1.5">
                  <span className="font-semibold text-ink-soft">{job.company}</span>
                  <span>·</span>
                  <MapPin className="w-3.5 h-3.5 inline" />
                  <span>{job.location}</span>
                </p>
              )}

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-ink break-words">
                {job.title}
              </h1>

              <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4 items-center">
                {!hasImage && <Badge variant="info">{JOB_TYPE_LABEL[job.type]}</Badge>}
                <Badge>{job.category}</Badge>
                <span className="inline-flex items-center gap-1 text-[12.5px] sm:text-[13px] text-ink-soft">
                  <Wallet className="w-3.5 h-3.5" />
                  {formatSalary(job)}
                </span>
                <span className="inline-flex items-center gap-1 text-[12.5px] sm:text-[13px] text-ink-soft">
                  <Clock className="w-3.5 h-3.5" />
                  {formatRelative(job.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              {isOwner && (
                <button
                  onClick={() => setEditOpen(true)}
                  type="button"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] bg-brand text-white hover:bg-brand-hover transition-colors shadow-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Job
                </button>
              )}

              <button
                onClick={handleSaveToggle}
                type="button"
                aria-label={saved ? 'Remove from saved' : 'Save job'}
                aria-pressed={saved}
                className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] border transition-all ${
                  saved
                    ? 'border-brand bg-brand/10 text-brand'
                    : 'border-line-strong text-ink-soft hover:border-brand hover:text-brand'
                }`}
              >
                <Heart className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {isOwner && (
            <div className="mt-4 px-3 py-2 rounded-lg bg-info-soft border border-info/20 text-[12px] text-info flex items-center gap-2">
              <Pencil className="w-3.5 h-3.5 shrink-0" />
              You posted this job — recruiters can't apply to their own postings.
            </div>
          )}
        </div>

        {/* ═══════════ CONTENT GRID ═══════════ */}
        <div className="mt-5 sm:mt-6 grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          <div className="space-y-5 sm:space-y-6 min-w-0">
            <section className="bg-surface rounded-2xl border border-line p-5 sm:p-7 shadow-[0_2px_6px_rgba(23,24,25,0.04)]">
              <h2 className="text-lg sm:text-xl font-bold text-ink mb-3 sm:mb-4">
                Job Description
              </h2>
              <p className="text-ink-soft leading-relaxed whitespace-pre-line text-[14px] sm:text-[15px] break-words">
                {job.description}
              </p>
            </section>

            <section className="bg-surface rounded-2xl border border-line p-5 sm:p-7 shadow-[0_2px_6px_rgba(23,24,25,0.04)]">
              <h2 className="text-lg sm:text-xl font-bold text-ink mb-3 sm:mb-4">
                Requirements
              </h2>
              <p className="text-ink-soft leading-relaxed whitespace-pre-line text-[14px] sm:text-[15px] break-words">
                {job.requirements}
              </p>
            </section>
          </div>

          {/* Apply sidebar */}
          {(!isAuthenticated || isCandidate) && (
            <aside className="w-full rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-[0_2px_6px_rgba(23,24,25,0.04)] lg:sticky lg:top-24">
              <h2 className="text-[16px] sm:text-lg font-bold text-ink">
                Interested in this role?
              </h2>
              <p className="mt-1.5 text-[13px] text-ink-soft">
                Apply now and get a response within 3 days.
              </p>

              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="mt-4 sm:mt-5 block w-full text-center px-4 py-3 rounded-xl font-semibold text-[13px] bg-brand text-white hover:bg-brand-hover transition-colors shadow-[0_4px_12px_rgba(249,115,22,0.25)]"
                >
                  Login to Apply
                </Link>
              ) : hasApplied ? (
                <button
                  type="button"
                  disabled
                  className="mt-4 sm:mt-5 w-full px-4 py-3 rounded-xl font-semibold text-[13px] bg-soft text-ink-mute cursor-not-allowed"
                >
                  ✓ Already Applied
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyClick}
                  disabled={isApplying}
                  className="mt-4 sm:mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-[13px] bg-brand text-white hover:bg-brand-hover transition-colors shadow-[0_4px_12px_rgba(249,115,22,0.25)] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
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
    </div>
  );
}