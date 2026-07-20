'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store/useStore';

export default function Header() {
  const { settings, invoices, clients } = useStore();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const router = useRouter();

  const results =
    query.trim().length > 0
      ? [
          ...invoices
            .filter(
              (inv) =>
                inv.invoiceNumber
                  ?.toLowerCase()
                  .includes(query.toLowerCase()) ||
                inv.status?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 3)
            .map((inv) => ({
              type: 'invoice' as const,
              id: inv.id,
              label: inv.invoiceNumber || `Invoice #${inv.id.slice(0, 8)}`,
              sub: inv.status,
            })),
          ...clients
            .filter(
              (c) =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.email?.toLowerCase().includes(query.toLowerCase())
            )
            .slice(0, 2)
            .map((c) => ({
              type: 'client' as const,
              id: c.id,
              label: c.name,
              sub: c.email || c.phone || '',
            })),
        ].slice(0, 5)
      : [];

  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Search */}
        <div className="hidden sm:block flex-1 max-w-sm relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices, clients..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 200)}
              className="pl-10 h-9 text-sm"
            />
            {!query && !focused && (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            )}
          </div>

          {/* Search results dropdown */}
          {focused && results.length > 0 && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onMouseDown={() => {
                    router.push(
                      r.type === 'invoice'
                        ? `/invoices/${r.id}`
                        : `/clients`
                    );
                    setQuery('');
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-muted transition-colors flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium truncate">
                    {r.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground capitalize shrink-0">
                    {r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile title */}
        <div className="sm:hidden">
          <h1 className="text-sm font-semibold">
            {settings.companyInfo.name || 'Invoice'}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success" />
            <span>
              {invoices.filter((i) => i.status === 'paid').length} paid
            </span>
            <span className="text-border">|</span>
            <span className="w-1.5 h-1.5 rounded-full bg-destructive" />
            <span>
              {invoices.filter((i) => i.status === 'overdue').length} overdue
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
