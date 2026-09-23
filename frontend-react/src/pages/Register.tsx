import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';

const schema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    role: z.enum(['candidate', 'recruiter']),
    terms: z.boolean().refine((v) => v === true, 'You must accept the terms'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function Register() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'candidate', terms: false },
  });

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 800));
    alert('✅ Account created! Redirecting to login...');
    navigate('/login');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-indeed-ink">Create account 🎉</h1>
            <p className="text-slate-600 mt-2 text-sm">Join DevHire Lite in under a minute</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Full Name"
              placeholder="Rashi Sharma"
              required
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 6 characters"
              required
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <fieldset>
              <legend className="block text-sm font-medium text-slate-700 mb-2">I am a</legend>
              <div className="grid grid-cols-2 gap-3">
                <label className="cursor-pointer">
                  <input type="radio" value="candidate" className="peer sr-only" {...register('role')} />
                  <div className="p-3 text-center text-sm font-medium rounded-xl border border-slate-200 peer-checked:border-indeed-blue peer-checked:bg-indeed-blue/5 peer-checked:text-indeed-blue hover:bg-slate-50 transition">
                    👨‍💻 Candidate
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" value="recruiter" className="peer sr-only" {...register('role')} />
                  <div className="p-3 text-center text-sm font-medium rounded-xl border border-slate-200 peer-checked:border-indeed-blue peer-checked:bg-indeed-blue/5 peer-checked:text-indeed-blue hover:bg-slate-50 transition">
                    🏢 Recruiter
                  </div>
                </label>
              </div>
            </fieldset>

            <div>
              <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded text-indeed-blue focus:ring-indeed-blue"
                  {...register('terms')}
                />
                <span>I agree to the Terms and Privacy Policy</span>
              </label>
              {errors.terms && <p className="text-sm text-red-600 mt-1">{errors.terms.message}</p>}
            </div>

            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Create Account
            </Button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indeed-blue font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}