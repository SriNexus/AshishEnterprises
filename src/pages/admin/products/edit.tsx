import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocument, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import { useAdminStore } from '@/store/admin-store';
import type { ProductDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  featured: z.boolean(),
  isPublished: z.boolean(),
});

type ProductFormData = z.infer<typeof productSchema>;

const categoryOptions = [
  { value: 'solar-panels', label: 'Solar Panels' },
  { value: 'inverters', label: 'Inverters' },
  { value: 'batteries', label: 'Batteries' },
  { value: 'street-lights', label: 'Street Lights' },
  { value: 'water-heaters', label: 'Water Heaters' },
  { value: 'accessories', label: 'Accessories' },
];

export default function AdminProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAdminStore();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      category: '',
      brand: '',
      description: '',
      featured: false,
      isPublished: false,
    },
  });

  useEffect(() => {
    if (!isNew && id) {
      fetchProduct(id);
    }
  }, [id, isNew]);

  async function fetchProduct(productId: string) {
    setLoading(true);
    try {
      const product = await getDocument<ProductDoc>(COLLECTIONS.PRODUCTS, productId);
      if (product) {
        reset({
          name: product.name,
          category: product.category,
          brand: product.brand || '',
          description: product.description,
          featured: product.featured,
          isPublished: product.isPublished ?? false,
        });
        setImages(product.images || []);
        setSpecifications(
          Object.entries(product.specifications || {}).map(([key, value]) => ({
            key,
            value,
          }))
        );
      } else {
        toast.error('Product not found');
        navigate('/admin/panel/products');
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Failed to load product');
      navigate('/admin/panel/products');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const productData: Partial<ProductDoc> = {
        ...data,
        images,
        specifications: specifications.reduce(
          (acc, { key, value }) => (key ? { ...acc, [key]: value } : acc),
          {}
        ),
      };

      if (isNew) {
        await createDocument(COLLECTIONS.PRODUCTS, productData, user?.uid);
        toast.success('Product created');
      } else {
        await updateDocument(COLLECTIONS.PRODUCTS, id!, productData);
        toast.success('Product updated');
      }
      navigate('/admin/panel/products');
    } catch (error) {
      console.error('Failed to save product:', error);
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.PRODUCTS, id);
      toast.success('Product deleted');
      navigate('/admin/panel/products');
    } catch (error) {
      console.error('Failed to delete product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specifications];
    updated[index][field] = value;
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/admin/panel/products')}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                {isNew ? 'Add Product' : 'Edit Product'}
              </h2>
              <p className="text-sm text-content-secondary">
                {isNew ? 'Create a new product' : 'Update product details'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isNew && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirm(true)}
                icon={<Trash2 className="w-4 h-4" />}
                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
              >
                Delete
              </Button>
            )}
            <Button
              type="submit"
              isLoading={saving}
              icon={<Save className="w-4 h-4" />}
            >
              {isNew ? 'Create Product' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Basic Information
              </h3>
              <div className="space-y-4">
                <Input
                  label="Product Name"
                  placeholder="e.g., Mono PERC 540W Panel"
                  error={errors.name?.message}
                  {...register('name')}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <Select
                    label="Category"
                    options={categoryOptions}
                    error={errors.category?.message}
                    {...register('category')}
                  />
                  <Input
                    label="Brand"
                    placeholder="e.g., Tata Solar"
                    {...register('brand')}
                  />
                </div>
                <Textarea
                  label="Description"
                  placeholder="Describe the product..."
                  error={errors.description?.message}
                  {...register('description')}
                />
              </div>
            </Card>

            {/* Specifications */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-content-primary">
                  Specifications
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecification}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Spec
                </Button>
              </div>
              <div className="space-y-3">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Input
                      placeholder="Key (e.g., Efficiency)"
                      value={spec.key}
                      onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value (e.g., 21.5%)"
                      value={spec.value}
                      onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {specifications.length === 0 && (
                  <p className="text-sm text-content-tertiary text-center py-4">
                    No specifications added yet
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Publish Settings
              </h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('isPublished')}
                    className="w-4 h-4 rounded border-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-content-primary">Published</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('featured')}
                    className="w-4 h-4 rounded border-line text-brand-primary focus:ring-brand-primary"
                  />
                  <span className="text-sm text-content-primary">Featured Product</span>
                </label>
              </div>
            </Card>

            {/* Images */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Product Images
              </h3>
              <ImageUpload
                value={images}
                onChange={(urls) => setImages(Array.isArray(urls) ? urls : [urls])}
                folder="products"
                multiple
                maxFiles={5}
              />
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </motion.div>
  );
}
