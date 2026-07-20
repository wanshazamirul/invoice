'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FileText, Users, Package, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '', label: 'New', icon: Plus, isAction: true },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-background/80 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        {links.map((l) => {
          const Icon = l.icon;
          const active = l.href === '/' ? pathname === '/' : l.href && pathname.startsWith(l.href);

          if (l.isAction) {
            return (
              <Link
                key="new"
                href="/invoices/new"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-lg -mt-3 hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </Link>
            );
          }

          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors',
                active ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
