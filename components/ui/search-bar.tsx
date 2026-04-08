'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isExpanded, setIsExpanded] = useState(false);

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
      {/* Desktop version */}
      <div className="hidden sm:block relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
          ⌘K
        </div>
        <Input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="pr-10"
          onKeyDown={(e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              (e.target as HTMLInputElement).focus();
            }
          }}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
      </div>

      {/* Mobile version - Icon only when collapsed */}
      <div className="sm:hidden">
        {!isExpanded ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(true)}
            className="h-9 w-9"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </Button>
        ) : (
          <div className="relative flex items-center gap-2">
            <Input
              type="text"
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              placeholder={placeholder}
              className="flex-1"
              autoFocus
              onBlur={() => {
                if (!localValue) {
                  setIsExpanded(false);
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setLocalValue('');
                onChange('');
                setIsExpanded(false);
              }}
              className="h-9 w-9"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
