'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InvoiceItem } from '@/types';
import { calculateItemTotal } from '@/lib/helpers';
import { X } from 'lucide-react';

interface LineItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InvoiceItem | null;
  products: Array<{ id: string; name: string; price: number }>;
  onSave: (item: InvoiceItem) => void;
}

export function LineItemDialog({
  open,
  onOpenChange,
  item,
  products,
  onSave,
}: LineItemDialogProps) {
  const [formData, setFormData] = useState({
    description: '',
    quantity: 1,
    unitPrice: 0,
    tax: 0,
    discount: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        tax: item.tax,
        discount: item.discount,
      });
    } else {
      setFormData({
        description: '',
        quantity: 1,
        unitPrice: 0,
        tax: 0,
        discount: 0,
      });
    }
  }, [item, open]);

  const total = calculateItemTotal(
    formData.quantity,
    formData.unitPrice,
    formData.tax,
    formData.discount
  );

  const handleSave = () => {
    if (!formData.description.trim()) {
      return;
    }

    const newItem: InvoiceItem = {
      id: item?.id || crypto.randomUUID(),
      description: formData.description,
      quantity: formData.quantity,
      unitPrice: formData.unitPrice,
      tax: formData.tax,
      discount: formData.discount,
      total,
    };

    onSave(newItem);
    onOpenChange(false);
  };

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setFormData({
        ...formData,
        description: product.name,
        unitPrice: product.price,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? 'Edit Line Item' : 'Add Line Item'}</DialogTitle>
          <DialogDescription>
            {item ? 'Update the item details below.' : 'Enter the item details below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Selection */}
          {products.length > 0 && (
            <div>
              <Label>Quick Select Product</Label>
              <Select
                value=""
                onValueChange={(value) => value && handleSelectProduct(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Item description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Unit Price */}
            <div>
              <Label htmlFor="unitPrice">Unit Price *</Label>
              <Input
                id="unitPrice"
                type="number"
                min="0"
                step="0.01"
                value={formData.unitPrice}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    unitPrice: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tax */}
            <div>
              <Label htmlFor="tax">Tax %</Label>
              <Input
                id="tax"
                type="number"
                min="0"
                max="100"
                value={formData.tax}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tax: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Discount */}
            <div>
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                max="100"
                value={formData.discount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    discount: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>
          </div>

          {/* Total Preview */}
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-lg font-bold">
                {total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!formData.description.trim()}
          >
            {item ? 'Update' : 'Add'} Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
