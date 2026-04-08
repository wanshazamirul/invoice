import { Invoice, Client, Product, InvoiceSettings } from '@/types';

const STORAGE_KEYS = {
  INVOICES: 'invoice-app_invoices',
  CLIENTS: 'invoice-app_clients',
  PRODUCTS: 'invoice-app_products',
  SETTINGS: 'invoice-app_settings',
};

// Generic storage helpers
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
    }
  },

  remove: (key: string): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  },
};

// Invoice storage
export const invoiceStorage = {
  getInvoices: (): Invoice[] => storage.get<Invoice[]>(STORAGE_KEYS.INVOICES, []),
  setInvoices: (invoices: Invoice[]) => storage.set(STORAGE_KEYS.INVOICES, invoices),
  getInvoice: (id: string): Invoice | undefined => {
    const invoices = invoiceStorage.getInvoices();
    return invoices.find(inv => inv.id === id);
  },
  setInvoice: (invoice: Invoice): void => {
    const invoices = invoiceStorage.getInvoices();
    const index = invoices.findIndex(inv => inv.id === invoice.id);
    if (index >= 0) {
      invoices[index] = invoice;
    } else {
      invoices.push(invoice);
    }
    invoiceStorage.setInvoices(invoices);
  },
  deleteInvoice: (id: string): void => {
    const invoices = invoiceStorage.getInvoices().filter(inv => inv.id !== id);
    invoiceStorage.setInvoices(invoices);
  },
};

// Client storage
export const clientStorage = {
  getClients: (): Client[] => storage.get<Client[]>(STORAGE_KEYS.CLIENTS, []),
  setClients: (clients: Client[]) => storage.set(STORAGE_KEYS.CLIENTS, clients),
  getClient: (id: string): Client | undefined => {
    const clients = clientStorage.getClients();
    return clients.find(client => client.id === id);
  },
  setClient: (client: Client): void => {
    const clients = clientStorage.getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
      clients[index] = client;
    } else {
      clients.push(client);
    }
    clientStorage.setClients(clients);
  },
  deleteClient: (id: string): void => {
    const clients = clientStorage.getClients().filter(client => client.id !== id);
    clientStorage.setClients(clients);
  },
};

// Product storage
export const productStorage = {
  getProducts: (): Product[] => storage.get<Product[]>(STORAGE_KEYS.PRODUCTS, []),
  setProducts: (products: Product[]) => storage.set(STORAGE_KEYS.PRODUCTS, products),
  getProduct: (id: string): Product | undefined => {
    const products = productStorage.getProducts();
    return products.find(prod => prod.id === id);
  },
  setProduct: (product: Product): void => {
    const products = productStorage.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    productStorage.setProducts(products);
  },
  deleteProduct: (id: string): void => {
    const products = productStorage.getProducts().filter(prod => prod.id !== id);
    productStorage.setProducts(products);
  },
};

// Settings storage
export const settingsStorage = {
  getSettings: (): InvoiceSettings => {
    const defaultSettings: InvoiceSettings = {
      currency: 'RM',
      taxRate: 0,
      defaultTerms: 'Payment is due within 30 days.',
      defaultNotes: 'Thank you for your business!',
      paymentInfo: 'Bank: Maybank\nAccount: 123456789012\nAccount Name: Your Name',
      companyInfo: {
        name: 'Your Company Name',
        email: 'your@email.com',
        phone: '+60 12-345 6789',
        address: 'Your Address',
      },
      invoicePrefix: 'INV',
      startingNumber: 1,
      quotationPrefix: 'QUOT',
      quotationStartingNumber: 1,
    };
    return storage.get<InvoiceSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
  },
  setSettings: (settings: InvoiceSettings) => storage.set(STORAGE_KEYS.SETTINGS, settings),
};

// Export all data (backup)
export const exportData = () => {
  return {
    invoices: invoiceStorage.getInvoices(),
    clients: clientStorage.getClients(),
    products: productStorage.getProducts(),
    settings: settingsStorage.getSettings(),
    exportDate: new Date().toISOString(),
  };
};

// Import data (restore)
export const importData = (data: any) => {
  if (data.invoices) invoiceStorage.setInvoices(data.invoices);
  if (data.clients) clientStorage.setClients(data.clients);
  if (data.products) productStorage.setProducts(data.products);
  if (data.settings) settingsStorage.setSettings(data.settings);
};
