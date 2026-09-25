import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark } from 'lucide-react';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { jobsService } from '@/services/jobs.service';
import { JobCard } from '@/components/jobs/JobCard';
import type { Job } from '@/types';

export function SavedJobs() {
  // Subscribe to savedIds — auto re-render on toggle
  const savedIds = useSavedJobsStore((s) => s.savedIds);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobsService
      .list({ limit: 50 })
      .then(({ jobs }) => setAllJobs(jobs))
      .catch(() => setAllJobs([]))
      .finally(() => setLoading(false));
  }, []);

  // Compute saved jobs whenever savedIds or allJobs changes
  const savedJobs = useMemo(
    () => allJobs.filter((j) => savedIds.includes(j.id)),
    [allJobs, savedIds],
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-slate-50 dark:bg-slate-950">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Saved Jobs
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              {savedJobs.length} job{savedJobs.length !== 1 ? 's' : ''} saved
            </p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton h-52" />
          ))}
        </div>
      ) : savedJobs.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
          <Bookmark className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
            No saved jobs yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
            Tap the 🤍 icon on any job to save it for later
          </p>
          <Link to="/jobs" className="inline-block mt-6 btn-primary">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedJobs.map((job, i) => (
            <JobCard key={job.id} job={job} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}