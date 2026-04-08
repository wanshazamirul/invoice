'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Invoice, InvoiceStatus } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { DollarSign } from 'lucide-react';
import { generateId } from '@/lib/helpers';
import { useAlert } from '@/contexts/alert-context';

interface PaymentDialogProps {
  invoice: Invoice;
  onUpdate: () => void;
  size?: 'default' | 'sm';
}

export function PaymentDialog({ invoice, onUpdate, size = 'default' }: PaymentDialogProps) {
  const { updateInvoice } = useStore();
  const { error, success } = useAlert();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'bank_transfer' | 'card' | 'online' | 'other'>('bank_transfer');
  const [notes, setNotes] = useState('');

  const remainingBalance = invoice.total - invoice.paidAmount;

  const handleSubmit = () => {
    const paymentAmount = parseFloat(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      error('Invalid amount', 'Please enter a valid payment amount.');
      return;
    }

    if (paymentAmount > remainingBalance) {
      error('Amount exceeds balance', `Payment cannot exceed remaining balance of ${remainingBalance.toFixed(2)}`);
      return;
    }

    const newPayment = {
      id: generateId(),
      invoiceId: invoice.id,
      amount: paymentAmount,
      date: new Date().toISOString(),
      method,
      notes: notes || undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedPayments = [...invoice.payments, newPayment];
    const totalPaid = updatedPayments.reduce((sum, p) => sum + p.amount, 0);

    const updatedInvoice = {
      ...invoice,
      payments: updatedPayments,
      paidAmount: totalPaid,
      status: (totalPaid >= invoice.total ? 'paid' : totalPaid > 0 ? 'partial' : 'pending') as InvoiceStatus,
      paidDate: totalPaid >= invoice.total ? new Date().toISOString() : invoice.paidDate,
    };

    updateInvoice(updatedInvoice);
    onUpdate();
    success('Payment recorded', `Payment of ${invoice.currency} ${paymentAmount.toFixed(2)} has been recorded successfully.`);
    setOpen(false);
    setAmount('');
    setNotes('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className={size === 'sm' ? 'gap-1 h-6 w-6 p-0' : 'gap-2 flex-1 min-w-0 sm:min-w-fit'}>
          <DollarSign className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
          {size === 'default' && 'Record Payment'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <p className="text-sm text-slate-600 dark:text-slate-400">Invoice Total</p>
            <p className="text-lg font-semibold">{invoice.currency} {invoice.total.toFixed(2)}</p>
            <p className="text-sm text-slate-600 mt-2">Remaining Balance</p>
            <p className="text-lg font-semibold text-emerald-600">
              {invoice.currency} {remainingBalance.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Payment Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={(v: any) => setMethod(v)}>
              <SelectTrigger id="method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="online">Online Payment</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Payment reference, check number, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!amount}>
              Record Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
