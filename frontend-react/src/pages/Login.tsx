import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/contexts/ToastContext';
import { authService } from '@/services/auth.service';
import { AxiosError } from 'axios';

const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const { toast } = useToast();

  const from =
    (location.state as { from?: { pathname: string } } | null)?.from?.pathname ||
    '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });

      login(res.user, res.accessToken, res.refreshToken);
      toast(`Welcome back, ${res.user.name}! 🎉`, 'success');
      navigate(from, { replace: true });
    } catch (err) {
      const axErr = err as AxiosError<{ message?: string; error?: { message?: string } }>;
      const msg =
        axErr.response?.data?.error?.message ||
        axErr.response?.data?.message ||
        'Login failed. Please try again.';
      toast(msg, 'error');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-indeed-ink dark:text-white">
              Welcome back 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
              Sign in to continue
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
              autoComplete="current-password"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded text-indeed-blue focus:ring-indeed-blue"
                  {...register('remember')}
                />
                <span className="text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <a
                href="#"
                className="text-indeed-blue dark:text-indigo-400 font-medium hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* ✅ FIX: Explicit styles — guaranteed visible submit button */}
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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indeed-blue dark:text-indigo-400 font-semibold hover:underline"
            >
              Create one
            </Link>
          </p>

          {/* ✅ FIX: Test credentials hint block DELETED */}
        </div>
      </div>
    </div>
  );
}