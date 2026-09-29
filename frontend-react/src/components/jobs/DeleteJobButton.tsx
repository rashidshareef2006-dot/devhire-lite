import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { jobsService } from '@/services/jobs.service';

interface Props {
  jobId: string;
  jobTitle: string;
  onDeleted?: (id: string) => void;
}

export function DeleteJobButton({ jobId, jobTitle, onDeleted }: Props) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await jobsService.deleteJob(jobId);
      setOpen(false);
      onDeleted?.(jobId);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Delete job"
        aria-label="Delete job"
        className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Delete this job?
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              <strong className="text-slate-900 dark:text-white">{jobTitle}</strong>{' '}
              permanently delete ho jayegi. Saath me iske saare{' '}
              <strong>applications</strong> aur <strong>saved marks</strong> bhi hat
              jayenge. Ye undo nahi ho sakta.
            </p>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition disabled:opacity-50 flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}