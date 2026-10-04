import { Link } from 'react-router-dom';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { useToast } from '@/contexts/ToastContext';
import type { Job } from '@/types';

/* ═══════════════════════════════════════════════════════════
   Helpers
═══════════════════════════════════════════════════════════ */

function getImageUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http')) return path;         // absolute URL
  if (path.startsWith('/jobs/')) return path;       // public folder — served by Firebase
  const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api')
    .replace(/\/api\/?$/, '');
  return `${API_BASE}${path}`;                      // legacy /uploads/... on backend
}

/* ── Pastel gradient per category ── */
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

function formatSalary(job: Job): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const sym = job.currency === 'INR' ? '₹' : '$';
  const fmt = (n: number) =>
    job.currency === 'INR'
      ? `${sym}${(n / 100000).toFixed(0)}L`
      : `${sym}${Math.round(n / 1000)}k`;
  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `${fmt(job.salaryMin)}+`;
  return `Up to ${fmt(job.salaryMax!)}`;
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7)  return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function isFresh(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 3 * 86_400_000;
}

/* ═══════════════════════════════════════════════════════════
   JobCard
═══════════════════════════════════════════════════════════ */
export function JobCard({ job }: { job: Job }) {
  const { toggle, isSaved } = useSavedJobsStore();
  const { toast } = useToast();
  const saved = isSaved(job.id);
  const pastel = getPastel(job.category);
  const salary = formatSalary(job);
  const fresh = isFresh(job.createdAt);
  const hasImage = !!job.imageUrl;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(job.id);
    toast(saved ? 'Removed from saved' : 'Job saved!', 'success');
  };

  return (
    <div className="group relative w-full bg-surface rounded-2xl overflow-hidden border border-line shadow-[0_2px_6px_rgba(23,24,25,0.04)] hover:shadow-[0_12px_28px_rgba(23,24,25,0.10)] hover:-translate-y-1 hover:border-brand/50 transition-all duration-300">

      <Link
        to={`/jobs/${job.id}`}
        className="absolute inset-0 z-10"
        aria-label={`View ${job.title} at ${job.company}`}
      />

      {/* ── Header visual ── */}
      <div
        className="relative h-32 sm:h-36 p-3 sm:p-4 flex items-end overflow-hidden"
        style={hasImage ? undefined : { background: pastel }}
      >
        {hasImage && (
          <>
            <img
              src={getImageUrl(job.imageUrl!)}
              alt={job.title}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
          </>
        )}

        {fresh && (
          <span className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-success text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
            <span
              className="material-symbols-outlined text-[12px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              bolt
            </span>
            New
          </span>
        )}

        <button
          type="button"
          onClick={handleSave}
          aria-label={saved ? 'Remove from saved' : 'Save job'}
          aria-pressed={saved}
          className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 z-20 p-1.5 sm:p-2 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white text-ink shadow-sm transition-all active:scale-95"
        >
          <span
            className="material-symbols-outlined text-[16px] sm:text-[18px] block"
            style={{
              fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0",
              color: saved ? '#f97316' : undefined,
            }}
          >
            bookmark
          </span>
        </button>

        <div className="relative z-[1] flex items-center gap-2.5 sm:gap-3 w-full min-w-0 pr-20 sm:pr-24">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center text-[15px] sm:text-[18px] font-bold text-ink shadow-md shrink-0">
            {job.company.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span
              className={`text-[11px] sm:text-[12px] font-semibold truncate ${
                hasImage ? 'text-white' : 'text-ink-soft'
              }`}
            >
              {job.company}
            </span>
            <span
              className={`text-[10px] sm:text-[11px] ${
                hasImage ? 'text-white/80' : 'text-ink-mute'
              }`}
            >
              {formatRelative(job.createdAt)}
            </span>
          </div>
        </div>

        <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 px-2 sm:px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-ink text-[10px] font-bold tracking-wide">
          {JOB_TYPE_LABEL[job.type]}
        </span>
      </div>

      {/* ── Body ── */}
      <div className="p-3.5 sm:p-4">
        <h3 className="text-[15px] sm:text-[16px] font-bold leading-6 text-ink tracking-tight line-clamp-2 group-hover:text-brand transition-colors break-words">
          {job.title}
        </h3>

        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-soft text-ink-soft text-[10.5px] sm:text-[11px] font-semibold">
            {job.category}
          </span>
          {job.location && (
            <span className="px-2 py-0.5 rounded-full bg-soft text-ink-soft text-[10.5px] sm:text-[11px] font-semibold truncate max-w-[140px]">
              {job.location}
            </span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-2">
          <div className="flex flex-col min-w-0">
            {salary ? (
              <>
                <span className="text-[14px] sm:text-[15px] font-bold text-ink truncate">
                  {salary}
                </span>
                <span className="text-[10px] text-ink-mute uppercase tracking-wider font-semibold">
                  per year
                </span>
              </>
            ) : (
              <span className="text-[12px] text-ink-mute">Salary undisclosed</span>
            )}
          </div>

          <span className="shrink-0 inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-brand/10 text-brand text-[11px] font-bold group-hover:bg-brand group-hover:text-white transition-colors">
            View
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </span>
        </div>
      </div>
    </div>
  );
}