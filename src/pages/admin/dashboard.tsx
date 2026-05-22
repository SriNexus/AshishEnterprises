import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users, Package, FolderKanban, FileText, MessageSquareQuote,
  TrendingUp, ArrowUpRight, Eye, Settings,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useAdminStore } from '@/store/admin-store';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  link: string;
}

/** Safe count — returns 0 if collection doesn't exist or query fails */
async function safeCount(collectionName: string): Promise<number> {
  try {
    const snap = await getDocs(collection(db, collectionName));
    return snap.size;
  } catch {
    return 0;
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [loading, setLoading] = useState(true);
  const { adminData } = useAdminStore();

  useEffect(() => {
    async function fetchData() {
      try {
        const [leads, products, projects, posts, testimonials, gallery, faq] = await Promise.all([
          safeCount(COLLECTIONS.LEADS),
          safeCount(COLLECTIONS.PRODUCTS),
          safeCount(COLLECTIONS.PROJECTS),
          safeCount(COLLECTIONS.BLOG_POSTS),
          safeCount(COLLECTIONS.TESTIMONIALS),
          safeCount(COLLECTIONS.GALLERY),
          safeCount(COLLECTIONS.FAQ),
        ]);

        setStats([
          { title: 'Leads', value: leads, icon: Users, color: 'bg-blue-500', link: '/admin/leads' },
          { title: 'Products', value: products, icon: Package, color: 'bg-green-500', link: '/admin/products' },
          { title: 'Projects', value: projects, icon: FolderKanban, color: 'bg-purple-500', link: '/admin/projects' },
          { title: 'Blog Posts', value: posts, icon: FileText, color: 'bg-orange-500', link: '/admin/blog' },
          { title: 'Testimonials', value: testimonials, icon: MessageSquareQuote, color: 'bg-pink-500', link: '/admin/testimonials' },
          { title: 'Gallery', value: gallery, icon: Eye, color: 'bg-cyan-500', link: '/admin/gallery' },
          { title: 'FAQ', value: faq, icon: TrendingUp, color: 'bg-amber-500', link: '/admin/faq' },
        ]);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Welcome */}
      <motion.div variants={fadeUp} className="bg-gradient-to-r from-brand-primary to-brand-primary-dark rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Welcome back, {adminData?.displayName || 'Admin'}!</h2>
        <p className="text-white/70 text-sm mt-1">Manage your website content, leads, and settings from here.</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={fadeUp}>
              <Link to={stat.link}>
                <Card className="group h-full hover:border-brand-primary/30" padding="md">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-primary transition-colors" />
                  </div>
                  <p className="text-2xl font-bold text-content-primary">{stat.value}</p>
                  <p className="text-xs text-content-secondary mt-0.5">{stat.title}</p>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <h3 className="font-bold text-content-primary mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Add Product', link: '/admin/products/new', icon: Package },
              { label: 'Add Project', link: '/admin/projects/new', icon: FolderKanban },
              { label: 'Write Post', link: '/admin/blog/new', icon: FileText },
              { label: 'Site Settings', link: '/admin/settings', icon: Settings },
              { label: 'View Site', link: '/', icon: Eye, external: true },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.label} to={action.link} target={action.external ? '_blank' : undefined}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary hover:bg-brand-primary/5 border border-transparent hover:border-brand-primary/20 transition-all">
                  <Icon className="w-4 h-4 text-brand-primary" />
                  <span className="text-sm font-medium text-content-primary">{action.label}</span>
                </Link>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Getting Started Guide */}
      <motion.div variants={fadeUp}>
        <Card padding="md">
          <h3 className="font-bold text-content-primary mb-2">Getting Started</h3>
          <p className="text-sm text-content-secondary mb-4">Complete these steps to set up your website content.</p>
          <div className="space-y-2">
            {[
              { label: 'Update site settings (name, phone, address)', link: '/admin/settings', done: false },
              { label: 'Upload your logo and favicon', link: '/admin/settings', done: false },
              { label: 'Add your products / solar systems', link: '/admin/products/new', done: false },
              { label: 'Add completed projects', link: '/admin/projects/new', done: false },
              { label: 'Write your first blog post', link: '/admin/blog/new', done: false },
              { label: 'Configure SEO settings', link: '/admin/seo', done: false },
            ].map((step, i) => (
              <Link key={i} to={step.link}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-secondary transition-colors group">
                <div className="w-6 h-6 rounded-full border-2 border-line flex items-center justify-center text-xs text-content-tertiary group-hover:border-brand-primary group-hover:text-brand-primary transition-colors">
                  {i + 1}
                </div>
                <span className="text-sm text-content-primary group-hover:text-brand-primary transition-colors">{step.label}</span>
                <ArrowUpRight className="w-3 h-3 text-content-tertiary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}
