import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/ui/badge';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onTogglePublish?: (item: T) => void;
  getItemId: (item: T) => string;
  isPublished?: (item: T) => boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<T>({
  data,
  columns,
  loading,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  onEdit,
  onDelete,
  onTogglePublish,
  getItemId,
  isPublished,
  emptyMessage = 'No data found',
  pagination,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const getCellValue = (item: T, key: string): unknown => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value;
  };

  return (
    <div className="bg-surface-card rounded-2xl border border-line overflow-hidden">
      {/* Search Header */}
      {searchable && (
        <div className="p-4 border-b border-line">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-secondary border border-line max-w-sm">
            <Search className="w-4 h-4 text-content-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="flex-1 bg-transparent text-sm text-content-primary placeholder:text-content-tertiary focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line bg-surface-secondary">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-semibold text-content-secondary uppercase tracking-wider',
                    col.width
                  )}
                >
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete || onTogglePublish) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-content-secondary uppercase tracking-wider w-20">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center"
                >
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-primary" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-12 text-center text-content-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item) => {
                const id = getItemId(item);
                const published = isPublished?.(item);
                return (
                  <tr
                    key={id}
                    className="hover:bg-surface-secondary/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        className="px-4 py-3 text-sm text-content-primary"
                      >
                        {col.render
                          ? col.render(item)
                          : String(getCellValue(item, String(col.key)) ?? '-')}
                      </td>
                    ))}
                    {(onEdit || onDelete || onTogglePublish) && (
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() =>
                            setActiveMenu(activeMenu === id ? null : id)
                          }
                          className="p-1.5 rounded-lg hover:bg-surface-secondary transition-colors cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4 text-content-tertiary" />
                        </button>

                        <AnimatePresence>
                          {activeMenu === id && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="absolute right-4 top-full mt-1 z-10 bg-surface-card rounded-xl border border-line shadow-lg py-1 min-w-[140px]"
                            >
                              {onEdit && (
                                <button
                                  onClick={() => {
                                    setActiveMenu(null);
                                    onEdit(item);
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                              )}
                              {onTogglePublish && (
                                <button
                                  onClick={() => {
                                    setActiveMenu(null);
                                    onTogglePublish(item);
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-content-primary hover:bg-surface-secondary transition-colors cursor-pointer"
                                >
                                  {published ? (
                                    <>
                                      <EyeOff className="w-4 h-4" />
                                      Unpublish
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="w-4 h-4" />
                                      Publish
                                    </>
                                  )}
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => {
                                    setActiveMenu(null);
                                    onDelete(item);
                                  }}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-line">
          <p className="text-sm text-content-secondary">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-lg hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Status badge component
export function StatusBadge({ published }: { published: boolean }) {
  return (
    <Badge variant={published ? 'primary' : 'outline'}>
      {published ? 'Published' : 'Draft'}
    </Badge>
  );
}
