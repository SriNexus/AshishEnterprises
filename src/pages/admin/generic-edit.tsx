import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocument, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { CollectionName } from '@/firebase/collections';
import { useAdminStore } from '@/store/admin-store';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

// Map route prefixes to collection names and configurations
const MODULE_CONFIG: Record<string, {
  collection: CollectionName;
  label: string;
  backPath: string;
  fields: { name: string; label: string; type: 'text' | 'textarea' | 'richtext' | 'number' | 'toggle' | 'list' | 'image' | 'specs'; required?: boolean }[];
}> = {
  services: {
    collection: COLLECTIONS.SERVICES,
    label: 'Service',
    backPath: '/admin/services',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'icon', label: 'Icon Name (Lucide)', type: 'text' },
      { name: 'image', label: 'Image', type: 'image' },
      { name: 'features', label: 'Features', type: 'list' },
      { name: 'benefits', label: 'Benefits', type: 'list' },
      { name: 'process', label: 'Process Steps', type: 'list' },
      { name: 'specs', label: 'Specifications', type: 'specs' },
      { name: 'isPublished', label: 'Published', type: 'toggle' },
    ],
  },
  projects: {
    collection: COLLECTIONS.PROJECTS,
    label: 'Project',
    backPath: '/admin/projects',
    fields: [
      { name: 'title', label: 'Title', type: 'text', required: true },
      { name: 'slug', label: 'Slug', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'client', label: 'Client', type: 'text' },
      { name: 'image', label: 'Images', type: 'image' },
      { name: 'stats', label: 'Stats (capacity, savings, etc.)', type: 'specs' },
      { name: 'featured', label: 'Featured', type: 'toggle' },
      { name: 'isPublished', label: 'Published', type: 'toggle' },
    ],
  },
  testimonials: {
    collection: COLLECTIONS.TESTIMONIALS,
    label: 'Testimonial',
    backPath: '/admin/testimonials',
    fields: [
      { name: 'name', label: 'Customer Name', type: 'text', required: true },
      { name: 'role', label: 'Role / Title', type: 'text' },
      { name: 'company', label: 'Company', type: 'text' },
      { name: 'content', label: 'Review Content', type: 'textarea', required: true },
      { name: 'rating', label: 'Rating (1-5)', type: 'number' },
      { name: 'avatarUrl', label: 'Avatar Image', type: 'image' },
      { name: 'featured', label: 'Featured', type: 'toggle' },
      { name: 'isPublished', label: 'Published', type: 'toggle' },
    ],
  },
  faq: {
    collection: COLLECTIONS.FAQ,
    label: 'FAQ',
    backPath: '/admin/faq',
    fields: [
      { name: 'question', label: 'Question', type: 'text', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      { name: 'category', label: 'Category', type: 'text' },
      { name: 'isPublished', label: 'Published', type: 'toggle' },
    ],
  },
};

export default function GenericEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAdminStore();
  const isNew = id === 'new';

  // Determine which module we're editing from the URL
  const pathSegments = location.pathname.split('/');
  const moduleKey = pathSegments[2]; // /admin/[services]/123
  const config = MODULE_CONFIG[moduleKey];

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [, setFormData] = useState<Record<string, unknown>>({});
  const [imageUrl, setImageUrl] = useState('');
  const [listFields, setListFields] = useState<Record<string, string[]>>({});
  const [specFields, setSpecFields] = useState<Record<string, { key: string; value: string }[]>>({});

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isNew && id && config) fetchDoc(id);
  }, [id, isNew]);

  async function fetchDoc(docId: string) {
    setLoading(true);
    try {
      const doc = await getDocument<Record<string, unknown>>(config.collection, docId);
      if (doc) {
        setFormData(doc);
        reset(doc);
        // Extract image
        if (doc.image) setImageUrl(doc.image as string);
        if (doc.avatarUrl) setImageUrl(doc.avatarUrl as string);
        // Extract list fields
        const lists: Record<string, string[]> = {};
        const specs: Record<string, { key: string; value: string }[]> = {};
        config.fields.forEach(f => {
          if (f.type === 'list' && Array.isArray(doc[f.name])) {
            lists[f.name] = doc[f.name] as string[];
          }
          if (f.type === 'specs' && typeof doc[f.name] === 'object' && doc[f.name] !== null) {
            specs[f.name] = Object.entries(doc[f.name] as Record<string, string>).map(([key, value]) => ({ key, value }));
          }
        });
        setListFields(lists);
        setSpecFields(specs);
      } else {
        toast.error(`${config.label} not found`);
        navigate(config.backPath);
      }
    } catch (error) {
      toast.error('Failed to load');
      navigate(config.backPath);
    } finally {
      setLoading(false);
    }
  }

  if (!config) {
    navigate('/admin');
    return null;
  }

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = { ...data };
      // Add image fields
      const imageField = config.fields.find(f => f.type === 'image');
      if (imageField) {
        if (imageField.name === 'avatarUrl') payload.avatarUrl = imageUrl;
        else payload.image = imageUrl;
      }
      // Add list fields
      Object.entries(listFields).forEach(([key, values]) => {
        payload[key] = values.filter(v => v.trim());
      });
      // Add spec fields
      Object.entries(specFields).forEach(([key, pairs]) => {
        payload[key] = pairs.reduce((acc, { key: k, value: v }) => k ? { ...acc, [k]: v } : acc, {});
      });
      // Ensure toggles are boolean
      config.fields.filter(f => f.type === 'toggle').forEach(f => {
        payload[f.name] = !!payload[f.name];
      });
      // Ensure number fields
      config.fields.filter(f => f.type === 'number').forEach(f => {
        payload[f.name] = Number(payload[f.name]) || 0;
      });

      if (isNew) {
        await createDocument(config.collection, payload, user?.uid);
        toast.success(`${config.label} created`);
      } else {
        await updateDocument(config.collection, id!, payload);
        toast.success(`${config.label} updated`);
      }
      navigate(config.backPath);
    } catch (error) {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDocument(config.collection, id);
      toast.success(`${config.label} deleted`);
      navigate(config.backPath);
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  // List field helpers
  const addListItem = (fieldName: string) => {
    setListFields(prev => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), ''] }));
  };
  const updateListItem = (fieldName: string, index: number, value: string) => {
    setListFields(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).map((v, i) => i === index ? value : v),
    }));
  };
  const removeListItem = (fieldName: string, index: number) => {
    setListFields(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index),
    }));
  };

  // Spec field helpers
  const addSpecItem = (fieldName: string) => {
    setSpecFields(prev => ({ ...prev, [fieldName]: [...(prev[fieldName] || []), { key: '', value: '' }] }));
  };
  const updateSpecItem = (fieldName: string, index: number, field: 'key' | 'value', value: string) => {
    setSpecFields(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).map((s, i) => i === index ? { ...s, [field]: value } : s),
    }));
  };
  const removeSpecItem = (fieldName: string, index: number) => {
    setSpecFields(prev => ({
      ...prev,
      [fieldName]: (prev[fieldName] || []).filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" /></div>;
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => navigate(config.backPath)} className="p-2 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-content-primary">{isNew ? `Add ${config.label}` : `Edit ${config.label}`}</h2>
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button type="button" variant="outline" onClick={() => setDeleteConfirm(true)}
                icon={<Trash2 className="w-4 h-4" />} className="text-red-500 border-red-500/30 hover:bg-red-500/10">
                Delete
              </Button>
            )}
            <Button type="submit" isLoading={saving} icon={<Save className="w-4 h-4" />}>
              {isNew ? 'Create' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-6 max-w-3xl">
          {config.fields.map(field => (
            <Card key={field.name} padding="md">
              {field.type === 'text' && (
                <Input label={field.label} {...register(field.name, field.required ? { required: `${field.label} is required` } : {})}
                  error={(errors[field.name]?.message as string) || undefined} />
              )}
              {field.type === 'number' && (
                <Input label={field.label} type="number" {...register(field.name)} />
              )}
              {field.type === 'textarea' && (
                <div>
                  <label className="block text-sm font-medium text-content-primary mb-1.5">{field.label}</label>
                  <textarea className="w-full rounded-xl border border-line bg-surface-primary px-4 py-3 text-sm text-content-primary focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none resize-none"
                    rows={4} {...register(field.name, field.required ? { required: `${field.label} is required` } : {})} />
                </div>
              )}
              {field.type === 'toggle' && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register(field.name)} className="w-4 h-4 rounded border-line text-brand-primary focus:ring-brand-primary" />
                  <span className="text-sm font-medium text-content-primary">{field.label}</span>
                </label>
              )}
              {field.type === 'image' && (
                <div>
                  <label className="block text-sm font-medium text-content-primary mb-1.5">{field.label}</label>
                  <ImageUpload value={imageUrl} onChange={url => setImageUrl(Array.isArray(url) ? url[0] : url)} folder={moduleKey} />
                </div>
              )}
              {field.type === 'list' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-content-primary">{field.label}</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addListItem(field.name)} icon={<Plus className="w-3 h-3" />}>Add</Button>
                  </div>
                  <div className="space-y-2">
                    {(listFields[field.name] || []).map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={item} onChange={e => updateListItem(field.name, i, e.target.value)} placeholder={`${field.label} ${i + 1}`} className="flex-1" />
                        <button type="button" onClick={() => removeListItem(field.name, i)} className="p-2 hover:bg-red-500/10 rounded text-red-500 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(listFields[field.name] || []).length === 0 && <p className="text-xs text-content-tertiary">No items added</p>}
                  </div>
                </div>
              )}
              {field.type === 'specs' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-content-primary">{field.label}</label>
                    <Button type="button" variant="outline" size="sm" onClick={() => addSpecItem(field.name)} icon={<Plus className="w-3 h-3" />}>Add</Button>
                  </div>
                  <div className="space-y-2">
                    {(specFields[field.name] || []).map((spec, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={spec.key} onChange={e => updateSpecItem(field.name, i, 'key', e.target.value)} placeholder="Key" className="flex-1" />
                        <Input value={spec.value} onChange={e => updateSpecItem(field.name, i, 'value', e.target.value)} placeholder="Value" className="flex-1" />
                        <button type="button" onClick={() => removeSpecItem(field.name, i)} className="p-2 hover:bg-red-500/10 rounded text-red-500 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {(specFields[field.name] || []).length === 0 && <p className="text-xs text-content-tertiary">No entries</p>}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </form>

      <ConfirmDialog isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} onConfirm={handleDelete}
        title={`Delete ${config.label}`} message="This action cannot be undone." confirmText="Delete" variant="danger" loading={deleting} />
    </motion.div>
  );
}
