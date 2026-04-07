import { create } from 'zustand';
import { Invoice, Client, Product, InvoiceSettings, DashboardStats } from '@/types';
import {
  invoiceStorage,
  clientStorage,
  productStorage,
  settingsStorage,
  exportData,
  importData,
} from '@/lib/storage';

interface InvoiceStore {
  // Data
  invoices: Invoice[];
  clients: Client[];
  products: Product[];
  settings: InvoiceSettings;

  // Loading state
  isLoading: boolean;

  // Actions
  loadData: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoice: Invoice) => void;
  deleteInvoice: (id: string) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  updateSettings: (settings: InvoiceSettings) => void;
  getDashboardStats: () => DashboardStats;
  exportAllData: () => any;
  importAllData: (data: any) => void;
  generateInvoiceNumber: (type: 'invoice' | 'quotation') => string;
}

export const useStore = create<InvoiceStore>((set, get) => ({
  // Initial state
  invoices: [],
  clients: [],
  products: [],
  settings: settingsStorage.getSettings(),
  isLoading: false,

  // Load all data from localStorage
  loadData: () => {
    set({ isLoading: true });
    try {
      const invoices = invoiceStorage.getInvoices();
      const clients = clientStorage.getClients();
      const products = productStorage.getProducts();
      const settings = settingsStorage.getSettings();
      set({ invoices, clients, products, settings, isLoading: false });
    } catch (error) {
      console.error('Error loading data:', error);
      set({ isLoading: false });
    }
  },

  // Invoice actions
  addInvoice: (invoice) => {
    const invoices = [...get().invoices, invoice];
    invoiceStorage.setInvoices(invoices);
    set({ invoices });
  },

  updateInvoice: (invoice) => {
    const invoices = get().invoices.map(inv =>
      inv.id === invoice.id ? invoice : inv
    );
    invoiceStorage.setInvoices(invoices);
    set({ invoices });
  },

  deleteInvoice: (id) => {
    const invoices = get().invoices.filter(inv => inv.id !== id);
    invoiceStorage.setInvoices(invoices);
    set({ invoices });
  },

  // Client actions
  addClient: (client) => {
    const clients = [...get().clients, client];
    clientStorage.setClients(clients);
    set({ clients });
  },

  updateClient: (client) => {
    const clients = get().clients.map(c =>
      c.id === client.id ? client : c
    );
    clientStorage.setClients(clients);
    set({ clients });
  },

  deleteClient: (id) => {
    const clients = get().clients.filter(c => c.id !== id);
    clientStorage.setClients(clients);
    set({ clients });
  },

  // Product actions
  addProduct: (product) => {
    const products = [...get().products, product];
    productStorage.setProducts(products);
    set({ products });
  },

  updateProduct: (product) => {
    const products = get().products.map(p =>
      p.id === product.id ? product : p
    );
    productStorage.setProducts(products);
    set({ products });
  },

  deleteProduct: (id) => {
    const products = get().products.filter(p => p.id !== id);
    productStorage.setProducts(products);
    set({ products });
  },

  // Settings actions
  updateSettings: (settings) => {
    settingsStorage.setSettings(settings);
    set({ settings });
  },

  // Dashboard stats
  getDashboardStats: () => {
    const { invoices, clients } = get();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

    const paidThisMonth = paidInvoices
      .filter(inv => new Date(inv.paidDate || '') >= startOfMonth)
      .reduce((sum, inv) => sum + inv.paidAmount, 0);

    return {
      totalRevenue: paidInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      pendingAmount: pendingInvoices.reduce((sum, inv) => sum + inv.total, 0),
      overdueAmount: overdueInvoices.reduce((sum, inv) => sum + inv.total, 0),
      paidThisMonth,
      totalClients: clients.length,
      totalInvoices: invoices.length,
      pendingInvoices: pendingInvoices.length,
      overdueInvoices: overdueInvoices.length,
    };
  },

  // Export/Import
  exportAllData: () => {
    return exportData();
  },

  importAllData: (data) => {
    importData(data);
    get().loadData();
  },

  // Generate invoice number
  generateInvoiceNumber: (type) => {
    const { settings, invoices } = get();
    const prefix = type === 'invoice' ? settings.invoicePrefix : settings.quotationPrefix;
    const startingNumber = type === 'invoice' ? settings.startingNumber : settings.quotationStartingNumber;

    // Filter invoices by type
    const typeInvoices = invoices.filter(inv => inv.type === type);

    if (typeInvoices.length === 0) {
      return `${prefix}-${String(startingNumber).padStart(4, '0')}`;
    }

    // Get the latest invoice number
    const latestInvoice = typeInvoices
      .map(inv => parseInt(inv.invoiceNumber.split('-')[1]))
      .reduce((max, num) => (num > max ? num : max), startingNumber - 1);

    return `${prefix}-${String(latestInvoice + 1).padStart(4, '0')}`;
  },
}));
