import { useParams, Navigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Share2, ArrowLeft, ArrowRight, Tag } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BLOG_POSTS } from '@/data/constants';
import { fadeUp } from '@/animations/variants';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prevPost = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const nextPost = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;
  const relatedPosts = BLOG_POSTS.filter(
    (p) => p.category === post.category && p.slug !== slug
  ).slice(0, 3);

  return (
    <MainLayout>
      <PageHero
        title={post.title}
        subtitle={post.excerpt}
        breadcrumbs={[{ label: 'Blog', href: '/blog' }, { label: post.title }]}
        compact
      />

      <Section background="primary" padding="lg">
        <div className="max-w-4xl mx-auto">
          {/* Meta Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-4 mb-8 pb-6 border-b border-line"
          >
            <Badge variant="primary">{post.category}</Badge>
            <span className="flex items-center gap-1.5 text-sm text-content-secondary">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-content-secondary">
              <Calendar className="h-4 w-4" />
              {new Date(post.date).toLocaleDateString('en-IN', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-content-secondary">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
            <button className="ml-auto flex items-center gap-1.5 text-sm text-brand-primary hover:underline cursor-pointer">
              <Share2 className="h-4 w-4" />
              Share
            </button>
          </motion.div>

          {/* Featured Image Placeholder */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="aspect-video rounded-2xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 mb-8 flex items-center justify-center"
          >
            <Tag className="w-20 h-20 text-brand-primary/30" />
          </motion.div>

          {/* Article Content */}
          <motion.article
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-heading prose-headings:text-content-primary prose-p:text-content-secondary prose-a:text-brand-primary"
          >
            <p className="lead text-lg text-content-secondary leading-relaxed">
              {post.excerpt}
            </p>

            <h2>Introduction</h2>
            <p>
              Solar energy has become one of the most promising renewable energy sources in India. 
              With abundant sunlight throughout the year and declining costs of solar equipment, 
              more homeowners and businesses are making the switch to clean energy.
            </p>

            <h2>Key Benefits</h2>
            <ul>
              <li>Significant reduction in electricity bills (50-90%)</li>
              <li>Protection against rising electricity costs</li>
              <li>Government subsidies and tax benefits</li>
              <li>Low maintenance requirements</li>
              <li>Increased property value</li>
              <li>Contribution to a cleaner environment</li>
            </ul>

            <h2>Getting Started</h2>
            <p>
              The first step towards going solar is understanding your energy requirements. 
              A professional solar consultant can analyze your electricity bills, roof space, 
              and sun exposure to design the optimal system for your needs.
            </p>

            <blockquote>
              "Solar energy is the ultimate solution for India's energy needs. With proper planning 
              and quality installation, solar panels can provide decades of clean, free electricity."
            </blockquote>

            <h2>Conclusion</h2>
            <p>
              Investing in solar energy is not just good for the environment—it's also a smart 
              financial decision. With the right partner, you can enjoy hassle-free installation 
              and decades of savings.
            </p>
          </motion.article>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-line">
            <span className="text-sm text-content-secondary mr-2">Tags:</span>
            <Badge variant="outline">Solar Energy</Badge>
            <Badge variant="outline">Renewable</Badge>
            <Badge variant="outline">Savings</Badge>
            <Badge variant="outline">Green</Badge>
          </div>

          {/* Post Navigation */}
          <div className="grid sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-line">
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="group">
                <Card className="h-full" padding="md">
                  <div className="flex items-center gap-2 text-xs text-content-tertiary mb-2">
                    <ArrowLeft className="h-3 w-3" />
                    Previous Article
                  </div>
                  <p className="font-semibold text-content-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                    {prevPost.title}
                  </p>
                </Card>
              </Link>
            ) : (
              <div />
            )}
            {nextPost && (
              <Link to={`/blog/${nextPost.slug}`} className="group text-right">
                <Card className="h-full" padding="md">
                  <div className="flex items-center justify-end gap-2 text-xs text-content-tertiary mb-2">
                    Next Article
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  <p className="font-semibold text-content-primary group-hover:text-brand-primary transition-colors line-clamp-1">
                    {nextPost.title}
                  </p>
                </Card>
              </Link>
            )}
          </div>
        </div>
      </Section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Section background="secondary" padding="lg">
          <h2 className="text-2xl font-bold font-heading text-content-primary text-center mb-8">
            Related Articles
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {relatedPosts.map((related) => (
              <Link key={related.id} to={`/blog/${related.slug}`}>
                <Card className="h-full group" padding="md">
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 mb-4 flex items-center justify-center">
                    <Tag className="w-8 h-8 text-brand-primary/20" />
                  </div>
                  <h3 className="font-semibold text-content-primary group-hover:text-brand-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <p className="text-xs text-content-tertiary mt-2">{related.readTime}</p>
                </Card>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Ready to Go Solar?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Get a free consultation and see how much you can save.
          </p>
          <Link to="/contact">
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
              Get Free Quote
            </Button>
          </Link>
        </div>
      </Section>
    </MainLayout>
  );
}
