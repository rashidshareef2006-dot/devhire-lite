import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { MotionCard } from '../components/common/MotionCard';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { jobsService } from '@/services/jobs.service';
import { AxiosError } from 'axios';

// Frontend form ke labels — user-friendly
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

export function PostJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'FULL_TIME' },
  });

  const onSubmit = async (data: FormData) => {
    if (!isAuthenticated) {
      toast('Please login first', 'error');
      return;
    }

    if (user?.role !== 'RECRUITER' && user?.role !== 'ADMIN') {
      toast('Only recruiters can post jobs', 'error');
      return;
    }

    try {
      await jobsService.create({
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

      toast('🎉 Job posted successfully!', 'success');
      reset();
      navigate('/jobs');
    } catch (err) {
      const axErr = err as AxiosError<{
        message?: string;
        error?: { message?: string; details?: Record<string, string[]> };
      }>;
      const detail = axErr.response?.data?.error?.details;
      const firstDetail = detail ? Object.values(detail)[0]?.[0] : null;
      const msg =
        firstDetail ||
        axErr.response?.data?.error?.message ||
        axErr.response?.data?.message ||
        'Failed to post job. Try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-7 h-7 text-indeed-blue" />
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a New Job</h1>
      </div>

      <MotionCard className="p-6" hover={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
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
              <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
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
              <p className="text-sm text-red-500 mt-1">{errors.requirements.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => reset()}>
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </MotionCard>
    </div>
  );
}