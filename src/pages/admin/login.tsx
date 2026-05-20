import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sun, Lock, Mail, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { signInAdmin } from '@/firebase/auth';
import { useAdminStore } from '@/store/admin-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAdminStore();

  const from = (location.state as { from?: Location })?.from?.pathname || '/admin';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signInAdmin(data.email, data.password);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const firebaseErr = err as { code?: string };
      switch (firebaseErr.code) {
        case 'auth/invalid-credential':
        case 'auth/wrong-password':
        case 'auth/user-not-found':
          setError('Invalid email or password.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">

      {/* ── LEFT: Cinematic brand panel ────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        {/* Background */}
        <div className="absolute inset-0 bg-[#060b14]" />
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(ellipse 70% 60% at 50% 40%, rgba(10,25,50,0.9) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 70% 70%, rgba(255,138,0,0.04) 0%, transparent 50%)
          `,
        }} />

        {/* Ambient glow */}
        <motion.div
          className="absolute top-[20%] left-[30%] w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,138,0,0.06) 0%, transparent 65%)' }}
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Content */}
        <div className="relative z-10 px-12 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-primary-dark grid place-items-center shadow-lg shadow-brand-primary/20">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-white">Ashish <span className="text-brand-primary">Enterprises</span></div>
                <div className="text-[10px] text-white/30 tracking-widest uppercase">Solar & Electrical</div>
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold text-white font-heading leading-tight mb-4">
              Manage Your
              <br />
              <span className="bg-gradient-to-r from-brand-primary via-amber-300 to-brand-primary bg-clip-text text-transparent">
                Solar Business
              </span>
            </h2>

            <p className="text-sm text-white/30 leading-relaxed mb-8">
              Access your dashboard to manage products, projects, blog posts,
              customer leads, and website content — all from one place.
            </p>

            {/* Features */}
            <div className="space-y-3">
              {[
                'Manage all website content',
                'Upload images & media',
                'Track customer inquiries',
                'Update SEO & settings',
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary/10 grid place-items-center flex-shrink-0">
                    <Shield className="w-3 h-3 text-brand-primary" />
                  </div>
                  <span className="text-sm text-white/40">{feat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#060b14] to-transparent" />
      </div>

      {/* ── RIGHT: Login form ─────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-surface-primary p-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-primary mb-3">
              <Sun className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold font-heading text-content-primary">
              Ashish Enterprises
            </h1>
            <p className="text-xs text-content-tertiary mt-1">Admin Dashboard</p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold font-heading text-content-primary">
              Welcome back
            </h1>
            <p className="text-sm text-content-secondary mt-1">
              Sign in to your admin account
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-500">{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@example.com"
              icon={<Mail className="w-4 h-4" />}
              error={errors.email?.message}
              autoComplete="email"
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              autoComplete="current-password"
              {...register('password')}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              isLoading={isSubmitting}
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-line">
            <p className="text-center text-xs text-content-tertiary">
              Protected admin area. Unauthorized access is prohibited.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
