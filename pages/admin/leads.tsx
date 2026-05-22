import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Phone, Mail, MapPin, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/admin/data-table';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import { getDocuments, updateDocument, deleteDocument } from '@/firebase/firestore';
import { COLLECTIONS } from '@/firebase/collections';
import type { LeadDoc } from '@/types/admin';
import { fadeUp } from '@/animations/variants';
import toast from 'react-hot-toast';
import { orderBy } from 'firebase/firestore';

const statusOptions = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-green-500' },
  { value: 'converted', label: 'Converted', color: 'bg-purple-500' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-500' },
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<LeadDoc | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<LeadDoc | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    setLoading(true);
    try {
      const data = await getDocuments<LeadDoc>(COLLECTIONS.LEADS, [
        orderBy('createdAt', 'desc'),
      ]);
      setLeads(data);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }

  const handleStatusChange = async (lead: LeadDoc, status: LeadDoc['status']) => {
    try {
      await updateDocument(COLLECTIONS.LEADS, lead.id!, { status });
      setLeads((prev) =>
        prev.map((l) => (l.id === lead.id ? { ...l, status } : l))
      );
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm?.id) return;
    try {
      await deleteDocument(COLLECTIONS.LEADS, deleteConfirm.id);
      setLeads((prev) => prev.filter((l) => l.id !== deleteConfirm.id));
      toast.success('Lead deleted');
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete lead:', error);
      toast.error('Failed to delete lead');
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'City', 'Status', 'Date'];
    const rows = leads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.service || '',
      lead.city || '',
      lead.status,
      lead.createdAt ? format(lead.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredLeads =
    statusFilter === 'all'
      ? leads
      : leads.filter((l) => l.status === statusFilter);

  const columns: Column<LeadDoc>[] = [
    {
      key: 'name',
      label: 'Contact',
      render: (lead) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold">
            {lead.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{lead.name}</p>
            <p className="text-xs text-content-tertiary">{lead.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (lead) => (
        <a
          href={`tel:${lead.phone}`}
          className="text-brand-primary hover:underline"
        >
          {lead.phone}
        </a>
      ),
    },
    {
      key: 'service',
      label: 'Service',
      render: (lead) => lead.service || '-',
    },
    {
      key: 'status',
      label: 'Status',
      render: (lead) => {
        return (
          <select
            value={lead.status}
            onChange={(e) =>
              handleStatusChange(lead, e.target.value as LeadDoc['status'])
            }
            className="px-2 py-1 rounded-lg bg-surface-secondary border border-line text-sm cursor-pointer"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (lead) =>
        lead.createdAt
          ? format(lead.createdAt.toDate(), 'MMM d, yyyy')
          : '-',
    },
  ];

  return (
    <motion.div variants={fadeUp} initial="hidden" animate="visible">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-content-primary">
            Leads & Inquiries
          </h2>
          <p className="text-sm text-content-secondary">
            Manage customer inquiries and leads
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} icon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {statusOptions.map((status) => {
          const count = leads.filter((l) => l.status === status.value).length;
          return (
            <button
              key={status.value}
              onClick={() =>
                setStatusFilter(statusFilter === status.value ? 'all' : status.value)
              }
              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                statusFilter === status.value
                  ? 'border-brand-primary bg-brand-primary/5'
                  : 'border-line bg-surface-card hover:border-brand-primary/30'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status.color}`} />
                <span className="text-sm font-medium text-content-primary">
                  {status.label}
                </span>
              </div>
              <p className="text-2xl font-bold text-content-primary mt-1">{count}</p>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <DataTable
        data={filteredLeads}
        columns={columns}
        loading={loading}
        getItemId={(lead) => lead.id!}
        onEdit={(lead) => setSelectedLead(lead)}
        onDelete={(lead) => setDeleteConfirm(lead)}
        emptyMessage="No leads found"
      />

      {/* Lead Detail Modal */}
      {selectedLead && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedLead(null)}
        >
          <motion.div
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-card rounded-2xl shadow-xl max-w-lg w-full p-6 border border-line"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary text-2xl font-bold">
                {selectedLead.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-content-primary">
                  {selectedLead.name}
                </h3>
                <Badge variant="primary">{selectedLead.status}</Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-content-secondary">
                <Mail className="w-5 h-5 text-brand-primary" />
                <a href={`mailto:${selectedLead.email}`} className="hover:text-brand-primary">
                  {selectedLead.email}
                </a>
              </div>
              <div className="flex items-center gap-3 text-content-secondary">
                <Phone className="w-5 h-5 text-brand-primary" />
                <a href={`tel:${selectedLead.phone}`} className="hover:text-brand-primary">
                  {selectedLead.phone}
                </a>
              </div>
              {selectedLead.city && (
                <div className="flex items-center gap-3 text-content-secondary">
                  <MapPin className="w-5 h-5 text-brand-primary" />
                  <span>{selectedLead.city}</span>
                </div>
              )}
              {selectedLead.message && (
                <div className="flex items-start gap-3 text-content-secondary">
                  <MessageSquare className="w-5 h-5 text-brand-primary mt-0.5" />
                  <p>{selectedLead.message}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <a href={`tel:${selectedLead.phone}`} className="flex-1">
                <Button fullWidth variant="primary" icon={<Phone className="w-4 h-4" />}>
                  Call
                </Button>
              </a>
              <a href={`mailto:${selectedLead.email}`} className="flex-1">
                <Button fullWidth variant="outline" icon={<Mail className="w-4 h-4" />}>
                  Email
                </Button>
              </a>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Lead"
        message={`Are you sure you want to delete ${deleteConfirm?.name}'s inquiry? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </motion.div>
  );
}
