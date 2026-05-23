import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trash2, Edit2 } from 'lucide-react';
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
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { PROJECTS as STATIC_PROJECTS } from '@/data/constants';
import toast from 'react-hot-toast';

interface ProjectItem { id: string; title: string; description: string; category: string; imageUrl?: string; images?: string[]; stats?: Record<string, string>; location?: string; isPublished?: boolean; }
const EMPTY: Omit<ProjectItem, 'id'> = { title: '', description: '', category: 'Residential', imageUrl: '', stats: {}, location: '', isPublished: true };

export default function ProjectsPage() {
  const { ref, inView } = useScrollReveal();
  const { isEditMode } = useVisualEditor();
  const [projects, setProjects] = useState<ProjectItem[]>(STATIC_PROJECTS.map(p => ({ ...p, isPublished: true })));
  const [filter, setFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectItem | null>(null);
  const [draft, setDraft] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.PROJECTS), where('isPublished', '==', true)),
      (snap) => { if (snap.docs.length > 0) setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem))); },
      () => {}
    );
    return () => unsub();
  }, []);

  const categories = ['All', ...new Set(projects.map(p => p.category))];
  const filtered = filter === 'All' ? projects : projects.filter(p => p.category === filter);

  const handleAdd = async () => {
    if (!draft.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.PROJECTS), { ...draft, isPublished: true, featured: false, images: draft.imageUrl ? [draft.imageUrl] : [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY); toast.success('Project added!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleEditSave = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, editItem.id), { title: editItem.title, description: editItem.description, category: editItem.category, location: editItem.location, updatedAt: serverTimestamp() });
      setEditItem(null); toast.success('Updated!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  const imgSrc = (p: ProjectItem) => p.imageUrl || (p.images && p.images[0]) || '';

  return (
    <MainLayout>
      <PageHero title="Our Projects" subtitle="A showcase of our solar installations across Varanasi and Eastern UP." breadcrumbs={[{ label: 'Projects' }]} />
      <EditableSection id="projects-page" label="Projects" onAddItem={() => { setDraft(EMPTY); setAddOpen(true); }}>
        <Section background="primary" padding="lg">
          <SectionHeading badge="Projects" title="Completed Installations" subtitle="Real projects. Real results. Real impact." />
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer transition-all ${filter === cat ? 'bg-brand-primary text-white' : 'bg-surface-card border border-line text-content-secondary hover:border-brand-primary/30'}`}>
                {cat}
              </button>
            ))}
          </div>
          <motion.div ref={ref} variants={staggerContainer} initial="hidden" animate={inView ? 'visible' : 'hidden'} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project) => (
              <motion.div key={project.id} variants={fadeUp} className="relative group/proj">
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                    <button onClick={() => setEditItem({ ...project })} className="p-1 bg-blue-600 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-1 bg-red-600 text-white rounded cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
                <div className="group rounded-2xl overflow-hidden border border-line bg-surface-card hover:shadow-xl hover:shadow-brand-primary/[0.04] transition-all duration-500 h-full flex flex-col">
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-secondary to-brand-secondary-dark overflow-hidden">
                    {imgSrc(project) ? (
                      <img src={imgSrc(project)} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><Zap className="h-8 w-8 text-brand-primary/40" /></div>
                    )}
                    <div className="absolute top-3 left-3"><Badge variant="primary" className="bg-white/90 text-brand-secondary-dark text-[11px]">{project.category}</Badge></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-content-primary mb-2 group-hover:text-brand-primary transition-colors">{project.title}</h3>
                    <p className="text-sm text-content-secondary leading-relaxed flex-1 line-clamp-2">{project.description}</p>
                    {project.stats && Object.keys(project.stats).length > 0 && (
                      <div className="flex gap-4 pt-4 mt-4 border-t border-line">
                        {Object.entries(project.stats).map(([k, v]) => (
                          <div key={k} className="text-center flex-1">
                            <div className="text-sm font-bold text-brand-primary">{v}</div>
                            <div className="text-[10px] text-content-tertiary uppercase tracking-wider">{k}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Project" onSave={handleAdd} saving={saving}>
        <Field label="Title"><FieldInput value={draft.title} onChange={v => setDraft(d => ({ ...d, title: v }))} placeholder="Project title" /></Field>
        <Field label="Description"><FieldTextarea value={draft.description} onChange={v => setDraft(d => ({ ...d, description: v }))} rows={3} /></Field>
        <Field label="Category"><FieldInput value={draft.category} onChange={v => setDraft(d => ({ ...d, category: v }))} placeholder="Residential / Commercial" /></Field>
        <Field label="Location"><FieldInput value={draft.location || ''} onChange={v => setDraft(d => ({ ...d, location: v }))} placeholder="Varanasi, UP" /></Field>
        <Field label="Project Image"><FieldImageUpload onUpload={url => setDraft(d => ({ ...d, imageUrl: url }))} folder="projects" /></Field>
      </EditModal>

      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Project" onSave={handleEditSave} saving={saving}>
          <Field label="Title"><FieldInput value={editItem.title} onChange={v => setEditItem(e => e && { ...e, title: v })} /></Field>
          <Field label="Description"><FieldTextarea value={editItem.description} onChange={v => setEditItem(e => e && { ...e, description: v })} rows={3} /></Field>
          <Field label="Category"><FieldInput value={editItem.category} onChange={v => setEditItem(e => e && { ...e, category: v })} /></Field>
          <Field label="Location"><FieldInput value={editItem.location || ''} onChange={v => setEditItem(e => e && { ...e, location: v })} /></Field>
        </EditModal>
      )}
    </MainLayout>
  );
}
