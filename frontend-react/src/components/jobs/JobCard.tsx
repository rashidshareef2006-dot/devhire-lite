import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { MotionCard } from '@/components/common/MotionCard';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { useToast } from '@/contexts/ToastContext';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
  index?: number;
}

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
  if (days === 1) return '1d ago';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

export function JobCard({ job, index = 0 }: JobCardProps) {
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
    <MotionCard index={index}>
      <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indeed-blue dark:hover:border-indigo-400 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg text-indeed-ink dark:text-white truncate">
              {job.title}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">
              {job.company} · 📍 {job.location}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSave}
              aria-label={saved ? 'Remove from saved' : 'Save job'}
              aria-pressed={saved}
              className="text-xl transition hover:scale-110 active:scale-95"
              type="button"
            >
              {saved ? '❤️' : '🤍'}
            </button>
            <Badge variant="info">{JOB_TYPE_LABEL[job.type]}</Badge>
          </div>
        </div>

        <ul className="flex flex-wrap gap-2 mt-4">
          <li>
            <Badge>{job.category}</Badge>
          </li>
        </ul>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 line-clamp-2">
          {job.description}
        </p>

        <div className="flex items-center justify-between mt-5 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            Posted {formatRelative(job.createdAt)}
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {formatSalary(job)}
          </span>
        </div>

        <Link
          to={`/jobs/${job.id}`}
          className="mt-5 block text-center px-4 py-2 rounded-xl bg-indeed-blue text-white text-sm font-semibold hover:bg-indeed-hover transition"
        >
          View Details
        </Link>
      </article>
    </MotionCard>
  );
}