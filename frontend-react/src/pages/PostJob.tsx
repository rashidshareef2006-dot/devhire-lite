import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Upload, X, ImageIcon } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { MotionCard } from '../components/common/MotionCard';
import { useToast } from '../contexts/ToastContext';
import { useAuthStore } from '@/store/useAuthStore';
import { jobsService } from '@/services/jobs.service';
import { AxiosError } from 'axios';

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

/**
 * Client-side image compression via canvas.
 * Max width 800px, JPEG quality 0.75 → typically 50–150 KB.
 */
async function compressImage(file: File, maxWidth = 800, quality = 0.75): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas not supported'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Compression failed'));
          const baseName = file.name.replace(/\.[^.]+$/, '') || 'job-image';
          resolve(new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => reject(new Error('Could not load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function PostJob() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageFile, setImageFile]       = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError]     = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'FULL_TIME' },
  });

  const resetImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImagePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageError(null);

    if (!file.type.startsWith('image/')) {
      setImageError('Only image files (JPG/PNG/WEBP) allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Original image must be under 5MB');
      return;
    }

    setIsProcessing(true);
    try {
      const compressed = await compressImage(file, 800, 0.75);
      setImageFile(compressed);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(compressed));
    } catch {
      setImageError('Failed to process image. Try another file.');
    } finally {
      setIsProcessing(false);
    }
  };

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
      await jobsService.create(
        {
          title: data.title,
          company: data.company,
          location: data.location,
          type: data.type,
          category: data.category,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          description: data.description,
          requirements: data.requirements,
        },
        imageFile ?? undefined,
      );

      toast('🎉 Job posted successfully!', 'success');
      reset();
      resetImage();
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-brand" />
        <h1 className="text-xl sm:text-2xl font-bold text-ink">Post a New Job</h1>
      </div>

      <MotionCard className="p-4 sm:p-6" hover={false}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

          {/* ─── Image upload ───────────────────── */}
          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink-soft">
              Company / Job Image{' '}
              <span className="text-ink-mute font-normal">(optional)</span>
            </label>

            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-line group">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-44 sm:h-52 object-cover"
                />
                <button
                  type="button"
                  onClick={resetImage}
                  aria-label="Remove image"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {imageFile && (
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold">
                    {Math.round(imageFile.size / 1024)} KB · compressed
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="w-full h-32 sm:h-40 rounded-2xl border-2 border-dashed border-line-strong hover:border-brand hover:bg-brand/5 transition-colors flex flex-col items-center justify-center gap-2 text-ink-mute hover:text-brand disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span className="text-[13px] font-medium">Compressing…</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-[13px] font-semibold">Click to upload image</span>
                    <span className="text-[11px]">JPG · PNG · WEBP · max 5MB</span>
                  </>
                )}
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImagePick}
              className="hidden"
            />

            {imageError && (
              <p className="text-sm text-danger mt-1.5 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5" /> {imageError}
              </p>
            )}
          </div>

          {/* ─── Existing fields ────────────────── */}
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
              <label className="block text-sm font-medium mb-1.5 text-ink-soft">
                Job Type
              </label>
              <select
                {...register('type')}
                className="input-field h-[42px]"
              >
                {JOB_TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-sm text-danger mt-1">{errors.type.message}</p>
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
            <label className="block text-sm font-medium mb-1.5 text-ink-soft">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Describe the role, responsibilities..."
              {...register('description')}
              className="input-field resize-y"
            />
            {errors.description && (
              <p className="text-sm text-danger mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-ink-soft">
              Requirements
            </label>
            <textarea
              rows={4}
              placeholder="React, TypeScript, 3+ years experience..."
              {...register('requirements')}
              className="input-field resize-y"
            />
            {errors.requirements && (
              <p className="text-sm text-danger mt-1">{errors.requirements.message}</p>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { reset(); resetImage(); }}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isSubmitting || isProcessing}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </MotionCard>
    </div>
  );
}