import { useEffect, useMemo, useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { jobsService } from '@/services/jobs.service';
import type { Job, JobType } from '@/types';

const PER_PAGE = 6;

const JOB_TYPE_OPTIONS: { label: string; value: JobType }[] = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
];

export function Jobs() {
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<JobType[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  useKeyboardShortcut(
    '/',
    () => {
      const input = document.querySelector<HTMLInputElement>('input[name="search"]');
      input?.focus();
    },
    { ignoreInputs: true },
  );

  useKeyboardShortcut('Escape', () => setSearch(''));

  // Fetch from API
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    jobsService
  .list({ q: debouncedSearch || undefined, limit: 50 })
      .then(({ jobs }) => {
        if (!cancelled) setJobs(jobs);
      })
      .catch((err) => {
        if (!cancelled) {
          const msg =
            err?.response?.data?.error?.message ||
            err?.message ||
            'Failed to load jobs';
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-indeed-ink dark:text-white">
          Browse Jobs
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">
          <span className="font-semibold text-indeed-blue dark:text-indigo-400">
            {filtered.length}
          </span>{' '}
          jobs found
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-2 mb-8">
        <Input
          name="search"
          type="search"
          placeholder="Search by title, company, or location... (press / to focus)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1"
          aria-label="Search jobs"
        />
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sticky top-24">
            <h2 className="font-semibold text-indeed-ink dark:text-white mb-4">Filters</h2>

            <fieldset className="mb-6">
              <legend className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Job Type
              </legend>
              <div className="space-y-2 text-sm">
                {JOB_TYPE_OPTIONS.map((t) => (
                  <label
                    key={t.value}
                    className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={types.includes(t.value)}
                      onChange={() => toggleType(t.value)}
                      className="rounded text-indeed-blue focus:ring-indeed-blue"
                    />
                    <span>{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button variant="outline" size="sm" onClick={clearAll} className="w-full">
              Clear all
            </Button>
          </div>
        </aside>

        <section className="lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing <span className="font-semibold">{pageItems.length}</span> results
            </p>
          </div>

          {loading && (
            <div className="grid gap-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 h-40"
                />
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/50">
              <p className="text-5xl mb-3">⚠️</p>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                Failed to load jobs
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{error}</p>
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

          {!loading && !error && pageItems.length > 0 && (
            <div className="grid gap-4">
              {pageItems.map((job, index) => (
                <JobCard key={job.id} job={job} index={index} />
              ))}
            </div>
          )}

          {!loading && !error && pageItems.length === 0 && (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-indeed-ink dark:text-white">
                No jobs found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Try changing filters or search terms.
              </p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
              <Button
                variant="ghost"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ←
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                →
              </Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}