'use client';

import { Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function Header() {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {/* Search - Hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:block flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              type="search"
              placeholder="Search invoices, clients..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Mobile Title - Only shown on mobile */}
        <div className="sm:hidden">
          <h1 className="text-lg font-semibold text-slate-900">Invoice App</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Bell className="w-5 h-5" />
          </Button>

          <Avatar className="w-8 h-8 sm:w-10 sm:h-10">
            <AvatarFallback className="bg-emerald-600 text-white text-xs sm:text-sm">
              WA
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
