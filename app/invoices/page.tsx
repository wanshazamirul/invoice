'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice, InvoiceStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, MoreVertical, FileText, Download, Trash2, Copy, FileOutput } from 'lucide-react';
import { formatDate, formatCurrency, getInvoiceStatusColor } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { SearchBar } from '@/components/ui/search-bar';
import { useAlert } from '@/contexts/alert-context';
import { PaymentDialog } from '@/components/payment-dialog';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending: 'bg-warning/15 text-warning',
  paid: 'bg-success/15 text-success',
  overdue: 'bg-destructive/15 text-destructive',
  partial: 'bg-info/15 text-info',
};

export default function InvoicesPage() {
  const { invoices, loadData, deleteInvoice, settings, addInvoice, generateInvoiceNumber } = useStore();
  const router = useRouter();
  const { success, error: showError } = useAlert();
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quotation'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredInvoices = invoices.filter((invoice) => {
    const statusMatch = statusFilter === 'all' || invoice.status === statusFilter;
    const typeMatch = typeFilter === 'all' || invoice.type === typeFilter;
    const searchMatch =
      !searchQuery ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.phone.includes(searchQuery);
    return statusMatch && typeMatch && searchMatch;
  });

  const handleDelete = (id: string) => {
    if (confirm('Delete this invoice?')) {
      deleteInvoice(id);
      success('Deleted', 'Invoice removed.');
    }
  };

  const handleView = (id: string) => router.push(`/invoices/${id}`);
  const handleEdit = (id: string) => router.push(`/invoices/${id}/edit`);

  const handleDownload = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice, settings);
      success('Downloaded', 'PDF generated.');
    } catch {
      showError('Failed', 'Could not generate PDF.');
    }
  };

  const handleCopy = (invoice: Invoice) => {
    addInvoice({
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(invoice.type),
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'draft' as const,
      paidAmount: 0,
      paidDate: undefined,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    success('Copied', 'Invoice duplicated as draft.');
  };

  const handleConvertToQuotation = (invoice: Invoice) => {
    addInvoice({
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber('quotation'),
      type: 'quotation' as const,
      status: 'draft' as const,
      paidAmount: 0,
      paidDate: undefined,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    success('Converted', 'Quotation created.');
  };

  const refreshInvoice = () => loadData();

  const stats = [
    { label: 'Total', value: invoices.length, color: 'text-foreground' },
    { label: 'Draft', value: invoices.filter((i) => i.status === 'draft').length, color: 'text-muted-foreground' },
    { label: 'Pending', value: invoices.filter((i) => i.status === 'pending').length, color: 'text-warning' },
    { label: 'Paid', value: invoices.filter((i) => i.status === 'paid').length, color: 'text-success' },
    { label: 'Overdue', value: invoices.filter((i) => i.status === 'overdue').length, color: 'text-destructive' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={() => router.push('/invoices/new')} className="gap-1.5">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Create Invoice</span>
        </Button>
      </div>

      {/* Stats strip */}
      <div className="flex gap-1 sm:gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex-1 rounded-lg border border-border bg-card px-3 py-2.5 sm:px-4 sm:py-3 text-center"
          >
            <p className={`text-lg sm:text-xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Invoices</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search invoices..." />
              <div className="flex gap-2">
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="flex-1 sm:w-[130px] h-9 text-xs">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="quotation">Quotations</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="flex-1 sm:w-[130px] h-9 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {invoices.length === 0 ? 'No invoices yet.' : 'No invoices match your filters.'}
              </p>
              {invoices.length === 0 && (
                <Button onClick={() => router.push('/invoices/new')} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create your first invoice
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile cards */}
              <div className="md:hidden space-y-2">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    onClick={() => {
                      setSelectedInvoiceId(invoice.id);
                      setTimeout(() => handleView(invoice.id), 150);
                    }}
                    className={`rounded-lg border bg-card p-3 cursor-pointer transition-all active:scale-[0.98] ${
                      selectedInvoiceId === invoice.id
                        ? 'ring-2 ring-primary border-primary/30'
                        : 'hover:border-primary/20 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="font-semibold text-sm truncate">{invoice.invoiceNumber}</span>
                        <Badge variant={invoice.type === 'invoice' ? 'default' : 'secondary'} className="text-[9px] px-1 py-0">
                          {invoice.type === 'invoice' ? 'INV' : 'QT'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                        {invoice.type === 'invoice' && invoice.status !== 'paid' && (
                          <PaymentDialog invoice={invoice} onUpdate={refreshInvoice} size="sm" />
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                              <FileText className="w-4 h-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(invoice)}>
                              <Copy className="w-4 h-4 mr-2" />Copy
                            </DropdownMenuItem>
                            {invoice.type === 'invoice' && (
                              <DropdownMenuItem onClick={() => handleConvertToQuotation(invoice)}>
                                <FileOutput className="w-4 h-4 mr-2" />Convert
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download className="w-4 h-4 mr-2" />Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mb-2">{invoice.client.name}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${STATUS_STYLES[invoice.status] || ''}`}>
                        {invoice.status}
                      </span>
                      <span className="text-sm font-bold">{formatCurrency(invoice.total, invoice.currency)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(invoice.id)}
                    >
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.type === 'invoice' ? 'default' : 'secondary'} className="text-[10px]">
                          {invoice.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="text-right font-semibold tabular-nums">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_STYLES[invoice.status] || ''}`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {invoice.type === 'invoice' && invoice.status !== 'paid' && (
                            <PaymentDialog invoice={invoice} onUpdate={refreshInvoice} size="sm" />
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                                <FileText className="w-4 h-4 mr-2" />Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopy(invoice)}>
                                <Copy className="w-4 h-4 mr-2" />Copy
                              </DropdownMenuItem>
                              {invoice.type === 'invoice' && (
                                <DropdownMenuItem onClick={() => handleConvertToQuotation(invoice)}>
                                  <FileOutput className="w-4 h-4 mr-2" />Convert to Quotation
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                                <Download className="w-4 h-4 mr-2" />Download PDF
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(invoice.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="w-4 h-4 mr-2" />Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
