import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, User, ArrowRight, Tag } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { BLOG_POSTS } from '@/data/constants';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';

const categories = ['All', ...new Set(BLOG_POSTS.map((post) => post.category))];

export default function BlogPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { ref, inView } = useScrollReveal();

  const filteredPosts = BLOG_POSTS.filter((post) => {
    const matchesCategory = filter === 'All' || post.category === filter;
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = BLOG_POSTS.filter((post) => post.featured);

  return (
    <MainLayout>
      <PageHero
        title="Blog & Resources"
        subtitle="Stay informed with the latest news, tips, and insights about solar energy."
        breadcrumbs={[{ label: 'Blog' }]}
      />

      {/* Featured Posts */}
      <Section background="secondary" padding="md">
        <SectionHeading
          badge="Featured"
          title="Top Articles"
          subtitle="Our most popular and helpful articles."
        />

        <div className="grid md:grid-cols-3 gap-6">
          {featuredPosts.slice(0, 3).map((post) => (
            <motion.div
              key={post.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <Link to={`/blog/${post.slug}`}>
                <Card className="h-full group" padding="md">
                  {/* Image Placeholder */}
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 mb-4 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                      <Tag className="w-12 h-12 text-brand-primary/30" />
                    </div>
                  </div>

                  <Badge variant="primary" className="mb-3">{post.category}</Badge>

                  <h3 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>

                  <p className="text-sm text-content-secondary line-clamp-2 mb-4">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-content-tertiary">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* All Posts */}
      <Section background="primary" padding="lg">
        <SectionHeading
          badge="All Articles"
          title="Latest From Our Blog"
          subtitle="Explore all our articles on solar energy, maintenance tips, and industry news."
        />

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 cursor-pointer ${
                  filter === cat
                    ? 'bg-brand-primary text-white'
                    : 'bg-surface-secondary border border-line text-content-secondary hover:border-brand-primary/30 hover:text-brand-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <motion.div key={post.id} variants={fadeUp}>
                <Link to={`/blog/${post.slug}`}>
                  <Card className="h-full group" padding="md">
                    {/* Image Placeholder */}
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 mb-4 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                        <Tag className="w-10 h-10 text-brand-primary/20" />
                      </div>
                    </div>

                    <Badge variant="outline" className="mb-3">{post.category}</Badge>

                    <h3 className="font-bold text-content-primary group-hover:text-brand-primary transition-colors line-clamp-2 mb-2">
                      {post.title}
                    </h3>

                    <p className="text-sm text-content-secondary line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-content-tertiary pt-4 border-t border-line">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-content-secondary">No articles found matching your search.</p>
            </div>
          )}
        </motion.div>
      </Section>

      {/* Newsletter CTA */}
      <Section background="gradient" padding="lg">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for the latest solar energy tips and industry news.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
            />
            <Button size="lg" icon={<ArrowRight className="h-5 w-5" />}>
              Subscribe
            </Button>
          </div>
        </div>
      </Section>
    </MainLayout>
  );
}
