import { Link } from 'react-router-dom';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { useToast } from '@/contexts/ToastContext';
import type { Job } from '@/types';

/* ── Pastel accent mapping by category ─────────────────────── */
const CATEGORY_PASTELS: Record<string, { bg: string; tag: string }> = {
  design:      { bg: '#FBE0CE', tag: '#f7c5a8' }, // peach
  engineering: { bg: '#D4F4E9', tag: '#a5e6ca' }, // mint
  product:     { bg: '#E5DDF9', tag: '#c9baf5' }, // lavender
  sales:       { bg: '#DDF1FC', tag: '#a7dcf5' }, // blue
  marketing:   { bg: '#F8DDF0', tag: '#f2b8e2' }, // pink
};
const DEFAULT_PASTEL = { bg: '#E9EDF2', tag: '#d1d6de' }; // cool grey

function getPastel(category: string) {
  const key = category.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_PASTELS)) {
    if (key.includes(k)) return v;
  }
  return DEFAULT_PASTEL;
}

const JOB_TYPE_LABEL: Record<Job['type'], string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT:  'Contract',
  INTERNSHIP:'Internship',
};

function formatSalary(job: Job): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const sym = job.currency === 'INR' ? '₹' : '$';
  const fmt = (n: number) =>
    job.currency === 'INR'
      ? `${sym}${(n / 100000).toFixed(0)}L`
      : `${sym}${Math.round(n / 1000)}k`;
  if (job.salaryMin && job.salaryMax) return `${fmt(job.salaryMin)} – ${fmt(job.salaryMax)}`;
  if (job.salaryMin) return `From ${fmt(job.salaryMin)}`;
  return `Up to ${fmt(job.salaryMax!)}`;
}

function formatRelative(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const days  = Math.floor(diff / 86_400_000);
  if (days === 0)  return 'Today';
  if (days === 1)  return '1 day ago';
  if (days < 7)   return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4)  return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function JobCard({ job }: { job: Job }) {
  const { toggle, isSaved } = useSavedJobsStore();
  const { toast }           = useToast();
  const saved               = isSaved(job.id);
  const pastel              = getPastel(job.category);
  const salary              = formatSalary(job);

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(job.id);
    toast(saved ? 'Removed from saved' : 'Job saved!', 'success');
  };

  return (
    /* Outer white card */
    <div className="bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between border border-[#d9dce1] hover:border-[#171819] group">

      {/* ── Pastel header panel ─────────────────────────────── */}
      <Link to={`/jobs/${job.id}`} className="block">
        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ backgroundColor: pastel.bg }}
        >
          {/* Top row: timestamp + bookmark */}
          <div className="flex items-start justify-between">
            <span className="px-2.5 py-1 rounded-full bg-white/70 text-[11px] font-semibold text-[#181c21] tracking-wide">
              {formatRelative(job.createdAt)}
            </span>
            <button
              type="button"
              onClick={handleSave}
              aria-label={saved ? 'Remove from saved' : 'Save job'}
              aria-pressed={saved}
              className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#181c21] transition-colors"
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={{ fontVariationSettings: saved ? "'FILL' 1" : "'FILL' 0" }}
              >
                bookmark
              </span>
            </button>
          </div>

          {/* Company logo + name + title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-[16px] font-bold text-[#181c21] shrink-0">
              {job.company.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[12px] font-semibold text-[#75777a] truncate">{job.company}</span>
              <h3 className="text-[18px] font-semibold leading-6 text-[#181c21] tracking-tight truncate group-hover:text-[#006780] transition-colors">
                {job.title}
              </h3>
            </div>
          </div>

          {/* Type / category tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[#181c21] text-[11px] font-semibold tracking-wide">
              {JOB_TYPE_LABEL[job.type]}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-[#181c21] text-[11px] font-semibold tracking-wide">
              {job.category}
            </span>
          </div>
        </div>
      </Link>

      {/* ── Footer: salary + location + CTA ─────────────────── */}
      <Link to={`/jobs/${job.id}`} className="block pt-4 px-1 flex items-center justify-between gap-2">
        <div className="flex flex-col min-w-0">
          {salary ? (
            <span className="text-[14px] font-bold text-[#181c21]">
              {salary}
              <span className="text-[12px] font-normal text-[#75777a]"> /yr</span>
            </span>
          ) : (
            <span className="text-[12px] text-[#75777a]">Salary not disclosed</span>
          )}
          <span className="text-[12px] text-[#75777a] flex items-center gap-1 truncate">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {job.location}
          </span>
        </div>
        <button
          type="button"
          className="shrink-0 px-4 py-2 bg-[#171819] hover:bg-[#252629] text-white text-[12px] font-semibold rounded-xl transition-colors active:scale-95"
        >
          Details
        </button>
      </Link>
    </div>
  );
}