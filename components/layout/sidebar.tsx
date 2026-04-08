'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Package,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store/useStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { settings } = useStore();

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-slate-900 dark:bg-slate-950 text-white">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700 dark:border-slate-800">
          <h1 className="text-xl font-bold">{settings.companyInfo.name || 'Invoice App'}</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Professional Invoicing</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 dark:text-slate-400 hover:bg-slate-800 dark:hover:bg-slate-800 hover:text-white dark:hover:text-white'
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 dark:border-slate-800">
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">
            Built with Next.js 16 + TypeScript
          </p>
        </div>
      </div>
    </aside>
  );
}
