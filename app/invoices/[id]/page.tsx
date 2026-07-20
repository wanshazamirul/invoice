'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  Edit,
  FileText,
  History,
  Printer,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/helpers';
import { generateInvoicePDF } from '@/lib/pdf-generator';
import { PaymentDialog } from '@/components/payment-dialog';
import { EmailDialog } from '@/components/email-dialog';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { invoices, settings } = useStore();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = invoices.find((inv) => inv.id === params.id);
    if (found) setInvoice(found);
    setLoading(false);
  }, [params.id, invoices]);

  const refreshInvoice = () => {
    const found = invoices.find((inv) => inv.id === params.id);
    if (found) setInvoice(found ?? null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <FileText className="w-12 h-12 text-muted-foreground/30 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Not Found</h2>
        <p className="text-muted-foreground mb-6">This invoice doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/invoices')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Invoices
        </Button>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 mb-8 no-print">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/invoices')}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{invoice.invoiceNumber}</h1>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase ${
                  invoice.status === 'paid'
                    ? 'bg-success/10 text-success'
                    : invoice.status === 'pending'
                    ? 'bg-warning/10 text-warning'
                    : invoice.status === 'overdue'
                    ? 'bg-destructive/10 text-destructive'
                    : invoice.status === 'partial'
                    ? 'bg-info/10 text-info'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {invoice.status}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {invoice.type === 'invoice' ? 'Invoice' : 'Quotation'} &middot;{' '}
              {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => window.print()} title="Print">
            <Printer className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => generateInvoicePDF(invoice, settings)} title="Download PDF">
            <Download className="w-4 h-4" />
          </Button>
          <EmailDialog invoice={invoice} onUpdate={refreshInvoice} />
          <PaymentDialog invoice={invoice} onUpdate={refreshInvoice} />
          <Button size="icon" onClick={() => router.push(`/invoices/${params.id}/edit`)} title="Edit">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* From / To */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                From
              </p>
              <p className="font-semibold">{settings.companyInfo.name}</p>
              <p className="text-sm text-muted-foreground">{settings.companyInfo.email}</p>
              <p className="text-sm text-muted-foreground">{settings.companyInfo.phone}</p>
              <p className="text-sm text-muted-foreground mt-1">{settings.companyInfo.address}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Bill To
              </p>
              <p className="font-semibold">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-sm text-muted-foreground">{invoice.client.company}</p>
              )}
              <p className="text-sm text-muted-foreground">{invoice.client.email}</p>
              <p className="text-sm text-muted-foreground">{invoice.client.phone}</p>
            </div>
          </div>

          {/* Dates */}
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Issue Date
              </p>
              <p>{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Due Date
              </p>
              <p className={invoice.status === 'overdue' ? 'text-destructive font-semibold' : ''}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Line items */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Items
            </p>
            <div className="rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 text-xs font-semibold text-muted-foreground">Description</th>
                    <th className="text-center p-3 text-xs font-semibold text-muted-foreground w-16">Qty</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground w-28">Price</th>
                    <th className="text-right p-3 text-xs font-semibold text-muted-foreground w-28">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-muted/20' : ''}>
                      <td className="p-3 text-sm">
                        <p className="font-medium">{item.description}</p>
                        {(item.tax > 0 || item.discount > 0) && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.tax > 0 && `Tax ${item.tax}%`}
                            {item.tax > 0 && item.discount > 0 && ' · '}
                            {item.discount > 0 && `Disc ${item.discount}%`}
                          </p>
                        )}
                      </td>
                      <td className="text-center p-3 text-sm">{item.quantity}</td>
                      <td className="text-right p-3 text-sm tabular-nums">
                        {formatCurrency(item.unitPrice, invoice.currency)}
                      </td>
                      <td className="text-right p-3 text-sm font-semibold tabular-nums">
                        {formatCurrency(item.total, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="space-y-4">
              {invoice.notes && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Terms</p>
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Total */}
          <div className="rounded-xl border border-border p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Summary
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SST ({invoice.taxRate}%)</span>
                  <span className="font-medium tabular-nums">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
                </div>
              )}
              {invoice.discountRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Discount</span>
                  <span className="font-medium text-destructive tabular-nums">
                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-semibold">Total</span>
                <span className="text-lg font-bold tabular-nums">{formatCurrency(invoice.total, invoice.currency)}</span>
              </div>
              {invoice.paidAmount > 0 && (
                <div className="flex justify-between pt-1">
                  <span className="text-success font-medium">Paid</span>
                  <span className="text-success font-bold tabular-nums">
                    {formatCurrency(invoice.paidAmount, invoice.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment info */}
          {settings.paymentInfo && (
            <div className="rounded-xl border border-border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Payment Info
              </p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{settings.paymentInfo}</p>
            </div>
          )}

          {/* Payment history */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="rounded-xl border border-border p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                Payments
              </p>
              <div className="space-y-2">
                {invoice.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium capitalize">{p.method.replace('_', ' ')}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(p.date)}</p>
                    </div>
                    <p className="font-semibold text-success tabular-nums">
                      {formatCurrency(p.amount, invoice.currency)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
