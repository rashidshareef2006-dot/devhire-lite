import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { useSavedJobsStore } from '@/store/useSavedJobsStore';
import { mockJobs } from '@/data/mockJobs';

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const job = mockJobs.find((j) => j.id === id);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  const { toast } = useToast();
  const { isAuthenticated } = useAuthStore();
  const { toggle, isSaved } = useSavedJobsStore();

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">😕</p>
        <h1 className="text-2xl font-bold text-indeed-ink dark:text-white">Job not found</h1>
        <Link to="/jobs" className="inline-block mt-6 btn-primary">
          Back to Jobs
        </Link>
      </div>
    );
  }

  const saved = isSaved(job.id);

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast('Please login first', 'error');
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmApply = async () => {
    setIsApplying(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsApplying(false);
    setIsModalOpen(false);
    toast('✅ Application submitted successfully!', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/jobs"
        className="text-sm text-indeed-blue dark:text-indigo-400 font-medium hover:underline mb-6 inline-block"
      >
        ← Back to Jobs
      </Link>

      {/* Job Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-indeed-ink dark:text-white">
                {job.title}
              </h1>
              <button
                onClick={() => {
                  toggle(job.id);
                  toast(saved ? 'Removed from saved' : '❤️ Job saved!', 'success');
                }}
                aria-label={saved ? 'Remove from saved' : 'Save job'}
                aria-pressed={saved}
                className="text-2xl transition hover:scale-110 active:scale-95"
                type="button"
              >
                {saved ? '❤️' : '🤍'}
              </button>
            </div>

            <p className="text-slate-600 dark:text-slate-400 mt-2">{job.company}</p>

            <div className="flex flex-wrap gap-3 mt-4 text-sm text-slate-600 dark:text-slate-400">
              <Badge variant="info">{job.type}</Badge>
              <span>📍 {job.location}</span>
              <span>💰 {job.salary}</span>
              <span>🕒 {job.posted}</span>
            </div>
          </div>

          <Button onClick={handleApplyClick} className="w-full sm:w-auto">
            Apply Now
          </Button>
        </div>

        <ul className="flex flex-wrap gap-2 mt-6">
          {job.tags.map((t) => (
            <li key={t}>
              <Badge>{t}</Badge>
            </li>
          ))}
        </ul>
      </div>

      {/* Description */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mt-6 transition-colors">
        <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">
          Job Description
        </h2>
        <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
          {job.description.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Requirements */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 mt-6 transition-colors">
        <h2 className="text-xl font-semibold text-indeed-ink dark:text-white mb-4">Requirements</h2>
        <ul className="space-y-2 text-slate-700 dark:text-slate-300 list-disc pl-5">
          {job.requirements.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <div className="bg-indeed-blue rounded-2xl p-6 sm:p-8 mt-6 text-white text-center">
        <h2 className="text-xl font-bold">Interested in this role?</h2>
        <p className="text-indigo-100 mt-2 text-sm">
          Apply now and get a response within 3 days.
        </p>
        <button
          onClick={handleApplyClick}
          className="mt-5 px-6 py-3 bg-white text-indeed-blue font-semibold rounded-xl hover:bg-indigo-50 transition"
        >
          Apply Now
        </button>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirm your application"
      >
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Are you sure you want to apply for <strong className="text-slate-900 dark:text-white">{job.title}</strong>{' '}
          at <strong className="text-slate-900 dark:text-white">{job.company}</strong>?
        </p>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="flex-1"
            disabled={isApplying}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirmApply} isLoading={isApplying} className="flex-1">
            Confirm Apply
          </Button>
        </div>
      </Modal>
    </div>
  );
}