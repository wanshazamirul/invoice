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
import { Plus, MoreVertical, FileText, Download, Eye, Trash2, Copy, FileOutput } from 'lucide-react';
import { formatDate, formatCurrency, getInvoiceStatusColor } from '@/lib/helpers';
import { useRouter } from 'next/navigation';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { SearchBar } from '@/components/ui/search-bar';

export default function InvoicesPage() {
  const { invoices, loadData, deleteInvoice, settings, addInvoice, generateInvoiceNumber } = useStore();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'invoice' | 'quotation'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id);
    }
  };

  const handleView = (id: string) => {
    router.push(`/invoices/${id}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/invoices/${id}/edit`);
  };

  const handleDownload = (invoice: Invoice) => {
    try {
      generateInvoicePDF(invoice, settings);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleCopy = (invoice: Invoice) => {
    const newInvoice = {
      ...invoice,
      id: crypto.randomUUID(),
      invoiceNumber: generateInvoiceNumber(invoice.type),
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      status: 'draft' as const,
      paidAmount: 0,
      paidDate: undefined,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInvoice(newInvoice);
    router.push(`/invoices/${newInvoice.id}/edit`);
  };

  const handleConvertToQuotation = (invoice: Invoice) => {
    const quotation = {
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
    };

    addInvoice(quotation);
    router.push(`/invoices/${quotation.id}/edit`);
  };

  const stats = {
    total: invoices.length,
    draft: invoices.filter((i) => i.status === 'draft').length,
    pending: invoices.filter((i) => i.status === 'pending').length,
    paid: invoices.filter((i) => i.status === 'paid').length,
    overdue: invoices.filter((i) => i.status === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Invoices</h1>
          <p className="text-slate-600 mt-2 text-sm sm:text-base">Manage your invoices and quotations</p>
        </div>
        <Button onClick={() => router.push('/invoices/new')} className="gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          Create Invoice
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <p className="text-[10px] sm:text-xs text-slate-600">Total</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <p className="text-[10px] sm:text-xs text-slate-600">Draft</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-500">{stats.draft}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <p className="text-[10px] sm:text-xs text-slate-600">Pending</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <p className="text-[10px] sm:text-xs text-slate-600">Paid</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 sm:pt-4 px-3 sm:px-6">
            <p className="text-[10px] sm:text-xs text-slate-600">Overdue</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600">{stats.overdue}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg sm:text-xl">All Invoices</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search invoices..."
              />
              <div className="flex gap-3">
                <Select value={typeFilter} onValueChange={(v: any) => setTypeFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="quotation">Quotations</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
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
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {invoices.length === 0
                  ? 'No invoices yet. Create your first invoice!'
                  : 'No invoices match your filters.'}
              </p>
              {invoices.length === 0 && (
                <Button
                  onClick={() => router.push('/invoices/new')}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {filteredInvoices.map((invoice) => (
                  <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-slate-900">{invoice.invoiceNumber}</h3>
                            <Badge variant={invoice.type === 'invoice' ? 'default' : 'secondary'}>
                              {invoice.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600">{invoice.client.name}</p>
                        </div>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-slate-500">Issue Date</p>
                          <p className="text-sm font-medium">{formatDate(invoice.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Due Date</p>
                          <p className="text-sm font-medium">{formatDate(invoice.dueDate)}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <p className="text-lg font-bold text-emerald-600">
                          {formatCurrency(invoice.total, invoice.currency)}
                        </p>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(invoice.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(invoice)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            {invoice.type === 'invoice' && (
                              <DropdownMenuItem onClick={() => handleConvertToQuotation(invoice)}>
                                <FileOutput className="w-4 h-4 mr-2" />
                                Convert to Quotation
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{invoice.client.name}</TableCell>
                      <TableCell>
                        <Badge variant={invoice.type === 'invoice' ? 'default' : 'secondary'}>
                          {invoice.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(invoice.total, invoice.currency)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getInvoiceStatusColor(invoice.status)}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(invoice.id)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(invoice.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopy(invoice)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            {invoice.type === 'invoice' && (
                              <DropdownMenuItem onClick={() => handleConvertToQuotation(invoice)}>
                                <FileOutput className="w-4 h-4 mr-2" />
                                Convert to Quotation
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDownload(invoice)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(invoice.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
