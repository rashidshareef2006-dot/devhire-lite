import { useEffect, useMemo, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { JobCard } from '@/components/jobs/JobCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { jobsService } from '@/services/jobs.service';
import type { Job, JobType } from '@/types';

const PER_PAGE = 6;

const JOB_TYPE_OPTIONS: { label: string; value: JobType }[] = [
  { label: 'Full-time',  value: 'FULL_TIME' },
  { label: 'Part-time',  value: 'PART_TIME' },
  { label: 'Contract',   value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
];

export function Jobs() {
  const [search, setSearch] = useState('');
  const [types, setTypes]   = useState<JobType[]>([]);
  const [jobs, setJobs]     = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [page, setPage]       = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  useKeyboardShortcut(
    { key: '/', ignoreInputs: true },
    () => {
      const input = document.querySelector<HTMLInputElement>('input[name="search"]');
      input?.focus();
    },
  );
  useKeyboardShortcut({ key: 'Escape' }, () => setSearch(''));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    jobsService
      .list({ q: debouncedSearch || undefined, limit: 50 })
      .then(({ jobs }) => { if (!cancelled) setJobs(jobs); })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.data?.error?.message ||
            err?.message ||
            'Failed to load jobs';
          setError(msg);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedSearch]);

  const filtered = useMemo(() => {
    if (!types.length) return jobs;
    return jobs.filter((j) => types.includes(j.type));
  }, [jobs, types]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggleType = (t: JobType) => {
    setTypes((arr) => (arr.includes(t) ? arr.filter((x) => x !== t) : [...arr, t]));
    setPage(1);
  };

  const clearAll = () => {
    setSearch('');
    setTypes([]);
    setPage(1);
  };

  const activeFilterCount = types.length;

  return (
    <div className="bg-page min-h-screen w-full max-w-full overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-5 lg:px-8 py-6 sm:py-10 w-full">

        {/* ── Header ── */}
        <div className="mb-6 sm:mb-7">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
            Browse Jobs
          </h1>
          <p className="text-ink-soft mt-2 text-[13px] sm:text-[14px]">
            <span className="font-bold text-brand">{filtered.length}</span> jobs found
          </p>
        </div>

        {/* ── Search + Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 w-full max-w-3xl">
          <div className="relative flex-1 min-w-0">
            <Input
              name="search"
              type="search"
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="h-11 sm:h-12 rounded-2xl"
              aria-label="Search jobs"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center justify-center gap-2 px-5 h-11 sm:h-12 rounded-2xl text-[13px] sm:text-[14px] font-semibold transition-colors shrink-0 ${
              showFilters || activeFilterCount
                ? 'bg-brand text-white hover:bg-brand-hover'
                : 'bg-nav text-white hover:bg-nav-elev'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/25 text-[11px]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Filter panel ── */}
        {showFilters && (
          <div className="mb-6 p-4 sm:p-5 bg-surface rounded-2xl border border-line animate-fade-up w-full max-w-3xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-mute">
                Job Type
              </h2>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-lg text-ink-mute hover:text-ink hover:bg-soft transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_OPTIONS.map((t) => {
                const active = types.includes(t.value);
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => toggleType(t.value)}
                    className={`chip ${active ? 'chip-active' : ''}`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>

            {(search || types.length > 0) && (
              <div className="mt-4 pt-4 border-t border-line">
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-64 sm:h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* ── Error ── */}
        {!loading && error && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-danger/30 max-w-2xl mx-auto">
            <p className="text-5xl mb-3">⚠️</p>
            <h3 className="text-lg font-semibold text-danger">Failed to load jobs</h3>
            <p className="text-ink-soft mt-1">{error}</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        )}

        {/* ── Grid ── */}
        {!loading && !error && pageItems.length > 0 && (
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && pageItems.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-3">🔍</p>
            <h3 className="text-lg font-semibold text-ink">No jobs found</h3>
            <p className="text-ink-soft mt-1">Try changing filters or search terms.</p>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <nav className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-2" aria-label="Pagination">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-9 h-9 rounded-full border border-line-strong text-ink disabled:opacity-40 hover:border-brand hover:text-brand transition-colors"
            >
              ←
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-[13px] font-semibold transition-colors ${
                  p === page
                    ? 'bg-brand text-white'
                    : 'border border-line-strong text-ink hover:border-brand hover:text-brand'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-9 h-9 rounded-full border border-line-strong text-ink disabled:opacity-40 hover:border-brand hover:text-brand transition-colors"
            >
              →
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}