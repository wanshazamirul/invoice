'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Client } from '@/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Users, Mail, Phone, Building2, Pencil, Trash2, Search } from 'lucide-react';
import { generateId } from '@/lib/helpers';
import { useAlert } from '@/contexts/alert-context';

export default function ClientsPage() {
  const { clients, loadData, addClient, updateClient, deleteClient } = useStore();
  const { success } = useAlert();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [query, setQuery] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', company: '' });

  useEffect(() => { loadData(); }, [loadData]);

  const resetForm = () => {
    setForm({ name: '', email: '', phone: '', address: '', company: '' });
    setEditing(null);
  };

  const openAdd = () => { resetForm(); setDialogOpen(true); };
  const openEdit = (c: Client) => {
    setEditing(c);
    setForm({ name: c.name, email: c.email, phone: c.phone, address: c.address, company: c.company || '' });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Client = {
      id: editing?.id || generateId(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      company: form.company || undefined,
      createdAt: editing?.createdAt || new Date().toISOString(),
    };
    if (editing) { updateClient(data); } else { addClient(data); }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this client?')) { deleteClient(id); success('Deleted', 'Client removed.'); }
  };

  const filtered = clients.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.includes(q) || c.company?.toLowerCase().includes(q);
  });

  return (
    <div className="py-6 sm:py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">{clients.length} total</p>
        </div>
        <Button onClick={openAdd} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search clients..."
          className="pl-10"
        />
      </div>

      {/* Client cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">{clients.length === 0 ? 'No clients yet.' : 'No matches.'}</p>
          {clients.length === 0 && (
            <Button onClick={openAdd} variant="outline"><Plus className="w-4 h-4 mr-1.5" /> Add your first client</Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm hover:border-primary/20 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-lg bg-info/10 text-info flex items-center justify-center shrink-0 font-bold text-sm">
                    {c.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    {c.company && <p className="text-xs text-muted-foreground truncate">{c.company}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {c.email && (
                  <p className="flex items-center gap-1.5"><Mail className="w-3 h-3 shrink-0" /> {c.email}</p>
                )}
                {c.phone && (
                  <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" /> {c.phone}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Client' : 'New Client'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="c-name">Name *</Label>
              <Input id="c-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">Email *</Label>
              <Input id="c-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">Phone *</Label>
              <Input id="c-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-company">Company</Label>
              <Input id="c-company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-address">Address *</Label>
              <Textarea id="c-address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required rows={2} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit">{editing ? 'Update' : 'Add'} Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
