'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { generateId, formatCurrency } from '@/lib/helpers';

export default function ProductsPage() {
  const { products, loadData, addProduct, updateProduct, deleteProduct } = useStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', sku: '' });

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => { setForm({ name: '', description: '', price: '', sku: '' }); setEditing(null); };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: p.price.toString(), sku: p.sku || '' });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Product = {
      id: editing?.id || generateId(),
      name: form.name,
      description: form.description || undefined,
      price: parseFloat(form.price),
      sku: form.sku || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) { updateProduct(data); } else { addProduct(data); }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this product?')) deleteProduct(id);
  };

  return (
    <div className="py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">{products.length} items</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="rounded-lg border border-border px-4 py-2">
          <span className="text-muted-foreground">Total </span>
          <span className="font-bold">{products.length}</span>
        </div>
        <div className="rounded-lg border border-border px-4 py-2">
          <span className="text-muted-foreground">Avg price </span>
          <span className="font-bold">
            {products.length > 0
              ? formatCurrency(products.reduce((s, p) => s + p.price, 0) / products.length)
              : formatCurrency(0)}
          </span>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No products yet.</p>
          <Button onClick={openAdd} variant="outline"><Plus className="w-4 h-4 mr-1.5" /> Add your first product</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p) => (
            <div key={p.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{p.name}</p>
                  {p.sku && (
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{p.sku}</p>
                  )}
                </div>
                <p className="text-lg font-bold tabular-nums shrink-0">{formatCurrency(p.price)}</p>
              </div>
              {p.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
              )}
              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(p)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground text-xs flex items-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground text-xs flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Name *</Label>
              <Input id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price (RM) *</Label>
                <Input id="p-price" type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-sku">SKU</Label>
                <Input id="p-sku" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="e.g. SRV-001" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add'} Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
