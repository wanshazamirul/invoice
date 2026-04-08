'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { generateId } from '@/lib/helpers';
import { useAlert } from '@/contexts/alert-context';

export default function NewProductPage() {
  const router = useRouter();
  const { addProduct } = useStore();
  const { error, success } = useAlert();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sku: '',
  });

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      error('Missing information', 'Please fill in all required fields.');
      return;
    }

    const newProduct = {
      id: generateId(),
      name: formData.name,
      description: formData.description || undefined,
      price: parseFloat(formData.price),
      sku: formData.sku || undefined,
      createdAt: new Date().toISOString(),
    };

    addProduct(newProduct);
    success('Product created', `${formData.name} has been added successfully.`);
    router.push('/products');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push('/products')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Product</h1>
          <p className="text-slate-600 mt-2">Add a new product or service</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Web Design Service"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="WEB-001"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Product description"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => router.push('/products')}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Save className="w-4 h-4" />
              Save Product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
