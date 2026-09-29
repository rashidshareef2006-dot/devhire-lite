import { Link } from 'react-router-dom';
import { MapPin, Clock, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/common/Badge';
import { MotionCard } from '@/components/common/MotionCard';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { useToast } from '@/contexts/ToastContext';
import type { Job } from '@/types';

const JOB_TYPE_LABEL: Record<Job['type'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
};

function formatSalary(job: Job): string {
  if (!job.salaryMin && !job.salaryMax) return 'Not disclosed';
  const fmt = (n: number) => `₹${(n / 100000).toFixed(1)}L`;
  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
  return `Up to ${fmt(job.salaryMax!)}`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export function JobCard({ job }: { job: Job }) {
  const { toggle, isSaved } = useSavedJobsStore();
  const { toast } = useToast();
  const saved = isSaved(job.id);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(job.id);
    toast(saved ? 'Removed from saved' : '❤️ Job saved!', 'success');
  };

  return (
    <MotionCard>
      <Link
        to={`/jobs/${job.id}`}
        className="block p-5 sm:p-6 hover:border-indeed-blue dark:hover:border-indigo-500 transition-colors group"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title + Company */}
            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-indeed-blue dark:group-hover:text-indigo-400 transition-colors truncate">
              {job.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 truncate">
              {job.company}
            </p>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                {job.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {formatRelative(job.createdAt)}
              </span>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="info">{JOB_TYPE_LABEL[job.type]}</Badge>
              <Badge>{job.category}</Badge>
              <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 self-center">
                💰 {formatSalary(job)}
              </span>
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={saved ? 'Remove from saved' : 'Save job'}
            aria-pressed={saved}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              saved
                ? 'border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-indeed-blue hover:border-indeed-blue dark:hover:text-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            {saved ? (
              <BookmarkCheck className="w-5 h-5" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </Link>
    </MotionCard>
  );
}