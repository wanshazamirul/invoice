'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail } from 'lucide-react';
import { generateInvoicePDF } from '@/lib/pdf-generator';

interface EmailDialogProps {
  invoice: Invoice;
}

export function EmailDialog({ invoice }: EmailDialogProps) {
  const { settings } = useStore();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(`${invoice.type === 'invoice' ? 'Invoice' : 'Quotation'} ${invoice.invoiceNumber}`);
  const [body, setBody] = useState(
    `Dear ${invoice.client.name},\n\nPlease find attached ${invoice.type} ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.total.toFixed(2)}.\n\nDue Date: ${new Date(invoice.dueDate).toLocaleDateString()}\n\nThank you for your business!\n\nBest regards,\n${settings.companyInfo.name}`
  );

  const handleSend = () => {
    const mailtoLink = `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button size="sm" variant="outline" className="gap-2">
          <Mail className="w-4 h-4" />
          Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Email Invoice</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600">To</p>
            <p className="font-semibold">{invoice.client.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <Textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={8}
              className="font-mono text-sm"
            />
          </div>

          <p className="text-xs text-slate-500">
            Note: This will open your default email client. You can attach the PDF manually after downloading it.
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSend}>
              Open Email Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
