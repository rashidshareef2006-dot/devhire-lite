import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2, Save, Pencil } from 'lucide-react';
import { AxiosError } from 'axios';
import { Input } from '@/components/common/Input';
import { useToast } from '@/contexts/ToastContext';
import { jobsService } from '@/services/jobs.service';
import type { Job } from '@/types';

const JOB_TYPE_OPTIONS = [
  { label: 'Full-time', value: 'FULL_TIME' },
  { label: 'Part-time', value: 'PART_TIME' },
  { label: 'Contract', value: 'CONTRACT' },
  { label: 'Internship', value: 'INTERNSHIP' },
] as const;

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  company: z.string().min(2, 'Company name required'),
  location: z.string().min(2, 'Location required'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  category: z.string().min(2, 'Category required'),
  salaryMin: z.coerce.number().min(0, 'Must be positive').optional(),
  salaryMax: z.coerce.number().min(0, 'Must be positive').optional(),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  job: Job;
  onClose: () => void;
  onUpdated: (job: Job) => void;
}

export function EditJobModal({ job, onClose, onUpdated }: Props) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      category: job.category,
      salaryMin: job.salaryMin ?? undefined,
      salaryMax: job.salaryMax ?? undefined,
      description: job.description,
      requirements: job.requirements,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const updated = await jobsService.update(job.id, {
        title: data.title,
        company: data.company,
        location: data.location,
        type: data.type,
        category: data.category,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        description: data.description,
        requirements: data.requirements,
      });
      toast('Job updated successfully', 'success');
      onUpdated(updated);
    } catch (err) {
      const axErr = err as AxiosError<{
        error?: { message?: string; details?: Record<string, string[]> };
      }>;
      const detail = axErr.response?.data?.error?.details;
      const firstDetail = detail ? Object.values(detail)[0]?.[0] : null;
      const msg =
        firstDetail ||
        axErr.response?.data?.error?.message ||
        'Failed to update job. Try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/60 backdrop-blur-sm px-4 py-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full my-auto border border-slate-300 dark:border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Pencil className="w-5 h-5 text-indeed-blue dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Job
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white transition disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-5 max-h-[70vh] overflow-y-auto"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Job Title"
              placeholder="Senior React Developer"
              error={errors.title?.message}
              {...register('title')}
            />
            <Input
              label="Company"
              placeholder="Acme Inc."
              error={errors.company?.message}
              {...register('company')}
            />
            <Input
              label="Location"
              placeholder="Bangalore, India"
              error={errors.location?.message}
              {...register('location')}
            />
            <Input
              label="Category"
              placeholder="Frontend"
              error={errors.category?.message}
              {...register('category')}
            />

            <div>
              <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
                Job Type
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indeed-blue"
              >
                {JOB_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Salary Min (₹)"
                type="number"
                placeholder="800000"
                error={errors.salaryMin?.message}
                {...register('salaryMin')}
              />
              <Input
                label="Salary Max (₹)"
                type="number"
                placeholder="1500000"
                error={errors.salaryMax?.message}
                {...register('salaryMax')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities..."
              {...register('description')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indeed-blue resize-y"
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-slate-700 dark:text-slate-300">
              Requirements
            </label>
            <textarea
              rows={4}
              placeholder="React, TypeScript, 3+ years experience..."
              {...register('requirements')}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indeed-blue resize-y"
            />
            {errors.requirements && (
              <p className="text-sm text-red-500 mt-1">
                {errors.requirements.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-indeed-blue hover:bg-indeed-hover transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}