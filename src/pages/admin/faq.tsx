import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { FAQDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminFAQPage() {
  const navigate = useNavigate();
  const [faqs, setFaqs] = useState<FAQDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<FAQDoc | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  async function fetchFAQs() {
    setLoading(true);
    try {
      const data = await getDocuments<FAQDoc>(COLLECTIONS.FAQ, [
        orderBy('order', 'asc'),
      ]);
      setFaqs(data);
    } catch (error) {
      toast.error('Failed to load FAQs');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.FAQ, deleteConfirm.id);
      setFaqs((prev) => prev.filter((f) => f.id !== deleteConfirm.id));
      toast.success('FAQ deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleTogglePublish = async (faq: FAQDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.FAQ, faq.id!, !faq.isPublished);
      setFaqs((prev) =>
        prev.map((f) =>
          f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f
        )
      );
      toast.success(faq.isPublished ? 'FAQ unpublished' : 'FAQ published');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns: Column<FAQDoc>[] = [
    {
      key: 'question',
      label: 'Question',
      render: (faq) => (
        <div>
          <p className="font-medium line-clamp-1">{faq.question}</p>
          <p className="text-xs text-content-tertiary line-clamp-1">{faq.answer}</p>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (faq) => faq.category || 'General',
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (faq) => <StatusBadge published={faq.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">FAQ</h2>
          <p className="text-sm text-content-secondary">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => navigate('/admin/panel/faq/new')} icon={<Plus className="w-4 h-4" />}>
          Add FAQ
        </Button>
      </div>

      <DataTable
        data={faqs}
        columns={columns}
        loading={loading}
        getItemId={(f) => f.id!}
        isPublished={(f) => f.isPublished ?? false}
        onEdit={(f) => navigate(`/admin/faq/${f.id}`)}
        onDelete={(f) => setDeleteConfirm(f)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No FAQs found"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete FAQ"
        message="Delete this FAQ?"
        variant="danger"
      />
    </motion.div>
  );
}
