import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search, Sun } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { Button } from '@/components/ui/button';
import { fadeUp, staggerContainer } from '@/animations/variants';

export default function NotFoundPage() {
  return (
    <MainLayout>
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-brand-secondary-dark via-brand-secondary to-brand-secondary-light">
        {/* Background elements */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Animated orbs */}
        <motion.div
          className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-brand-primary/10 blur-3xl"
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-20 left-[10%] w-48 h-48 rounded-full bg-brand-accent/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="relative z-10 text-center px-4 max-w-2xl mx-auto"
        >
          {/* 404 Number */}
          <motion.div
            variants={fadeUp}
            className="relative mb-8"
          >
            <span className="text-[150px] sm:text-[200px] font-bold font-heading text-white/5 leading-none select-none">
              404
            </span>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="w-24 h-24 rounded-full bg-brand-primary/20 flex items-center justify-center">
                <Sun className="w-12 h-12 text-brand-primary" />
              </div>
            </motion.div>
          </motion.div>

          {/* Message */}
          <motion.h1
            variants={fadeUp}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-white mb-4"
          >
            Page Not Found
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-white/60 text-lg mb-8 max-w-md mx-auto"
          >
            Oops! The page you're looking for seems to have gone off-grid. 
            Let's get you back to a powered-up destination.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/">
              <Button size="lg" icon={<Home className="h-5 w-5" />}>
                Back to Home
              </Button>
            </Link>
            <Link to="/services">
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                icon={<Search className="h-5 w-5" />}
              >
                Explore Services
              </Button>
            </Link>
          </motion.div>

          {/* Go Back Link */}
          <motion.div variants={fadeUp} className="mt-8">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back to previous page
            </button>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={fadeUp}
            className="mt-12 pt-8 border-t border-white/10"
          >
            <p className="text-xs text-white/40 mb-4">Popular pages</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Products', href: '/products' },
                { label: 'Projects', href: '/projects' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-2 rounded-full bg-white/5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>
    </MainLayout>
  );
}
