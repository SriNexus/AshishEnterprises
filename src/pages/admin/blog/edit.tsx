import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';
import { RichTextEditor } from '@/components/admin/rich-text-editor';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocument, createDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import { useAdminStore } from '@/store/admin-store';
import type { BlogPostDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';

const blogSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  slug: z.string().min(3, 'Slug is required'),
  excerpt: z.string().min(20, 'Excerpt must be at least 20 characters'),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  author: z.string().min(2, 'Author is required'),
  readTime: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  isPublished: z.boolean(),
});

type BlogFormData = z.infer<typeof blogSchema>;

const categoryOptions = [
  { value: 'solar-education', label: 'Solar Education' },
  { value: 'subsidies', label: 'Subsidies & Incentives' },
  { value: 'maintenance', label: 'Maintenance Tips' },
  { value: 'technology', label: 'Technology' },
  { value: 'business', label: 'Business' },
  { value: 'news', label: 'News' },
];

export default function AdminBlogEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, adminData } = useAdminStore();
  const isNew = id === 'new';

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: '',
      author: adminData?.displayName || '',
      readTime: '',
      seoTitle: '',
      seoDescription: '',
      isPublished: false,
    },
  });

  const title = watch('title');

  // Auto-generate slug from title
  useEffect(() => {
    if (isNew && title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [title, isNew, setValue]);

  useEffect(() => {
    if (!isNew && id) {
      fetchPost(id);
    }
  }, [id, isNew]);

  async function fetchPost(postId: string) {
    setLoading(true);
    try {
      const post = await getDocument<BlogPostDoc>(COLLECTIONS.BLOG_POSTS, postId);
      if (post) {
        reset({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          author: post.author,
          readTime: post.readTime || '',
          seoTitle: post.seoTitle || '',
          seoDescription: post.seoDescription || '',
          isPublished: post.isPublished ?? false,
        });
        setFeaturedImage(post.featuredImage || '');
        setTags(post.tags || []);
      } else {
        toast.error('Post not found');
        navigate('/admin/blog');
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      toast.error('Failed to load post');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = async (data: BlogFormData) => {
    setSaving(true);
    try {
      const postData: Partial<BlogPostDoc> = {
        ...data,
        featuredImage: featuredImage || undefined,
        tags,
      };

      if (isNew) {
        await createDocument(COLLECTIONS.BLOG_POSTS, postData, user?.uid);
        toast.success('Post created');
      } else {
        await updateDocument(COLLECTIONS.BLOG_POSTS, id!, postData);
        toast.success('Post updated');
      }
      navigate('/admin/blog');
    } catch (error) {
      console.error('Failed to save post:', error);
      toast.error('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteDocument(COLLECTIONS.BLOG_POSTS, id);
      toast.success('Post deleted');
      navigate('/admin/blog');
    } catch (error) {
      console.error('Failed to delete post:', error);
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  const addTag = () => {
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
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
              onClick={() => navigate('/admin/blog')}
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-content-primary">
                {isNew ? 'New Post' : 'Edit Post'}
              </h2>
              <p className="text-sm text-content-secondary">
                {isNew ? 'Create a new blog post' : 'Update post content'}
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
              {isNew ? 'Publish' : 'Save Changes'}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <div className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Enter post title..."
                  error={errors.title?.message}
                  {...register('title')}
                />
                <Input
                  label="Slug"
                  placeholder="post-url-slug"
                  error={errors.slug?.message}
                  {...register('slug')}
                />
                <Textarea
                  label="Excerpt"
                  placeholder="Brief summary of the post..."
                  error={errors.excerpt?.message}
                  {...register('excerpt')}
                />
              </div>
            </Card>

            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Content
              </h3>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start writing your post..."
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-2">{errors.content.message}</p>
              )}
            </Card>

            {/* SEO Settings */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                SEO Settings
              </h3>
              <div className="space-y-4">
                <Input
                  label="SEO Title"
                  placeholder="Custom title for search engines (optional)"
                  {...register('seoTitle')}
                />
                <Textarea
                  label="SEO Description"
                  placeholder="Meta description for search engines (optional)"
                  {...register('seoDescription')}
                />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Publish
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
                <Select
                  label="Category"
                  options={categoryOptions}
                  error={errors.category?.message}
                  {...register('category')}
                />
                <Input
                  label="Author"
                  placeholder="Author name"
                  error={errors.author?.message}
                  {...register('author')}
                />
                <Input
                  label="Read Time"
                  placeholder="e.g., 5 min read"
                  {...register('readTime')}
                />
              </div>
            </Card>

            {/* Featured Image */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">
                Featured Image
              </h3>
              <ImageUpload
                value={featuredImage}
                onChange={(url) => setFeaturedImage(Array.isArray(url) ? url[0] : url)}
                folder="blog"
              />
            </Card>

            {/* Tags */}
            <Card padding="lg">
              <h3 className="font-semibold text-content-primary mb-4">Tags</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-secondary text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="p-0.5 hover:bg-red-500/20 rounded cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm}
        onClose={() => setDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </motion.div>
  );
}
