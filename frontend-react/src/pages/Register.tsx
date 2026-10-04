import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth.service';
import { AxiosError } from 'axios';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['CANDIDATE', 'RECRUITER']),
});

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CANDIDATE' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      login(res.user, res.accessToken, res.refreshToken);
      toast(`Account created! Welcome, ${res.user.name} 🎉`, 'success');
      navigate('/dashboard', { replace: true });
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
        'Registration failed. Please try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-indeed-ink dark:text-white">
              Create your account ✨
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
              Join DevHire Lite in 30 seconds
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full name"
              type="text"
              placeholder="Rashi Sharma"
              autoComplete="name"
              required
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                I am a…
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indeed-blue transition-colors has-[:checked]:border-indeed-blue has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-950/30">
                  <input
                    type="radio"
                    value="CANDIDATE"
                    className="text-indeed-blue focus:ring-indeed-blue"
                    {...register('role')}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    👤 Candidate
                  </span>
                </label>
                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-indeed-blue transition-colors has-[:checked]:border-indeed-blue has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-950/30">
                  <input
                    type="radio"
                    value="RECRUITER"
                    className="text-indeed-blue focus:ring-indeed-blue"
                    {...register('role')}
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    💼 Recruiter
                  </span>
                </label>
              </div>
              {errors.role && (
                <p className="text-sm text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indeed-blue dark:text-indigo-400 font-semibold hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}