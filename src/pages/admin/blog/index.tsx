import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { BlogPostDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminBlogPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPostDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<BlogPostDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await getDocuments<BlogPostDoc>(COLLECTIONS.BLOG_POSTS, [
        orderBy('createdAt', 'desc'),
      ]);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      toast.error('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (post: BlogPostDoc) => {
    navigate(`/admin/blog/${post.id}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.BLOG_POSTS, deleteConfirm.id);
      setPosts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      toast.success('Post deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (post: BlogPostDoc) => {
    const newStatus = !post.isPublished;
    try {
      await togglePublishStatus(COLLECTIONS.BLOG_POSTS, post.id!, newStatus);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, isPublished: newStatus } : p
        )
      );
      toast.success(newStatus ? 'Post published' : 'Post unpublished');
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast.error('Failed to update status');
    }
  };

  const columns: Column<BlogPostDoc>[] = [
    {
      key: 'title',
      label: 'Post',
      render: (post) => (
        <div className="flex items-center gap-3">
          {post.featuredImage ? (
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-12 h-8 rounded-lg object-cover"
            />
          ) : (
            <div className="w-12 h-8 rounded-lg bg-surface-secondary flex items-center justify-center text-content-tertiary text-xs">
              📝
            </div>
          )}
          <div>
            <p className="font-medium line-clamp-1">{post.title}</p>
            <p className="text-xs text-content-tertiary line-clamp-1">
              {post.excerpt}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (post) => <Badge variant="outline">{post.category}</Badge>,
    },
    {
      key: 'author',
      label: 'Author',
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (post) => (
        <div className="text-sm">
          <div className="flex items-center gap-1 text-content-secondary">
            <Calendar className="w-3 h-3" />
            {post.createdAt
              ? format(post.createdAt.toDate(), 'MMM d, yyyy')
              : '-'}
          </div>
          {post.readTime && (
            <div className="flex items-center gap-1 text-xs text-content-tertiary mt-0.5">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (post) => <StatusBadge published={post.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Blog Posts</h2>
          <p className="text-sm text-content-secondary">
            Manage your blog content
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/panel/blog/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          New Post
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={posts}
        columns={columns}
        loading={loading}
        getItemId={(post) => post.id!}
        isPublished={(post) => post.isPublished ?? false}
        onEdit={handleEdit}
        onDelete={(post) => setDeleteConfirm(post)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No blog posts found. Write your first post!"
        searchPlaceholder="Search posts..."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteConfirm?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </motion.div>
  );
}
