'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice, InvoiceItem, RecurringType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Save, ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { calculateInvoiceTotals, calculateItemTotal } from '@/lib/helpers';
import Link from 'next/link';
import { useAlert } from '@/contexts/alert-context';
import { LineItemDialog } from '@/components/invoices/line-item-dialog';
import { LineItemList } from '@/components/invoices/line-item-list';

export default function EditInvoicePage() {
  const { clients, products, settings, invoices, updateInvoice, loadData } =
    useStore();
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;
  const { error, success } = useAlert();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'invoice' as 'invoice' | 'quotation',
    currency: 'RM',
    taxRate: 0,
    discountRate: 0,
    notes: '',
    terms: '',
    issueDate: '',
    dueDate: '',
    recurring: 'none' as RecurringType,
  });

  const [items, setItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const foundInvoice = invoices.find((inv) => inv.id === invoiceId);
    if (foundInvoice) {
      setInvoice(foundInvoice);
      setFormData({
        clientId: foundInvoice.clientId,
        type: foundInvoice.type,
        currency: foundInvoice.currency,
        taxRate: foundInvoice.taxRate,
        discountRate: foundInvoice.discountRate,
        notes: foundInvoice.notes || '',
        terms: foundInvoice.terms || '',
        issueDate: foundInvoice.issueDate.split('T')[0],
        dueDate: foundInvoice.dueDate.split('T')[0],
        recurring: foundInvoice.recurring,
      });
      setItems(foundInvoice.items);
    } else {
      router.push('/invoices');
    }
  }, [invoiceId, invoices, loadData, router]);

  const selectedClient = clients.find((c) => c.id === formData.clientId);

  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

  const handleAddItem = () => {
    setEditingItem(null);
    setItemModalOpen(true);
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingItem(item);
    setItemModalOpen(true);
  };

  const handleSaveItem = (item: InvoiceItem) => {
    if (editingItem) {
      // Update existing item
      setItems(items.map((i) => (i.id === item.id ? item : i)));
    } else {
      // Add new item
      setItems([...items, item]);
    }
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const handleReorderItems = (reorderedItems: InvoiceItem[]) => {
    setItems(reorderedItems);
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: any) => {
    const updatedItems = items.map((item) => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (
          field === 'quantity' ||
          field === 'unitPrice' ||
          field === 'tax' ||
          field === 'discount'
        ) {
          updated.total = calculateItemTotal(
            updated.quantity,
            updated.unitPrice,
            updated.tax,
            updated.discount
          );
        }
        return updated;
      }
      return item;
    });
    setItems(updatedItems);
  };

  const handleSelectProduct = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      handleItemChange(itemId, 'description', product.name);
      handleItemChange(itemId, 'unitPrice', product.price);
    }
  };

  const calculateTotals = () => {
    return calculateInvoiceTotals(items, formData.taxRate, formData.discountRate);
  };

  const handleSave = (status: 'draft' | 'pending') => {
    if (!formData.clientId || !selectedClient || !invoice) {
      error('Missing information', 'Please select a client for this invoice.');
      return;
    }

    const validItems = items.filter((item) => item.description.trim() !== '');
    if (validItems.length === 0) {
      error('No items', 'Please add at least one item to the invoice.');
      return;
    }

    const totals = calculateTotals();

    const updatedInvoice: Invoice = {
      ...invoice,
      clientId: formData.clientId,
      client: selectedClient,
      type: formData.type,
      items: validItems,
      currency: formData.currency,
      taxRate: formData.taxRate,
      discountRate: formData.discountRate,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
      notes: formData.notes,
      terms: formData.terms,
      issueDate: formData.issueDate,
      dueDate: formData.dueDate,
      status,
      recurring: formData.recurring as RecurringType,
      updatedAt: new Date().toISOString(),
    };

    updateInvoice(updatedInvoice);
    success(
      status === 'draft' ? 'Draft saved' : 'Invoice updated',
      `${invoice.invoiceNumber} has been ${status === 'draft' ? 'saved' : 'updated'} successfully.`
    );
    router.push(`/invoices/${invoiceId}`);
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Loading invoice...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Link href={`/invoices/${invoiceId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-3 h-3" />
            </Button>
          </Link>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900">Edit Invoice</h1>
            <p className="text-slate-600 mt-1 text-[10px] sm:text-sm">{invoice.invoiceNumber}</p>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <Button variant="outline" onClick={() => handleSave('draft')}>
            Save as Draft
          </Button>
          <Button onClick={() => handleSave('pending')} className="gap-1">
            <Save className="w-3 h-3" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client & Type */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Document Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => v && setFormData({ ...formData, type: v as 'invoice' | 'quotation' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="invoice">Invoice</SelectItem>
                      <SelectItem value="quotation">Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(v) => v && setFormData({ ...formData, currency: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RM">RM - Malaysian Ringgit</SelectItem>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(v) => v && setFormData({ ...formData, clientId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                        {client.company && ` (${client.company})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Description</TableHead>
                      <TableHead className="w-[12%]">Qty</TableHead>
                      <TableHead className="w-[16%]">Price</TableHead>
                      <TableHead className="w-[12%]">Tax %</TableHead>
                      <TableHead className="w-[12%]">Total</TableHead>
                      <TableHead className="w-[8%]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {products.length > 0 && (
                            <Select
                              value=""
                              onValueChange={(v) => v && handleSelectProduct(item.id, v)}
                            >
                              <SelectTrigger className="mb-2">
                                <SelectValue placeholder="Select product" />
                              </SelectTrigger>
                              <SelectContent>
                                {products.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name} ({settings.currency}
                                    {product.price})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleItemChange(item.id, 'description', e.target.value)
                            }
                            placeholder="Item description"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(item.id, 'quantity', parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleItemChange(item.id, 'unitPrice', parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={item.tax}
                            onChange={(e) =>
                              handleItemChange(item.id, 'tax', parseFloat(e.target.value))
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {settings.currency}
                          {item.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {items.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <LineItemList
                items={items}
                currency={formData.currency}
                onEdit={handleEditItem}
                onDelete={handleRemoveItem}
                onReorder={handleReorderItems}
              />
              <Button
                variant="outline"
                onClick={handleAddItem}
                className="w-full mt-4 gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Line Item Modal */}
          <LineItemDialog
            open={itemModalOpen}
            onOpenChange={setItemModalOpen}
            item={editingItem}
            products={products}
            onSave={handleSaveItem}
          />

          {/* Notes & Terms */}
          <Card>
            <CardHeader>
              <CardTitle>Notes & Terms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Terms & Conditions</Label>
                <Textarea
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-medium">
                  {settings.currency}
                  {calculateTotals().subtotal.toFixed(2)}
                </span>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Tax Rate</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) =>
                      setFormData({ ...formData, taxRate: parseFloat(e.target.value) })
                    }
                    className="w-20 h-8 text-right"
                  />
                  %
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tax Amount</span>
                  <span className="font-medium">
                    {settings.currency}
                    {calculateTotals().taxAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-slate-600">Discount</span>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountRate}
                    onChange={(e) =>
                      setFormData({ ...formData, discountRate: parseFloat(e.target.value) })
                    }
                    className="w-20 h-8 text-right"
                  />
                  %
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Discount Amount</span>
                  <span className="font-medium text-red-600">
                    -{settings.currency}
                    {calculateTotals().discountAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-emerald-600">
                  {settings.currency}
                  {calculateTotals().total.toFixed(2)}
                </span>
              </div>

              <Separator />

              <div>
                <Label>Recurring</Label>
                <Select
                  value={formData.recurring}
                  onValueChange={(v: any) => v && setFormData({ ...formData, recurring: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>From</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-semibold">{settings.companyInfo.name}</p>
              <p className="text-slate-600">{settings.companyInfo.email}</p>
              <p className="text-slate-600">{settings.companyInfo.phone}</p>
              <p className="text-slate-600 whitespace-pre-line">{settings.companyInfo.address}</p>
            </CardContent>
          </Card>

          {selectedClient && (
            <Card>
              <CardHeader>
                <CardTitle>To</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="font-semibold">{selectedClient.name}</p>
                {selectedClient.company && (
                  <p className="text-slate-600">{selectedClient.company}</p>
                )}
                <p className="text-slate-600">{selectedClient.email}</p>
                <p className="text-slate-600">{selectedClient.phone}</p>
                <p className="text-slate-600 whitespace-pre-line">{selectedClient.address}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
