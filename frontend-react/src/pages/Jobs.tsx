import { useMemo, useState } from 'react';
import { JobCard } from '@/components/jobs/JobCard';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useDebounce } from '@/hooks/useDebounce';
import { mockJobs } from '@/data/mockJobs';

const PER_PAGE = 5;
const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Hybrid'];
const LOCATIONS = ['Remote', 'Bangalore', 'Hyderabad', 'Pune'];

export function Jobs() {
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 300);

  const filtered = useMemo(() => {
    let list = [...mockJobs];

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }
    if (types.length) list = list.filter((j) => types.includes(j.type));
    if (locations.length) list = list.filter((j) => locations.includes(j.location));

    if (sort === 'salary-high') list.sort((a, b) => b.salaryNum - a.salaryNum);
    if (sort === 'salary-low') list.sort((a, b) => a.salaryNum - b.salaryNum);

    return list;
  }, [debouncedSearch, types, locations, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggle = (arr: string[], setter: (v: string[]) => void, value: string) => {
    setter(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
    setPage(1);
  };

  const clearAll = () => {
    setSearch('');
    setTypes([]);
    setLocations([]);
    setSort('recent');
    setPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-indeed-ink">Browse Jobs</h1>
        <p className="text-slate-600 mt-2">
          <span className="font-semibold text-indeed-blue">{filtered.length}</span> jobs found
        </p>
      </div>

      <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-2 mb-8">
        <Input
          name="search"
          type="search"
          placeholder="Search by title, company, or skill..."
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
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-24">
            <h2 className="font-semibold text-indeed-ink mb-4">Filters</h2>

            <fieldset className="mb-6">
              <legend className="text-sm font-semibold text-slate-700 mb-2">Job Type</legend>
              <div className="space-y-2 text-sm">
                {JOB_TYPES.map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={types.includes(t)}
                      onChange={() => toggle(types, setTypes, t)}
                      className="rounded text-indeed-blue focus:ring-indeed-blue"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="mb-6">
              <legend className="text-sm font-semibold text-slate-700 mb-2">Location</legend>
              <div className="space-y-2 text-sm">
                {LOCATIONS.map((l) => (
                  <label key={l} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={locations.includes(l)}
                      onChange={() => toggle(locations, setLocations, l)}
                      className="rounded text-indeed-blue focus:ring-indeed-blue"
                    />
                    <span>{l}</span>
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
            <p className="text-sm text-slate-600">
              Showing <span className="font-semibold">{pageItems.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <label htmlFor="sortBy" className="text-sm text-slate-600">Sort by:</label>
              <select
                id="sortBy"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indeed-blue"
              >
                <option value="recent">Most Recent</option>
                <option value="salary-high">Salary: High to Low</option>
                <option value="salary-low">Salary: Low to High</option>
              </select>
            </div>
          </div>

          {pageItems.length > 0 ? (
            <div className="grid gap-4">
              {pageItems.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-5xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-indeed-ink">No jobs found</h3>
              <p className="text-slate-600 mt-1">Try changing filters or search terms.</p>
            </div>
          )}

          {totalPages > 1 && (
            <nav className="mt-8 flex justify-center gap-2" aria-label="Pagination">
              <Button variant="ghost" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
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
              <Button variant="ghost" size="sm" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                →
              </Button>
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}