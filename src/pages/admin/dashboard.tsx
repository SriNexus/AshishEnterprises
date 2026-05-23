import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  FolderKanban,
  FileText,
  MessageSquareQuote,
  TrendingUp,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { getCollectionCount, getDocuments } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { LeadDoc } from '@/types/admin';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { formatDistanceToNow } from 'date-fns';
import { where } from 'firebase/firestore';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  link: string;
  change?: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatCard[]>([]);
  const [recentLeads, setRecentLeads] = useState<LeadDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch counts
        const [leads, products, projects, posts, testimonials] = await Promise.all([
          getCollectionCount(COLLECTIONS.LEADS),
          getCollectionCount(COLLECTIONS.PRODUCTS),
          getCollectionCount(COLLECTIONS.PROJECTS),
          getCollectionCount(COLLECTIONS.BLOG_POSTS),
          getCollectionCount(COLLECTIONS.TESTIMONIALS),
        ]);

        const newLeads = await getCollectionCount(COLLECTIONS.LEADS, [
          where('status', '==', 'new'),
        ]);

        setStats([
          {
            title: 'Total Leads',
            value: leads,
            icon: Users,
            color: 'bg-blue-500',
            link: '/admin/leads',
            change: newLeads,
          },
          {
            title: 'Products',
            value: products,
            icon: Package,
            color: 'bg-green-500',
            link: '/admin/products',
          },
          {
            title: 'Projects',
            value: projects,
            icon: FolderKanban,
            color: 'bg-purple-500',
            link: '/admin/projects',
          },
          {
            title: 'Blog Posts',
            value: posts,
            icon: FileText,
            color: 'bg-orange-500',
            link: '/admin/blog',
          },
          {
            title: 'Testimonials',
            value: testimonials,
            icon: MessageSquareQuote,
            color: 'bg-pink-500',
            link: '/admin/testimonials',
          },
        ]);

        // Fetch recent leads
        const leads_data = await getDocuments<LeadDoc>(COLLECTIONS.LEADS, [
          where('status', '==', 'new'),
        ]);
        setRecentLeads(leads_data.slice(0, 5));
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div key={stat.title} variants={fadeUp}>
              <Link to={stat.link}>
                <Card className="group h-full hover:border-brand-primary/30" padding="md">
                  <div className="flex items-start justify-between">
                    <div
                      className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-content-tertiary group-hover:text-brand-primary transition-colors" />
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold text-content-primary">
                      {stat.value}
                    </p>
                    <p className="text-sm text-content-secondary">{stat.title}</p>
                  </div>
                  {stat.change !== undefined && stat.change > 0 && (
                    <div className="mt-2 flex items-center gap-1 text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs font-medium">
                        {stat.change} new
                      </span>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <motion.div variants={fadeUp}>
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-content-primary">Recent Leads</h3>
              <Link
                to="/admin/panel/leads"
                className="text-sm text-brand-primary hover:underline"
              >
                View All
              </Link>
            </div>

            {recentLeads.length > 0 ? (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-content-primary text-sm">
                          {lead.name}
                        </p>
                        <p className="text-xs text-content-tertiary">
                          {lead.service || 'General Inquiry'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="primary">New</Badge>
                      {lead.createdAt && (
                        <p className="text-xs text-content-tertiary mt-1">
                          {formatDistanceToNow(lead.createdAt.toDate(), {
                            addSuffix: true,
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-content-secondary">
                <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No new leads yet</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp}>
          <Card padding="md">
            <h3 className="font-bold text-content-primary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Add Product', link: '/admin/products/new', icon: Package },
                { label: 'Add Project', link: '/admin/projects/new', icon: FolderKanban },
                { label: 'Write Post', link: '/admin/blog/new', icon: FileText },
                { label: 'View Site', link: '/', icon: Eye, external: true },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.label}
                    to={action.link}
                    target={action.external ? '_blank' : undefined}
                    className="flex items-center gap-3 p-4 rounded-xl bg-surface-secondary hover:bg-brand-primary/5 hover:border-brand-primary/30 border border-transparent transition-all"
                  >
                    <Icon className="w-5 h-5 text-brand-primary" />
                    <span className="text-sm font-medium text-content-primary">
                      {action.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
