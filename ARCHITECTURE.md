# ARCHITECTURE.md — Invoice

> Professional invoicing for Malaysian businesses. Ringgit-first, SST-ready, localStorage-powered.
> **Revamp July 20, 2026**: Warm paper design system, amber-copper accent, CSS charts, Resend email, e-invoicing fields.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router, webpack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, OKLCH color space |
| UI | shadcn/ui (card, button, table, dialog, dropdown, select, badge, input, textarea, avatar) |
| Icons | Lucide React |
| Fonts | Manrope (body, next/font) + JetBrains Mono (monospace) |
| State | Zustand (localStorage persistence) |
| Charts | CSS-only (conic-gradient donut, flex bars) |
| PDF | jsPDF + jspdf-autotable |
| Email | Resend (`/api/send-invoice`) |
| PWA | Serwist (service worker, offline) |
| Drag & Drop | @dnd-kit (invoice line items) |
| Hosting | Vercel (auto-deploy) |

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Dashboard — KPIs, revenue trend bars, status donut, top clients, quick actions |
| `/invoices` | Invoice list — stats strip, filters (status/type), search, mobile cards + desktop table |
| `/invoices/new` | Create invoice — client select, line items, drag-drop, SST, recurring |
| `/invoices/[id]` | View invoice — detail, PDF download, payment recording, email |
| `/invoices/[id]/edit` | Edit invoice — same form as new, pre-filled |
| `/clients` | Client list — stats, search, add/edit/delete dialogs |
| `/clients/new` | Add client form |
| `/products` | Product list — stats, add/edit/delete |
| `/products/new` | Add product form |
| `/settings` | Settings — company info, e-invoicing (TIN/SST/MSIC), invoice prefixes, tax, data export/import |
| `/api/send-invoice` | POST — sends invoice email via Resend |

## Data Model

All data persisted in browser localStorage. No backend database required.

### Invoice

| Field | Type | Notes |
|-------|------|-------|
| `id` | string | UUID |
| `invoiceNumber` | string | Auto-generated (INV-0001, QUOT-0001) |
| `type` | 'invoice' \| 'quotation' | |
| `status` | 'draft' \| 'pending' \| 'paid' \| 'overdue' \| 'partial' | |
| `clientId` / `client` | string / Client | Denormalized client snapshot |
| `items` | InvoiceItem[] | Description, qty, unitPrice, tax, discount, total |
| `currency` | string | RM default |
| `taxRate` | number | Overall SST rate (0, 6, 8) |
| `subtotal` / `taxAmount` / `discountAmount` / `total` | number | Computed |
| `issueDate` / `dueDate` | ISO string | |
| `paidDate` / `paidAmount` | ISO string / number | Filled on payment |
| `recurring` | RecurringType | none, weekly, monthly, etc. |
| `payments` | Payment[] | Partial payment records |
| `einvoiceUuid` / `einvoiceQrCode` | string? | MyInvois placeholder |
| `remindersSent` | ReminderRecord[]? | { date, method } history |

### Settings

| Field | Notes |
|-------|-------|
| `companyInfo` | name, email, phone, address, logo, tin, sstNumber, msicCode |
| `currency` / `taxRate` | Default RM / 0 |
| `invoicePrefix` / `startingNumber` | INV / 1 |
| `quotationPrefix` / `quotationStartingNumber` | QUOT / 1 |
| `defaultTerms` / `defaultNotes` / `paymentInfo` | Text templates |

## Component Tree

```
layout.tsx
  ├── Sidebar (desktop: fixed left, logo + 5 nav links + active indicator)
  ├── Header (sticky top, search with ⌘K dropdown, status dots)
  ├── <main>{children}</main>
  └── BottomNav (mobile: fixed bottom, 5 icon+label links)

Dashboard (page.tsx)
  ├── Header (title + New Invoice CTA)
  ├── KPI Cards (4-col grid: Revenue, Pending, Overdue, Paid/Month)
  ├── Revenue Trend (CSS flex bars, last 6 months)
  ├── Status Donut (conic-gradient + radial mask, legend)
  ├── Top Clients (ranked bars from MMI pattern)
  └── Quick Actions (3 links + pending reminder CTA)

Invoices (invoices/page.tsx)
  ├── Stats Strip (5 compact stat blocks)
  ├── Filter Bar (search + type dropdown + status dropdown)
  └── Mobile Cards / Desktop Table (status badges, payment dialog, actions dropdown)

Invoice Detail ([id]/page.tsx)
  ├── Status header + actions (Edit, Download, Email, Record Payment)
  ├── Client & invoice info grid
  ├── Line items table
  └── Payments history

Settings (settings/page.tsx)
  ├── Company Info (name, email, phone, address, TIN, SST, MSIC)
  ├── Invoice Defaults (prefixes, tax rate, currency)
  ├── Templates (default terms, notes, payment info)
  └── Data Management (export JSON, import JSON, clear all)
```

## Design System

### Color (Warm Paper + Amber-Copper)

- **Background**: `oklch(98.5% 0.005 75)` — warm paper white, barely perceptible amber tint
- **Foreground**: `oklch(22% 0.012 75)` — warm dark ink
- **Primary**: `oklch(56% 0.14 55)` — amber-copper (CTAs, active states, selection)
- **Success**: `oklch(58% 0.16 160)` — green (paid status only, semantic)
- **Warning**: `oklch(68% 0.16 85)` — amber (pending status)
- **Destructive**: `oklch(54% 0.22 25)` — red (overdue, delete)
- **Info**: `oklch(55% 0.14 245)` — blue (secondary actions)

### Typography

- **Body**: Manrope (next/font/google), single family for all UI
- **Mono**: JetBrains Mono (SKU codes, invoice numbers)
- Consistent `font-semibold` for headings, `font-medium` for labels, no display fonts in UI

### Anti-patterns avoided

- No slate/emerald/green-everywhere (previous design)
- No Recharts dependency (replaced with CSS-only charts)
- No nested cards, side-stripe borders, gradient text, glassmorphism
- No AI-slop: purple gradients, identical card grids, hero-metric templates

## Key Patterns

- **CSS donut chart**: `conic-gradient` + `radial-gradient` mask, zero JS
- **CSS bar chart**: Flexbox `items-end` with percentage heights, 6-month adaptivity
- **Ranked client bars**: Progress bars with computed `(revenue / max) * 100%` width
- **localStorage persistence**: Zustand store reads/writes via storage helpers, no DB
- **Denormalized client**: Invoice stores full client snapshot at creation time
- **Status badges**: Per-status color classes (`STATUS_STYLES` record) for consistency

## Directory Map

```
invoice/
├── app/
│   ├── page.tsx                    # Dashboard
│   ├── layout.tsx                  # Root layout (Manrope + JetBrains Mono)
│   ├── globals.css                 # Tailwind v4 + OKLCH tokens + print styles
│   ├── invoices/
│   │   ├── page.tsx                # Invoice list
│   │   ├── new/page.tsx            # Create invoice
│   │   └── [id]/page.tsx + edit/   # View + edit
│   ├── clients/
│   │   ├── page.tsx                # Client list
│   │   └── new/page.tsx            # Add client
│   ├── products/
│   │   ├── page.tsx                # Product list
│   │   └── new/page.tsx            # Add product
│   ├── settings/page.tsx           # Settings
│   └── api/send-invoice/route.ts   # Resend email API
├── components/
│   ├── layout/                     # Sidebar, Header, BottomNav
│   ├── ui/                         # shadcn/ui (button, card, table, dialog, etc.)
│   ├── invoices/                   # LineItemList, LineItemDialog
│   ├── email-dialog.tsx            # Send invoice via Resend
│   └── payment-dialog.tsx          # Record payment
├── lib/
│   ├── store/useStore.ts           # Zustand store
│   ├── storage.ts                  # localStorage helpers
│   ├── helpers.ts                  # formatCurrency, formatDate, getInvoiceStatusColor
│   └── pdf-generator.ts            # jsPDF invoice generation
├── types/index.ts                  # TypeScript interfaces
├── contexts/                       # Alert + Theme providers
└── public/                         # Icons, manifest, PWA assets
```

## Deployment

- **Platform**: Vercel (auto-deploy on push to main)
- **Domain**: invoice.cognitio.my
- **Build**: `npm run build` (Next.js + webpack, Serwist SW bundling)
- **Env vars**: `RESEND_API_KEY` (for email sending)
