export const translations = {
  en: {
    // Dashboard
    dashboard: 'Dashboard',
    totalRevenue: 'Total Revenue',
    pendingAmount: 'Pending Amount',
    overdueAmount: 'Overdue Amount',
    paidThisMonth: 'Paid This Month',
    totalClients: 'Total Clients',
    totalInvoices: 'Total Invoices',

    // Invoices
    invoices: 'Invoices',
    createInvoice: 'Create Invoice',
    invoiceNumber: 'Invoice Number',
    issueDate: 'Issue Date',
    dueDate: 'Due Date',
    status: 'Status',
    total: 'Total',
    actions: 'Actions',
    view: 'View',
    edit: 'Edit',
    delete: 'Delete',
    downloadPDF: 'Download PDF',
    print: 'Print',
    copy: 'Copy',
    convertToQuotation: 'Convert to Quotation',
    recordPayment: 'Record Payment',
    email: 'Email',

    // Invoice Types
    draft: 'Draft',
    pending: 'Pending',
    paid: 'Paid',
    overdue: 'Overdue',
    partial: 'Partial',

    // Clients
    clients: 'Clients',
    addClient: 'Add Client',
    clientName: 'Client Name',
    phone: 'Phone',
    address: 'Address',
    company: 'Company',

    // Products
    products: 'Products',
    addProduct: 'Add Product',
    productName: 'Product Name',
    sku: 'SKU',
    price: 'Price',

    // Settings
    settings: 'Settings',
    companyInfo: 'Company Information',
    paymentInfo: 'Payment Information',
    taxRate: 'Tax Rate',
    currency: 'Currency',

    // Common
    save: 'Save',
    cancel: 'Cancel',
    back: 'Back',
    search: 'Search...',
    noResults: 'No results found',
  },
  ms: {
    // Dashboard
    dashboard: 'Papan Pemuka',
    totalRevenue: 'Jumlah Hasil',
    pendingAmount: 'Jumlah Tertunggak',
    overdueAmount: 'Jumlah Lewat JTempo',
    paidThisMonth: 'Dibayar Bulan Ini',
    totalClients: 'Jumlah Klien',
    totalInvoices: 'Jumlah Invois',

    // Invoices
    invoices: 'Invois',
    createInvoice: 'Cipta Invois',
    invoiceNumber: 'Nombor Invois',
    issueDate: 'Tarikh Keluaran',
    dueDate: 'Tarikh Jemu',
    status: 'Status',
    total: 'Jumlah',
    actions: 'Tindakan',
    view: 'Lihat',
    edit: 'Edit',
    delete: 'Padam',
    downloadPDF: 'Muat Turun PDF',
    print: 'Cetak',
    copy: 'Salin',
    convertToQuotation: 'Tukar kepada Sebut Harga',
    recordPayment: 'Rekod Pembayaran',
    email: 'E-mel',

    // Invoice Types
    draft: 'Draf',
    pending: 'Tertunggak',
    paid: 'Dibayar',
    overdue: 'Lewat JTempo',
    partial: 'Separa',

    // Clients
    clients: 'Klien',
    addClient: 'Tambah Klien',
    clientName: 'Nama Klien',
    phone: 'Telefon',
    address: 'Alamat',
    company: 'Syarikat',

    // Products
    products: 'Produk',
    addProduct: 'Tambah Produk',
    productName: 'Nama Produk',
    sku: 'SKU',
    price: 'Harga',

    // Settings
    settings: 'Tetapan',
    companyInfo: 'Maklumat Syarikat',
    paymentInfo: 'Maklumat Pembayaran',
    taxRate: 'Kadar Cukai',
    currency: 'Mata Wang',

    // Common
    save: 'Simpan',
    cancel: 'Batal',
    back: 'Kembali',
    search: 'Cari...',
    noResults: 'Tiada hasil dijumpai',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
