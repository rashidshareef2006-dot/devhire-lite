import { Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { useToast } from '@/contexts/ToastContext';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
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
    <article className="animate-fade-up bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-md hover:border-indeed-blue dark:hover:border-indigo-400 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-lg text-indeed-ink dark:text-white truncate">
            {job.title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 truncate">
            {job.company} · 📍 {job.location}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            aria-label={saved ? 'Remove from saved' : 'Save job'}
            aria-pressed={saved}
            className="text-xl transition hover:scale-110 active:scale-95"
            type="button"
          >
            {saved ? '❤️' : '🤍'}
          </button>
          <Badge variant="info">{job.type}</Badge>
        </div>
      </div>

      <ul className="flex flex-wrap gap-2 mt-4">
        {job.tags.map((tag) => (
          <li key={tag}>
            <Badge>{tag}</Badge>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mt-5 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Posted {job.posted}</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">{job.salary}</span>
      </div>

      <Link
        to={`/jobs/${job.id}`}
        className="mt-5 block text-center px-4 py-2 rounded-xl bg-indeed-blue text-white text-sm font-semibold hover:bg-indeed-hover transition"
      >
        View Details
      </Link>
    </article>
  );
}