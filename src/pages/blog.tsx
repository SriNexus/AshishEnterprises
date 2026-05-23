import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, Trash2 } from 'lucide-react';
import { MainLayout } from '@/layouts/main-layout';
import { PageHero } from '@/components/page-hero';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { fadeUp, staggerContainer } from '@/animations/variants';
import { useScrollReveal } from '@/hooks/use-intersection';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { EditModal, Field, FieldInput, FieldTextarea, FieldImageUpload } from '@/components/visual-editor/edit-modal';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { BLOG_POSTS } from '@/data/constants';
import toast from 'react-hot-toast';

interface BlogItem { id: string; title: string; excerpt: string; category: string; author: string; featuredImage?: string; slug?: string; publishedAt?: { seconds: number }; readTime?: string; isPublished?: boolean; }
const EMPTY: Omit<BlogItem, 'id'> = { title: '', excerpt: '', category: 'Solar Energy', author: 'Admin', featuredImage: '', slug: '', readTime: '5 min', isPublished: true };

export default function BlogPage() {
  const { ref, inView } = useScrollReveal();
  const { isEditMode } = useVisualEditor();
  const [posts, setPosts] = useState<BlogItem[]>(
    (BLOG_POSTS as unknown as BlogItem[]).map((p, i) => ({ ...p, id: String(i), isPublished: true }))
  );
  const [addOpen, setAddOpen] = useState(false);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.BLOG_POSTS), where('isPublished', '==', true), orderBy('createdAt', 'desc')),
      (snap) => { if (snap.docs.length > 0) setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogItem))); },
      () => {}
    );
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!draft.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      const slug = draft.slug || draft.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await addDoc(collection(db, COLLECTIONS.BLOG_POSTS), { ...draft, slug, isPublished: true, content: draft.excerpt, tags: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY); toast.success('Post added!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.BLOG_POSTS, id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const formatDate = (post: BlogItem) => {
    if (post.publishedAt?.seconds) return new Date(post.publishedAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return 'Recent';
  };

  return (
    <MainLayout>
      <PageHero title="Solar Energy Blog" subtitle="Expert insights, tips, and news about solar energy and sustainable living." breadcrumbs={[{ label: 'Blog' }]} />
      <EditableSection id="blog" label="Blog Posts" onAddItem={() => { setDraft(EMPTY); setAddOpen(true); }}>
        <Section background="primary" padding="lg">
          <SectionHeading badge="Blog" title="Latest Articles" subtitle="Stay informed with our solar energy insights." />
          <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <motion.div key={post.id} variants={fadeUp} className="relative group/post">
                {isEditMode && (
                  <button onClick={() => handleDelete(post.id)} className="absolute top-2 right-2 z-20 p-1 bg-red-600 text-white rounded opacity-0 group-hover/post:opacity-100 transition-opacity cursor-pointer">
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
                <Link to={`/blog/${post.slug || post.id}`} className="block h-full">
                  <div className="group h-full rounded-2xl border border-line bg-surface-card overflow-hidden hover:shadow-xl hover:shadow-brand-primary/[0.04] hover:-translate-y-1 transition-all duration-300">
                    <div className="aspect-[16/9] bg-gradient-to-br from-brand-primary/10 to-brand-primary/5 overflow-hidden">
                      {post.featuredImage ? (
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">☀️</div>
                      )}
                    </div>
                    <div className="p-5">
                      <Badge variant="primary" className="mb-3 text-[11px]">{post.category}</Badge>
                      <h3 className="text-base font-bold text-content-primary mb-2 line-clamp-2 group-hover:text-brand-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-content-secondary leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center gap-3 text-xs text-content-tertiary">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post)}</span>
                        {post.readTime && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Blog Post" onSave={handleAdd} saving={saving}>
        <Field label="Title"><FieldInput value={draft.title} onChange={v => setDraft(d => ({ ...d, title: v }))} placeholder="Post title" /></Field>
        <Field label="Excerpt"><FieldTextarea value={draft.excerpt} onChange={v => setDraft(d => ({ ...d, excerpt: v }))} rows={3} placeholder="Short description..." /></Field>
        <Field label="Category"><FieldInput value={draft.category} onChange={v => setDraft(d => ({ ...d, category: v }))} placeholder="Solar Energy" /></Field>
        <Field label="Author"><FieldInput value={draft.author} onChange={v => setDraft(d => ({ ...d, author: v }))} placeholder="Author name" /></Field>
        <Field label="Read Time"><FieldInput value={draft.readTime || ''} onChange={v => setDraft(d => ({ ...d, readTime: v }))} placeholder="5 min read" /></Field>
        <Field label="Featured Image"><FieldImageUpload onUpload={url => setDraft(d => ({ ...d, featuredImage: url }))} folder="blog" /></Field>
      </EditModal>
    </MainLayout>
  );
}
