import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/admin/image-upload';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { Spinner } from '@/components/ui/spinner';
import { getDocuments, createDocument, updateDocument, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { TeamDoc } from '@/types/admin';
import { fadeUp, staggerContainer } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminTeamPage() {
  const [members, setMembers] = useState<TeamDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<TeamDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [memberImage, setMemberImage] = useState('');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<TeamDoc>>();

  useEffect(() => { fetchMembers(); }, []);

  async function fetchMembers() {
    setLoading(true);
    try {
      const data = await getDocuments<TeamDoc>(COLLECTIONS.TEAM, [orderBy('order', 'asc')]);
      setMembers(data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  }

  const openEdit = (member: TeamDoc) => {
    setEditingId(member.id!);
    setMemberImage(member.image || '');
    reset({
      name: member.name,
      role: member.role,
      designation: member.designation,
      bio: member.bio,
      experience: member.experience,
      featured: member.featured,
      isPublished: member.isPublished,
      socialLinks: member.socialLinks,
    });
    setShowForm(true);
  };

  const openNew = () => {
    setEditingId(null);
    setMemberImage('');
    reset({ name: '', role: '', designation: '', bio: '', experience: '', featured: false, isPublished: true });
    setShowForm(true);
  };

  const onSubmit = async (data: Partial<TeamDoc>) => {
    setSaving(true);
    try {
      const payload = { ...data, image: memberImage, order: members.length };
      if (editingId) {
        await updateDocument(COLLECTIONS.TEAM, editingId, payload);
        toast.success('Team member updated');
      } else {
        await createDocument(COLLECTIONS.TEAM, payload);
        toast.success('Team member added');
      }
      setShowForm(false);
      fetchMembers();
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.TEAM, deleteConfirm.id);
      setMembers(prev => prev.filter(m => m.id !== deleteConfirm.id));
      toast.success('Member deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleToggle = async (member: TeamDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.TEAM, member.id!, !member.isPublished);
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, isPublished: !m.isPublished } : m));
      toast.success(member.isPublished ? 'Hidden' : 'Published');
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Team</h2>
          <p className="text-sm text-content-secondary">Manage team members</p>
        </div>
        <Button onClick={openNew} icon={<UserPlus className="w-4 h-4" />}>Add Member</Button>
      </div>

      {members.length === 0 ? (
        <Card className="text-center py-12"><p className="text-content-secondary">No team members yet</p></Card>
      ) : (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(member => (
            <motion.div key={member.id} variants={fadeUp}>
              <Card padding="md" className="relative group">
                {!member.isPublished && (
                  <div className="absolute top-3 right-3"><Badge variant="outline">Draft</Badge></div>
                )}
                <div className="flex items-center gap-4 mb-3">
                  {member.image ? (
                    <img src={member.image} alt={member.name} className="w-14 h-14 rounded-full object-cover" />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-lg">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-content-primary">{member.name}</h4>
                    <p className="text-sm text-brand-primary">{member.designation}</p>
                    {member.experience && <p className="text-xs text-content-tertiary">{member.experience}</p>}
                  </div>
                </div>
                {member.bio && <p className="text-xs text-content-secondary line-clamp-2 mb-3">{member.bio}</p>}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(member)} className="flex-1">Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => handleToggle(member)} className="flex-1">
                    {member.isPublished ? 'Hide' : 'Publish'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteConfirm(member)} className="text-red-500 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Edit/Add Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface-card rounded-2xl shadow-xl max-w-lg w-full p-6 border border-line max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-content-primary">{editingId ? 'Edit Member' : 'Add Member'}</h3>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-surface-secondary cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="flex justify-center mb-4">
                  <ImageUpload value={memberImage} onChange={url => setMemberImage(Array.isArray(url) ? url[0] : url)} folder="team" />
                </div>
                <Input label="Full Name" placeholder="John Doe" {...register('name', { required: 'Required' })} error={errors.name?.message} />
                <Input label="Designation" placeholder="e.g., Chief Engineer" {...register('designation', { required: 'Required' })} error={errors.designation?.message} />
                <Input label="Role" placeholder="e.g., Engineering Lead" {...register('role')} />
                <Input label="Experience" placeholder="e.g., 15+ years" {...register('experience')} />
                <Textarea label="Bio" placeholder="Brief bio..." {...register('bio')} />
                <Input label="LinkedIn URL" placeholder="https://linkedin.com/in/..." {...register('socialLinks.linkedin')} />
                <Input label="Email" placeholder="john@company.com" {...register('socialLinks.email')} />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('isPublished')} className="w-4 h-4 rounded border-line text-brand-primary" />
                    <span className="text-sm">Published</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" {...register('featured')} className="w-4 h-4 rounded border-line text-brand-primary" />
                    <span className="text-sm">Featured</span>
                  </label>
                </div>
                <Button type="submit" fullWidth isLoading={saving} icon={<Save className="w-4 h-4" />}>
                  {editingId ? 'Update Member' : 'Add Member'}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete Member" message={`Delete ${deleteConfirm?.name}?`} variant="danger" />
    </motion.div>
  );
}
