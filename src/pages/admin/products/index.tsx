import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable, StatusBadge, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, deleteDocument, togglePublishStatus } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { ProductDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<ProductDoc | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const data = await getDocuments<ProductDoc>(COLLECTIONS.PRODUCTS, [
        orderBy('createdAt', 'desc'),
      ]);
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (product: ProductDoc) => {
    navigate(`/admin/products/${product.id}`);
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.PRODUCTS, deleteConfirm.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      toast.success('Product deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const handleTogglePublish = async (product: ProductDoc) => {
    const newStatus = !product.isPublished;
    try {
      await togglePublishStatus(COLLECTIONS.PRODUCTS, product.id!, newStatus);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === product.id ? { ...p, isPublished: newStatus } : p
        )
      );
      toast.success(newStatus ? 'Product published' : 'Product unpublished');
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      toast.error('Failed to update status');
    }
  };

  const columns: Column<ProductDoc>[] = [
    {
      key: 'name',
      label: 'Product',
      render: (product) => (
        <div className="flex items-center gap-3">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-surface-secondary flex items-center justify-center text-content-tertiary">
              📦
            </div>
          )}
          <div>
            <p className="font-medium">{product.name}</p>
            <p className="text-xs text-content-tertiary">{product.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'brand',
      label: 'Brand',
      render: (product) => product.brand || '-',
    },
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'isPublished',
      label: 'Status',
      render: (product) => <StatusBadge published={product.isPublished ?? false} />,
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">Products</h2>
          <p className="text-sm text-content-secondary">
            Manage your product catalog
          </p>
        </div>
        <Button
          onClick={() => navigate('/admin/panel/products/new')}
          icon={<Plus className="w-4 h-4" />}
        >
          Add Product
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={products}
        columns={columns}
        loading={loading}
        getItemId={(product) => product.id!}
        isPublished={(product) => product.isPublished ?? false}
        onEdit={handleEdit}
        onDelete={(product) => setDeleteConfirm(product)}
        onTogglePublish={handleTogglePublish}
        emptyMessage="No products found. Add your first product!"
        searchPlaceholder="Search products..."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </motion.div>
  );
}
