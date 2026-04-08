import { Invoice, InvoiceItem } from '@/types';

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatCurrency = (amount: number, currency: string = 'RM'): string => {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency === 'RM' ? 'MYR' : currency,
  }).format(amount);
};

export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
  tax: number,
  discount: number
): number => {
  // Ensure all values are valid numbers, default to 0 if NaN/null/undefined
  const validQuantity = isNaN(quantity) || quantity == null ? 0 : quantity;
  const validUnitPrice = isNaN(unitPrice) || unitPrice == null ? 0 : unitPrice;
  const validTax = isNaN(tax) || tax == null ? 0 : tax;
  const validDiscount = isNaN(discount) || discount == null ? 0 : discount;

  const subtotal = validQuantity * validUnitPrice;
  const taxAmount = subtotal * (validTax / 100);
  const discountAmount = subtotal * (validDiscount / 100);
  const total = subtotal + taxAmount - discountAmount;

  // Return 0 instead of NaN
  return isNaN(total) ? 0 : total;
};

export const calculateInvoiceTotals = (items: InvoiceItem[], taxRate: number, discountRate: number) => {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = isNaN(item.total) ? 0 : item.total;
    return sum + itemTotal;
  }, 0);

  const validTaxRate = isNaN(taxRate) || taxRate == null ? 0 : taxRate;
  const validDiscountRate = isNaN(discountRate) || discountRate == null ? 0 : discountRate;

  const taxAmount = subtotal * (validTaxRate / 100);
  const discountAmount = subtotal * (validDiscountRate / 100);
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal: isNaN(subtotal) ? 0 : subtotal,
    taxAmount: isNaN(taxAmount) ? 0 : taxAmount,
    discountAmount: isNaN(discountAmount) ? 0 : discountAmount,
    total: isNaN(total) ? 0 : total,
  };
};

export const getInvoiceStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800 border-gray-300',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    paid: 'bg-green-100 text-green-800 border-green-300',
    overdue: 'bg-red-100 text-red-800 border-red-300',
    partial: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  return colors[status] || colors.draft;
};

export const checkOverdueInvoices = (invoices: Invoice[]): Invoice[] => {
  const today = new Date();
  return invoices
    .filter(inv => inv.status === 'pending' && new Date(inv.dueDate) < today)
    .map(inv => ({ ...inv, status: 'overdue' as const }));
};
