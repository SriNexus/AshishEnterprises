import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { TestimonialDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminTestimonialsPage() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<TestimonialDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<TestimonialDoc | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  async function fetchTestimonials() {
    setLoading(true);
    try {
      const data = await getDocuments<TestimonialDoc>(COLLECTIONS.TESTIMONIALS, [
        orderBy('createdAt', 'desc'),
      ]);
      setTestimonials(data);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.TESTIMONIALS, deleteConfirm.id);
      setTestimonials((prev) => prev.filter((t) => t.id !== deleteConfirm.id));
      toast.success('Testimonial deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleTogglePublish = async (testimonial: TestimonialDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.TESTIMONIALS, testimonial.id!, !testimonial.isPublished);
      setTestimonials((prev) =>
        prev.map((t) =>
          t.id === testimonial.id ? { ...t, isPublished: !t.isPublished } : t
        )
      );
      toast.success(testimonial.isPublished ? 'Testimonial unpublished' : 'Testimonial published');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns: Column<TestimonialDoc>[] = [
    {
      key: 'name',
      label: 'Customer',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
            {t.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium">{t.name}</p>
            <p className="text-xs text-content-tertiary">{t.role}, {t.company}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (t) => (
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < t.rating ? 'text-yellow-500 fill-yellow-500' : 'text-content-tertiary'}`}
            />
          ))}
        </div>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (t) => t.featured ? <Badge variant="primary">Yes</Badge> : '-',
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (t) => <StatusBadge published={t.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Testimonials</h2>
          <p className="text-sm text-content-secondary">Manage customer reviews</p>
        </div>
        <Button onClick={() => navigate('/admin/panel/testimonials/new')} icon={<Plus className="w-4 h-4" />}>
          Add Testimonial
        </Button>
      </div>

      <DataTable
        data={testimonials}
        columns={columns}
        loading={loading}
        getItemId={(t) => t.id!}
        isPublished={(t) => t.isPublished ?? false}
        onEdit={(t) => navigate(`/admin/testimonials/${t.id}`)}
        onDelete={(t) => setDeleteConfirm(t)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No testimonials found"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Testimonial"
        message={`Delete testimonial from "${deleteConfirm?.name}"?`}
        variant="danger"
      />
    </motion.div>
  );
}
