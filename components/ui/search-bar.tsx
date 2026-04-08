'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(handler);
  }, [localValue, onChange]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      <Input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="pl-10"
        onKeyDown={(e) => {
          if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            (e.target as HTMLInputElement).focus();
          }
        }}
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400 hidden sm:block">
        ⌘K
      </div>
    </div>
  );
}
