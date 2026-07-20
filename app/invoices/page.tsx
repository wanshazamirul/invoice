'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice, InvoiceStatus } from '@/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAlert } from '@/contexts/alert-context';
import {
  Plus,
  FileText,
  Calendar,
  Users,
  MoreHorizontal,
  Download,
  Trash2,
  Copy,
  FileOutput,
  Mail,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/helpers';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { PaymentDialog } from '@/components/payment-dialog';
import { EmailDialog } from '@/components/email-dialog';

type Tab = 'all' | InvoiceStatus;

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'draft', label: 'Draft' },
  { key: 'paid', label: 'Paid' },
  { key: 'partial', label: 'Partial' },
];

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-l-warning',
  overdue: 'border-l-destructive',
  draft: 'border-l-muted-foreground/40',
  paid: 'border-l-success',
  partial: 'border-l-info',
};

export default function InvoicesPage() {
  const { invoices, loadData, deleteInvoice, settings, addInvoice, generateInvoiceNumber } = useStore();
  const router = useRouter();
  const { success, error: showError } = useAlert();
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => { loadData(); }, [loadData]);

  const filtered =
    tab === 'all' ? invoices : invoices.filter((i) => i.status === tab);

  const counts = TABS.reduce(
    (acc, t) => {
      acc[t.key] = t.key === 'all' ? invoices.length : invoices.filter((i) => i.status === t.key).length;
      return acc;
    },
    {} as Record<string, number>
  );

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) {
      deleteInvoice(id);
      success('Deleted', 'Invoice removed.');
    }
  };

  const handleCopy = (inv: Invoice) => {
    addInvoice({
      ...inv,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(inv.type),
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft' as const,
      paidAmount: 0,
      paidDate: undefined,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    success('Copied', 'Duplicate created as draft.');
  };

  const refresh = () => loadData();

  return (
    <div className="py-6 sm:py-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filtered.length} invoice{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/invoices/new"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Invoice</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {t.label}
            <span className="ml-1.5 text-xs opacity-60">{counts[t.key]}</span>
          </button>
        ))}
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <p className="text-muted-foreground mb-4">
            {tab === 'all' ? 'No invoices yet.' : `No ${tab} invoices.`}
          </p>
          {tab === 'all' && (
            <Link
              href="/invoices/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create your first invoice
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((inv) => (
            <div
              key={inv.id}
              onClick={() => router.push(`/invoices/${inv.id}`)}
              className={`relative rounded-xl border border-border bg-card hover:shadow-md hover:border-primary/30 transition-all cursor-pointer border-l-[3px] overflow-hidden ${STATUS_COLORS[inv.status] || ''}`}
            >
              <div className="p-4">
                {/* Top row */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-sm font-semibold truncate mt-0.5">
                      {inv.client?.name || 'Unknown'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase ${
                    inv.status === 'paid' ? 'bg-success/10 text-success' :
                    inv.status === 'pending' ? 'bg-warning/10 text-warning' :
                    inv.status === 'overdue' ? 'bg-destructive/10 text-destructive' :
                    inv.status === 'partial' ? 'bg-info/10 text-info' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {inv.status}
                  </span>
                </div>

                {/* Amount */}
                <p className="text-2xl font-bold tracking-tight">
                  {formatCurrency(inv.total)}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(inv.issueDate)}
                  </span>
                  {inv.dueDate && (
                    <span className={inv.status === 'overdue' ? 'text-destructive font-medium' : ''}>
                      Due {formatDate(inv.dueDate)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border" onClick={(e) => e.stopPropagation()}>
                  {inv.status !== 'paid' && (
                    <PaymentDialog invoice={inv} onUpdate={refresh} />
                  )}
                  <EmailDialog invoice={inv} onUpdate={refresh} />
                  <button
                    onClick={() => handleCopy(inv)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => generateInvoicePDF(inv, settings)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => handleDelete(inv.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
