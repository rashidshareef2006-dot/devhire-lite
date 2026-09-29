import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [editOpen, setEditOpen] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const { toggle, isSaved } = useSavedJobsStore();

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
        <Link to="/jobs" className="inline-block mt-6 btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const saved = isSaved(job.id);
  const isOwner = user?.id === job.postedById || user?.role === 'ADMIN';
  const isRecruiter = user?.role === 'RECRUITER' || user?.role === 'ADMIN';

  const handleSaveToggle = () => {
    toggle(job.id);
    toast(saved ? 'Removed from saved' : '❤️ Job saved!', 'success');
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast('Please login first', 'error');
      return;
    }
    if (user?.role !== 'CANDIDATE') {
      toast('Only candidates can apply to jobs', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    try {
      await jobsService.apply(job.id, coverLetter || undefined);
      toast('✅ Application submitted successfully!', 'success');
      setIsModalOpen(false);
      setCoverLetter('');
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
            ) : (
              !isRecruiter && (
                <Button onClick={handleApplyClick} className="flex-1 sm:flex-none">
                  Apply Now
                </Button>
              )
            )}

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

      {/* Description */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-6 sm:p-8 mt-6 shadow-sm transition-colors">
        <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">
          Job Description
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {job.description}
        </p>
      </section>

      {/* Requirements */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 p-6 sm:p-8 mt-6 shadow-sm transition-colors">
        <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">
          Requirements
        </h2>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {job.requirements}
        </p>
      </section>

      {/* Bottom CTA — sirf candidates ko */}
      {!isOwner && !isRecruiter && (
        <div className="bg-indeed-blue rounded-2xl p-6 sm:p-8 mt-6 text-white text-center">
          <h2 className="text-xl font-bold">Interested in this role?</h2>
          <p className="text-indigo-100 mt-2 text-sm">
            Apply now and get a response within 3 days.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleApplyClick}
              className="px-6 py-3 bg-white text-indeed-blue font-semibold rounded-xl hover:bg-indigo-50 transition"
            >
              Apply Now
            </button>
            <button
              onClick={handleSaveToggle}
              className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition inline-flex items-center justify-center gap-2"
            >
              <span>{saved ? '❤️' : '🤍'}</span>
              {saved ? 'Saved' : 'Save Job'}
            </button>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Apply for this job"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Applying for{' '}
          <strong className="text-slate-900 dark:text-white">{job.title}</strong> at{' '}
          <strong className="text-slate-900 dark:text-white">{job.company}</strong>
        </p>

        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Cover letter (optional)
        </label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={4}
          placeholder="Tell the recruiter why you're a great fit..."
          className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indeed-blue resize-none"
        />

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="flex-1"
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmApply} isLoading={isApplying} className="flex-1">
            Submit Application
          </Button>
        </div>
      </Modal>

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