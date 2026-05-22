import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { ProjectDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectDoc | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoading(true);
    try {
      const data = await getDocuments<ProjectDoc>(COLLECTIONS.PROJECTS, [
        orderBy('createdAt', 'desc'),
      ]);
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.PROJECTS, deleteConfirm.id);
      setProjects((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      toast.success('Project deleted');
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleTogglePublish = async (project: ProjectDoc) => {
    try {
      await togglePublishStatus(COLLECTIONS.PROJECTS, project.id!, !project.isPublished);
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, isPublished: !p.isPublished } : p
        )
      );
      toast.success(project.isPublished ? 'Project unpublished' : 'Project published');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const columns: Column<ProjectDoc>[] = [
    {
      key: 'title',
      label: 'Project',
      render: (project) => (
        <div className="flex items-center gap-3">
          {project.images?.[0] ? (
            <img src={project.images[0]} alt="" className="w-12 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-12 h-8 rounded-lg bg-surface-secondary" />
          )}
          <div>
            <p className="font-medium">{project.title}</p>
            <p className="text-xs text-content-tertiary">{project.location || 'No location'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (project) => <Badge variant="outline">{project.category}</Badge>,
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (project) => project.featured ? <Badge variant="primary">Yes</Badge> : '-',
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (project) => <StatusBadge published={project.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Projects</h2>
          <p className="text-sm text-content-secondary">Manage your portfolio</p>
        </div>
        <Button onClick={() => navigate('/admin/projects/new')} icon={<Plus className="w-4 h-4" />}>
          Add Project
        </Button>
      </div>

      <DataTable
        data={projects}
        columns={columns}
        loading={loading}
        getItemId={(p) => p.id!}
        isPublished={(p) => p.isPublished ?? false}
        onEdit={(p) => navigate(`/admin/projects/${p.id}`)}
        onDelete={(p) => setDeleteConfirm(p)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No projects found"
      />

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Delete "${deleteConfirm?.title}"?`}
        variant="danger"
      />
    </motion.div>
  );
}
