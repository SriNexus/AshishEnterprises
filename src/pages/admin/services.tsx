import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { ServiceDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminServicesPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<ServiceDoc | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    try {
      const data = await getDocuments<ServiceDoc>(COLLECTIONS.SERVICES, [
        orderBy('order', 'asc'),
      ]);
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.SERVICES, deleteConfirm.id);
      setServices((prev) => prev.filter((s) => s.id !== deleteConfirm.id));
      toast.success('Service deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete service');
    }
  };

  const handleTogglePublish = async (service: ServiceDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.SERVICES, service.id!, !service.isPublished);
      setServices((prev) =>
        prev.map((s) =>
          s.id === service.id ? { ...s, isPublished: !s.isPublished } : s
        )
      );
      toast.success(service.isPublished ? 'Service unpublished' : 'Service published');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns: Column<ServiceDoc>[] = [
    {
      key: 'title',
      label: 'Service',
      render: (service) => (
        <div>
          <p className="font-medium">{service.title}</p>
          <p className="text-xs text-content-tertiary">{service.slug}</p>
        </div>
      ),
    },
    {
      key: 'icon',
      label: 'Icon',
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (service) => <StatusBadge published={service.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Services</h2>
          <p className="text-sm text-content-secondary">Manage your services</p>
        </div>
        <Button onClick={() => navigate('/admin/services/new')} icon={<Plus className="w-4 h-4" />}>
          Add Service
        </Button>
      </div>

      <DataTable
        data={services}
        columns={columns}
        loading={loading}
        getItemId={(s) => s.id!}
        isPublished={(s) => s.isPublished ?? false}
        onEdit={(s) => navigate(`/admin/services/${s.id}`)}
        onDelete={(s) => setDeleteConfirm(s)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No services found"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message={`Delete "${deleteConfirm?.title}"?`}
        variant="danger"
      />
    </motion.div>
  );
}
