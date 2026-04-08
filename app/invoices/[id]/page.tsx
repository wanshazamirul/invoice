'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { Invoice } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Printer, Download, Edit, FileText, History } from 'lucide-react';
import { formatDate, formatCurrency, getInvoiceStatusColor } from '@/lib/helpers';
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
    const foundInvoice = invoices.find((inv) => inv.id === params.id);
    if (foundInvoice) {
      setInvoice(foundInvoice);
    }
    setLoading(false);
  }, [params.id, invoices]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (invoice) {
      generateInvoicePDF(invoice, settings);
    }
  };

  const handleEdit = () => {
    router.push(`/invoices/${params.id}/edit`);
  };

  const refreshInvoice = () => {
    const foundInvoice = invoices.find((inv) => inv.id === params.id);
    if (foundInvoice) {
      setInvoice(foundInvoice);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-slate-600">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
            <p className="text-slate-600 mb-4">The invoice you're looking for doesn't exist.</p>
            <Button onClick={() => router.push('/invoices')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Invoices
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-slate-600 text-xs sm:text-sm">
              {invoice.type === 'invoice' ? 'Invoice' : 'Quotation'} • {formatDate(invoice.issueDate)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handlePrint} className="gap-2 flex-1 sm:flex-none">
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </Button>
          <Button variant="outline" onClick={handleDownload} className="gap-2 flex-1 sm:flex-none">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </Button>
          <EmailDialog invoice={invoice} />
          <PaymentDialog invoice={invoice} onUpdate={refreshInvoice} />
          <Button onClick={handleEdit} className="gap-2 flex-1 sm:flex-none">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Invoice Content - Printable */}
      <Card className="print-show">
        <CardContent className="p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-6 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-emerald-600">{settings.companyInfo.name}</h2>
              <p className="text-slate-600 text-sm mt-1">{settings.companyInfo.email}</p>
              <p className="text-slate-600 text-sm">{settings.companyInfo.phone}</p>
              <p className="text-slate-600 text-sm max-w-md mt-1">{settings.companyInfo.address}</p>
            </div>
            <div className="text-left sm:text-right w-full sm:w-auto">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {invoice.type === 'invoice' ? 'INVOICE' : 'QUOTATION'}
              </h3>
              <p className="text-slate-600 text-base sm:text-lg mt-2">{invoice.invoiceNumber}</p>
              <div className="text-slate-600 text-sm mt-2">
                <p>Issue Date: {formatDate(invoice.issueDate)}</p>
                <p>Due Date: {formatDate(invoice.dueDate)}</p>
              </div>
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">BILL TO</h4>
            <div className="bg-slate-50 p-4 rounded-lg">
              <p className="font-semibold text-slate-900">{invoice.client.name}</p>
              {invoice.client.company && (
                <p className="text-slate-600 text-sm">{invoice.client.company}</p>
              )}
              <p className="text-slate-600 text-sm">{invoice.client.email}</p>
              <p className="text-slate-600 text-sm">{invoice.client.phone}</p>
              <p className="text-slate-600 text-sm">{invoice.client.address}</p>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8 no-break overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-emerald-600 text-white">
                  <th className="text-left p-2 sm:p-3 rounded-tl-lg text-xs sm:text-sm">Description</th>
                  <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Qty</th>
                  <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Unit Price</th>
                  <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Tax %</th>
                  <th className="text-center p-2 sm:p-3 text-xs sm:text-sm">Disc %</th>
                  <th className="text-right p-2 sm:p-3 rounded-tr-lg text-xs sm:text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr
                    key={item.id}
                    className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                  >
                    <td className="p-2 sm:p-3 text-xs sm:text-sm">{item.description}</td>
                    <td className="text-center p-2 sm:p-3 text-xs sm:text-sm">{item.quantity}</td>
                    <td className="text-center p-2 sm:p-3 text-xs sm:text-sm">
                      {formatCurrency(item.unitPrice, invoice.currency)}
                    </td>
                    <td className="text-center p-2 sm:p-3 text-xs sm:text-sm">{item.tax}%</td>
                    <td className="text-center p-2 sm:p-3 text-xs sm:text-sm">{item.discount}%</td>
                    <td className="text-right p-2 sm:p-3 font-semibold text-xs sm:text-sm">
                      {formatCurrency(item.total, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full sm:w-80">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-600">Tax ({invoice.taxRate}%):</span>
                <span className="font-semibold">{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
              {invoice.discountRate > 0 && (
                <div className="flex justify-between py-2 text-sm">
                  <span className="text-slate-600">Discount ({invoice.discountRate}%):</span>
                  <span className="font-semibold text-red-600">
                    -{formatCurrency(invoice.discountAmount, invoice.currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-3 bg-emerald-600 text-white px-4 rounded-lg mt-2">
                <span className="font-bold text-base sm:text-lg">TOTAL:</span>
                <span className="font-bold text-base sm:text-lg">
                  {formatCurrency(invoice.total, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-8">
            <span className="text-slate-600 text-sm">Status: </span>
            <Badge className={getInvoiceStatusColor(invoice.status)}>
              {invoice.status.toUpperCase()}
            </Badge>
          </div>

          {/* Notes & Terms */}
          {(invoice.notes || invoice.terms) && (
            <div className="mb-8 no-break">
              {invoice.notes && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Notes:</h4>
                  <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">{invoice.notes}</p>
                </div>
              )}
              {invoice.terms && (
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">Terms & Conditions:</h4>
                  <p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">{invoice.terms}</p>
                </div>
              )}
            </div>
          )}

          {/* Payment History */}
          {invoice.payments && invoice.payments.length > 0 && (
            <div className="mb-8 no-break">
              <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <History className="w-4 h-4" />
                Payment History
              </h4>
              <div className="bg-slate-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Date</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Method</th>
                      <th className="text-right p-3 text-xs font-semibold text-slate-600">Amount</th>
                      <th className="text-left p-3 text-xs font-semibold text-slate-600">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id} className="border-t border-slate-200">
                        <td className="p-3 text-sm">{formatDate(payment.date)}</td>
                        <td className="p-3 text-sm capitalize">{payment.method.replace('_', ' ')}</td>
                        <td className="p-3 text-sm text-right font-semibold text-emerald-600">
                          {formatCurrency(payment.amount, invoice.currency)}
                        </td>
                        <td className="p-3 text-sm text-slate-600">{payment.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-slate-50 p-4 rounded-lg no-break">
            <h4 className="text-sm font-semibold text-slate-900 mb-2">PAYMENT INFORMATION</h4>
            <p className="text-slate-600 text-sm">{settings.paymentInfo}</p>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-slate-400 text-sm no-print">
            <p>Generated by Invoice App • {formatDate(new Date().toISOString())}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
