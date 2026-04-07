export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'partial';
export type InvoiceType = 'invoice' | 'quotation';
export type RecurringType = 'none' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  company?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number; // Percentage
  discount: number; // Percentage
  total: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  status: InvoiceStatus;
  clientId: string;
  client: Client;
  items: InvoiceItem[];
  currency: string;
  taxRate: number; // Overall tax rate (SST)
  discountRate: number; // Overall discount
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  notes?: string;
  terms?: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  paidAmount: number;
  recurring: RecurringType;
  recurringEndDate?: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSettings {
  currency: string;
  taxRate: number;
  defaultTerms: string;
  defaultNotes: string;
  paymentInfo: string;
  companyInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    logo?: string;
  };
  invoicePrefix: string;
  startingNumber: number;
  quotationPrefix: string;
  quotationStartingNumber: number;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  paidThisMonth: number;
  totalClients: number;
  totalInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
}

export interface ChartData {
  name: string;
  revenue: number;
  invoices: number;
}
