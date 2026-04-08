'use client';

import { InvoiceItem } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, GripVertical } from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';
import { cn } from '@/lib/utils';

interface LineItemListProps {
  items: InvoiceItem[];
  currency: string;
  onEdit: (item: InvoiceItem) => void;
  onDelete: (id: string) => void;
}

export function LineItemList({ items, currency, onEdit, onDelete }: LineItemListProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          <p>No items added yet</p>
          <p className="text-sm mt-1">Click "Add Item" to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <Card
          key={item.id}
          className="group relative overflow-hidden transition-all hover:shadow-md"
        >
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              {/* Drag Handle (visual only for now) */}
              <div className="flex items-center justify-center w-6 text-muted-foreground cursor-grab">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Item Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Qty: {item.quantity} × {currency}
                      {item.unitPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {currency}
                      {item.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Tax/Discount badges */}
                {(item.tax > 0 || item.discount > 0) && (
                  <div className="flex gap-2 mt-2">
                    {item.tax > 0 && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        Tax: {item.tax}%
                      </span>
                    )}
                    {item.discount > 0 && (
                      <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                        Discount: {item.discount}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons - Always visible on mobile, visible on hover on desktop */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item)}
                  className="h-8 w-8 flex-shrink-0"
                  aria-label="Edit item"
                >
                  <Pencil className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                  className="h-8 w-8 flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label="Delete item"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
