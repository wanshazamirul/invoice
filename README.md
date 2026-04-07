# 🧾 Invoice App - Professional Invoicing System

**Full-featured invoicing application built with Next.js 16, TypeScript, and localStorage**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)

## 🛠️ Development Workflow

### ⚠️ IMPORTANT: Always Build Before Pushing!

```bash
# Make changes
# ... edit files ...

# BUILD FIRST (Required!)
npm run build

# If build passes, then commit
git add .
git commit -m "your message"
git push
```

**Why?** Building first catches TypeScript errors and prevents broken commits from reaching the repository.

## ✨ Features

### 📊 Dashboard
- Real-time statistics (revenue, pending, overdue, paid this month)
- Quick action cards
- Business overview at a glance
- Interactive charts with Recharts

### 👥 Client Management (CRM)
- Add, edit, delete clients
- Company and individual client support
- Contact information (email, phone, address)
- Client statistics and filtering

### 📦 Product/Service Management
- Create reusable products/services
- SKU support
- Price management
- Quick add to invoices

### 🧾 Invoice Management
- Create professional invoices
- Quotation support (convert to invoice)
- Multiple line items with:
  - Quantity, price, tax, discount per item
  - Automatic calculations
  - Product selection
- Tax calculation (SST support)
- Discount support
- Recurring invoices (weekly, monthly, quarterly, yearly)
- Invoice status tracking (draft, pending, paid, overdue, partial)
- Filter by type and status

### ⚙️ Settings
- Company information management
- Invoice number customization (prefix, starting number)
- Tax rate configuration
- Currency selection (RM, USD, SGD, EUR, GBP)
- Default notes and terms
- Payment information
- **Data Export/Import** (JSON backup)
- **Clear all data** option

### 🎨 UI/UX
- Clean, modern interface
- Responsive design (mobile, tablet, desktop)
- Dark mode ready
- Professional color scheme
- Smooth animations (Framer Motion)
- shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Storage**: localStorage (no database needed!)
- **Icons**: Lucide React
- **PDF Generation**: jsPDF (ready to implement)
- **Charts**: Recharts

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/wanshazamirul/invoice.git
cd invoice

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

## 📖 Usage

### First Time Setup

1. **Configure Settings** (Settings → Company)
   - Add your company information
   - Set invoice prefix and starting number
   - Configure tax rate (SST 8% for Malaysia)
   - Add payment information

2. **Add Clients** (Clients → Add Client)
   - Add your clients with contact details
   - Separate company and individual clients

3. **Add Products/Services** (Products → Add Product)
   - Create reusable items for quick invoicing
   - Set prices and SKUs

4. **Create Invoice** (Invoices → Create Invoice)
   - Select client
   - Add line items (or select from products)
   - Review totals
   - Save as draft or send

### Data Management

- **Export Data**: Settings → Data → Export All Data
- **Import Data**: Settings → Data → Import from JSON file
- **Clear Data**: Settings → Data → Danger Zone (deletes everything!)

## 🎯 Features Coming Soon

- [ ] PDF generation and download
- [ ] Email invoices directly
- [ ] Invoice templates (multiple designs)
- [ ] Payment tracking (partial payments)
- [ ] Dashboard charts (revenue over time)
- [ ] Multi-language support
- [ ] Quick copy invoice
- [ ] Invoice to quotation conversion
- [ ] Search functionality
- [ ] Print preview

## 📁 Project Structure

```
invoice/
├── app/                      # Next.js app directory
│   ├── clients/             # Clients page
│   ├── invoices/            # Invoices pages
│   │   ├── new/            # Create invoice
│   │   └── [id]/           # View/edit invoice (coming)
│   ├── products/            # Products page
│   ├── settings/            # Settings page
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/
│   ├── layout/              # Layout components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── store/              # Zustand store
│   │   └── useStore.ts     # Global state
│   ├── storage.ts          # localStorage helpers
│   └── helpers.ts          # Utility functions
└── types/
    └── index.ts            # TypeScript types
```

## 💡 Key Features Explained

### localStorage Persistence
All data is stored in browser's localStorage:
- **No database setup required**
- **Works offline**
- **Instant access**
- **Easy backup/restore**

### Automatic Calculations
- Line item totals (quantity × price + tax - discount)
- Subtotal, tax amount, discount amount
- Grand total
- All calculations update in real-time

### Malaysian Business Ready
- SST tax support (6% or 8%)
- RM currency default
- Malaysian address format
- Local payment gateway support (ready for integration)

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📝 License

This project is open source and available under the MIT License.

## 👤 Author

**Wan Shaz Amirul**
- GitHub: [@wanshazamirul](https://github.com/wanshazamirul)
- Portfolio: [cognitio.my](https://cognitio.my)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)
- State management by [Zustand](https://zustand-demo.pmnd.rs)

---

**Built with ❤️ using Next.js 16 + TypeScript + Tailwind CSS v4**

