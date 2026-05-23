import { STRINGS } from '@/lib/strings';
/**
 * ProjectsSection — Visual Editor Version
 */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Edit2, Trash2 } from 'lucide-react';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { Button } from '@/components/ui/button';
import { fadeUp } from '@/animations/variants';
import { Badge } from '@/components/ui/badge';
import { useVisualEditor } from '@/store/visual-editor-context';
import { EditableSection } from '@/components/visual-editor/editable-section';
import { InlineImageEditor } from '@/components/visual-editor/inline-image-editor';
import { EditModal, Field, FieldInput, FieldTextarea } from '@/components/visual-editor/edit-modal';
import { collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { COLLECTIONS } from '@/firebase/collections';
import { PROJECTS as STATIC_PROJECTS } from '@/data/constants';
import toast from 'react-hot-toast';

interface ProjectItem {
  id: string; title: string; description: string; category: string;
  imageUrl?: string; stats?: Record<string, string>; slug?: string; isPublished?: boolean;
}

const EMPTY_PROJECT: Omit<ProjectItem, 'id'> = {
  title: '', description: '', category: 'Residential', imageUrl: '', stats: {}, slug: '', isPublished: true,
};

export function ProjectsSection() {
  const { isEditMode } = useVisualEditor();
  const [projects, setProjects] = useState<ProjectItem[]>(
    STATIC_PROJECTS.map(p => ({ ...p, isPublished: true }))
  );
  const [addOpen, setAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<ProjectItem | null>(null);
  const [draft, setDraft] = useState(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, COLLECTIONS.PROJECTS), where('isPublished', '==', true)),
      (snap) => { if (snap.docs.length > 0) setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem))); },
      () => {}
    );
    return () => unsub();
  }, []);

  const handleAdd = async () => {
    if (!draft.title) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      await addDoc(collection(db, COLLECTIONS.PROJECTS), { ...draft, isPublished: true, featured: false, images: [], createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setAddOpen(false); setDraft(EMPTY_PROJECT); toast.success('Project added!');
    } catch { toast.error('Failed to add'); } finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, COLLECTIONS.PROJECTS, editItem.id), { title: editItem.title, description: editItem.description, category: editItem.category, updatedAt: serverTimestamp() });
      setEditItem(null); toast.success('Project updated!');
    } catch { toast.error('Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this project?')) return;
    try { await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id)); toast.success('Deleted'); }
    catch { toast.error('Failed'); }
  };

  return (
    <>
      <EditableSection id="projects" label="Projects Section" onAddItem={() => { setDraft(EMPTY_PROJECT); setAddOpen(true); }}>
        <Section id="projects" background="primary" padding="lg">
          <SectionHeading badge={STRINGS.projects.badge} title={STRINGS.projects.title} subtitle={STRINGS.projects.subtitle} />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map((project) => (
              <motion.div key={project.id} variants={fadeUp} className="relative group/proj">
                {isEditMode && (
                  <div className="absolute top-2 right-2 z-20 flex gap-1 opacity-0 group-hover/proj:opacity-100 transition-opacity">
                    <button onClick={() => setEditItem({ ...project })} className="p-1 bg-blue-600 text-white rounded cursor-pointer"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => handleDelete(project.id)} className="p-1 bg-red-600 text-white rounded cursor-pointer"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
                <div className="group relative rounded-2xl overflow-hidden border border-line bg-surface-card hover:shadow-xl hover:shadow-brand-primary/[0.04] transition-all duration-500 h-full flex flex-col">
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-brand-secondary via-brand-secondary-dark to-brand-secondary overflow-hidden">
                    {project.imageUrl ? (
                      <InlineImageEditor
                        src={project.imageUrl}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        containerClassName="w-full h-full"
                        storageFolder="projects"
                        onReplace={async (url) => {
                          await updateDoc(doc(db, COLLECTIONS.PROJECTS, project.id), { imageUrl: url });
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-brand-primary/15 flex items-center justify-center group-hover:bg-brand-primary/25 transition-colors">
                          <Zap className="h-8 w-8 text-brand-primary/60" />
                        </div>
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge variant="primary" className="bg-white/90 text-brand-secondary-dark dark:bg-white/90 dark:text-brand-secondary-dark text-[11px]">{project.category}</Badge>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-base font-bold text-content-primary mb-2 group-hover:text-brand-primary transition-colors line-clamp-1">{project.title}</h3>
                    <p className="text-sm text-content-secondary leading-relaxed mb-4 flex-1 line-clamp-2">{project.description}</p>
                    {project.stats && Object.keys(project.stats).length > 0 && (
                      <div className="flex gap-4 pt-4 border-t border-line">
                        {Object.entries(project.stats).map(([key, value]) => (
                          <div key={key} className="text-center flex-1">
                            <div className="text-sm font-bold text-brand-primary">{value}</div>
                            <div className="text-[10px] text-content-tertiary uppercase tracking-wider capitalize">{key}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div variants={fadeUp} className="text-center mt-10">
            <Link to="/projects"><Button variant="outline" size="lg" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">{STRINGS.projects.viewAll}</Button></Link>
          </motion.div>
        </Section>
      </EditableSection>

      <EditModal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Project" onSave={handleAdd} saving={saving}>
        <Field label="Title"><FieldInput value={draft.title} onChange={(v) => setDraft(d => ({ ...d, title: v }))} placeholder="Project Title" /></Field>
        <Field label="Description"><FieldTextarea value={draft.description} onChange={(v) => setDraft(d => ({ ...d, description: v }))} rows={3} /></Field>
        <Field label="Category"><FieldInput value={draft.category} onChange={(v) => setDraft(d => ({ ...d, category: v }))} placeholder="Residential / Commercial" /></Field>
      </EditModal>

      {editItem && (
        <EditModal isOpen={!!editItem} onClose={() => setEditItem(null)} title="Edit Project" onSave={handleEdit} saving={saving}>
          <Field label="Title"><FieldInput value={editItem.title} onChange={(v) => setEditItem(e => e && { ...e, title: v })} /></Field>
          <Field label="Description"><FieldTextarea value={editItem.description} onChange={(v) => setEditItem(e => e && { ...e, description: v })} rows={3} /></Field>
          <Field label="Category"><FieldInput value={editItem.category} onChange={(v) => setEditItem(e => e && { ...e, category: v })} /></Field>
        </EditModal>
      )}
    </>
  );
}
