'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send, Loader2, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';

interface EmailDialogProps {
  invoice: Invoice;
  onUpdate?: () => void;
}

export function EmailDialog({ invoice, onUpdate }: EmailDialogProps) {
  const { settings, addReminderToInvoice } = useStore();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');
  const [subject, setSubject] = useState(
    `${invoice.type === 'invoice' ? 'Invoice' : 'Quotation'} ${invoice.invoiceNumber} from ${settings.companyInfo.name}`
  );
  const [body, setBody] = useState(
    `Dear ${invoice.client.name},\n\nPlease find attached ${invoice.type} ${invoice.invoiceNumber} for ${formatCurrency(invoice.total, invoice.currency)}.\n\nDue date: ${new Date(invoice.dueDate).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}\n\nThank you for your business.\n\n${settings.companyInfo.name}`
  );

  const buildEmailHtml = () => {
    const items = invoice.items
      .map(
        (item) =>
          `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${item.description}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${item.quantity} &times; ${formatCurrency(item.unitPrice)}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatCurrency(item.total)}</td></tr>`
      )
      .join('');

    return `
      <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px">
        <h2 style="margin:0 0 4px">${subject}</h2>
        <p style="margin:0 0 24px;color:#666">${body.replace(/\n/g, '<br>')}</p>
        <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <thead><tr style="background:#f9f6f0">
            <th style="padding:10px 12px;text-align:left;font-size:12px;color:#888">Item</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888">Qty &times; Price</th>
            <th style="padding:10px 12px;text-align:right;font-size:12px;color:#888">Total</th>
          </tr></thead>
          <tbody>${items}</tbody>
        </table>
        <div style="text-align:right;margin-bottom:24px">
          <p style="font-size:18px;font-weight:700;margin:0">Total: ${formatCurrency(invoice.total, invoice.currency)}</p>
        </div>
        <p style="font-size:12px;color:#aaa">Sent via Invoice &middot; <a href="https://invoice.cognitio.my" style="color:#aaa">invoice.cognitio.my</a></p>
      </div>`;
  };

  const handleSend = async () => {
    setStatus('sending');
    setError('');

    try {
      const res = await fetch('/api/send-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: invoice.client.email,
          subject,
          html: buildEmailHtml(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to send');
      }

      addReminderToInvoice(invoice.id, 'email');
      setStatus('sent');
      setTimeout(() => {
        setOpen(false);
        setStatus('idle');
        onUpdate?.();
      }, 1500);
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to send');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" className="gap-1.5 text-xs h-9 px-2 w-full sm:w-auto">
          <Mail className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Email</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {status === 'sent' ? 'Sent!' : 'Email Invoice'}
          </DialogTitle>
        </DialogHeader>

        {status === 'sent' ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-success/10 text-success flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <p className="font-semibold">Invoice emailed to {invoice.client.email}</p>
            <p className="text-sm text-muted-foreground">A reminder has been recorded.</p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">To</p>
              <p className="text-sm font-semibold">{invoice.client.email}</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-body">Message</Label>
              <Textarea
                id="email-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={5}
                className="text-sm"
              />
            </div>

            {invoice.remindersSent && invoice.remindersSent.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {invoice.remindersSent.length} reminder{invoice.remindersSent.length > 1 ? 's' : ''} sent previously
                {invoice.remindersSent.map((r, i) => (
                  <span key={i} className="block">
                    {new Date(r.date).toLocaleDateString('en-MY')} via {r.method}
                  </span>
                ))}
              </p>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 rounded-lg p-3">{error}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={status === 'sending'}>
                {status === 'sending' ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" />
                    Send Invoice
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
