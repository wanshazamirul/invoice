'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/clients', label: 'Clients', icon: Users },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-40 safe-area-bottom">
      <div className="flex items-center justify-center gap-1 h-[56px] pt-1 pb-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-start flex-1 h-full transition-colors duration-150',
                isActive
                  ? 'text-emerald-600 dark:text-emerald-500'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              )}
            >
              <div className="relative flex items-center justify-center">
                <div className={cn(
                  'p-1.5 rounded-lg transition-all duration-150',
                  isActive ? 'bg-emerald-100 dark:bg-emerald-950' : ''
                )}>
                  <Icon className={cn(
                    'w-5 h-5 transition-all duration-150',
                    isActive && 'scale-110'
                  )} />
                </div>
              </div>
              <span className={cn(
                'text-[10px] mt-0.5 font-medium transition-all duration-150',
                isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-400 dark:text-slate-500'
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
