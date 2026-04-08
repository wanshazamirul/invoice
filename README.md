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
- **Hybrid Desktop/Mobile Interface**:
  - Desktop: Table-based inline editing for efficiency
  - Mobile: Modal-based editing for better space utilization
  - Card-based list view on mobile with touch-friendly controls
- **Drag-and-Drop Reordering** (Mobile):
  - Long-press grip handle to reorder line items
  - Visual feedback during drag
  - Smooth animations and transitions
- Multiple line items with:
  - Quantity, price, tax, discount per item
  - Automatic calculations with NaN prevention
  - Product selection dropdown
  - Modal editing on mobile
- Tax calculation (SST support)
- Discount support
- Recurring invoices (weekly, monthly, quarterly, yearly)
- Invoice status tracking (draft, pending, paid, overdue, partial)
- Filter by type and status
- Search functionality with keyboard shortcut (⌘K)

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
- **Mobile-First Responsive Design**:
  - Optimized input sizing for touch (13px font, 34px height)
  - Improved bottom navbar positioning (pt-4 for better spacing)
  - Touch-friendly buttons with proper sizing (min 32px touch targets)
  - Safe area insets for notched devices
- **Accessibility Improvements**:
  - ARIA labels on all interactive elements
  - Proper text alignment (left-aligned inputs)
  - Keyboard navigation support
  - Screen reader friendly
- Desktop/Mobile hybrid approach where appropriate
- Dark mode ready
- Professional color scheme (OKLCH color space)
- Smooth animations and transitions
- shadcn/ui components with Base UI React

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router + Turbopack)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 (OKLCH color space)
- **UI Components**: shadcn/ui + Base UI React
- **State Management**: Zustand
- **Drag & Drop**: @dnd-kit (touch-friendly)
- **Storage**: localStorage (no database needed!)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Context**: Alert Context for notifications

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

### 📝 Recent Updates (April 2026)

**Mobile Experience Enhancements**:
- ✅ Implemented drag-and-drop line item reordering for mobile
- ✅ Hybrid desktop/mobile interface (table on desktop, modal on mobile)
- ✅ Improved mobile input sizing (13px font, 34px height for readability)
- ✅ Fixed bottom navbar positioning (better spacing)
- ✅ Moved search icon to right side of search bar
- ✅ Added NaN prevention in calculations (shows 0 instead of NaN)
- ✅ Improved button alignment and touch targets
- ✅ Added ARIA labels for better accessibility

**Technical Improvements**:
- ✅ Added @dnd-kit for touch-friendly drag and drop
- ✅ Created reusable LineItemDialog component
- ✅ Created LineItemList component for mobile card view
- ✅ Improved form validation and error handling
- ✅ Enhanced TypeScript strict mode compliance

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
- [ ] Multiple invoice templates (modern, classic, minimal)
- [ ] Payment tracking (partial payments)
- [ ] Advanced dashboard charts (revenue trends, client analytics)
- [ ] Multi-language support (Bahasa Melayu, Chinese)
- [ ] Quick copy invoice from existing
- [ ] Invoice to quotation conversion
- [ ] Print preview mode
- [ ] Bulk invoice actions
- [ ] Client portal for invoice viewing
- [ ] Payment gateway integration (Stripe, billplz)

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

