'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
  Plus,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store/useStore';
import { useTheme } from '@/contexts/theme-context';

const links = [
  { href: '/', label: 'Overview', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
];

export function NavBar() {
  const pathname = usePathname();
  const { actualTheme, setTheme } = useTheme();
  const { settings } = useStore();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center gap-1">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-sm hidden sm:inline">
            {settings.companyInfo.name || 'Invoice'}
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-0.5">
          {links.map((l) => {
            const Icon = l.icon;
            const active = isActive(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="w-4 h-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Settings */}
        <Link
          href="/settings"
          className={cn(
            'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            isActive('/settings')
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="hidden lg:inline">Settings</span>
        </Link>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(actualTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle theme"
        >
          {actualTheme === 'dark' ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>

        {/* New invoice CTA */}
        <Link
          href="/invoices/new"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity ml-1"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New</span>
        </Link>
      </div>
    </header>
  );
}
