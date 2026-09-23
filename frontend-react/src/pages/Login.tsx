import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/contexts/ToastContext';

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

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { remember: false },
  });

  const onSubmit = async (data: FormData) => {
    // TODO: Phase 4 — real API call
    await new Promise((r) => setTimeout(r, 800));

    // Demo: extract name from email
    const name = data.email.split('@')[0];
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);

    login(
      {
        id: '1',
        name: displayName,
        email: data.email,
        role: 'candidate', // demo — backend se aayega
      },
      'demo-jwt-token',
    );

    toast(`Welcome back, ${displayName}! 🎉`, 'success');
    navigate(from, { replace: true });
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

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Sign In
            </Button>
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

          <div className="mt-6 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 text-xs text-center text-indigo-700 dark:text-indigo-300">
            💡 Demo: koi bhi valid email + 6+ char password
          </div>
        </div>
      </div>
    </div>
  );
}