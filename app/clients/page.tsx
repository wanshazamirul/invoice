'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Client } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, MoreVertical, Pencil, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { generateId } from '@/lib/helpers';
import { SearchBar } from '@/components/ui/search-bar';
import { useAlert } from '@/contexts/alert-context';

export default function ClientsPage() {
  const { clients, loadData, addClient, updateClient, deleteClient } = useStore();
  const { success, error } = useAlert();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
  });

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      company: '',
    });
    setSelectedClient(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      company: client.company || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      deleteClient(id);
      success('Client deleted', 'The client has been removed successfully.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const clientData: Client = {
      id: selectedClient?.id || generateId(),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      company: formData.company || undefined,
      createdAt: selectedClient?.createdAt || new Date().toISOString(),
    };

    if (selectedClient) {
      updateClient(clientData);
      setIsEditDialogOpen(false);
    } else {
      addClient(clientData);
      setIsAddDialogOpen(false);
    }

    resetForm();
  };

  const filteredClients = clients.filter((client) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.email.toLowerCase().includes(query) ||
      client.phone.includes(query) ||
      client.company?.toLowerCase().includes(query) ||
      client.address.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-2">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-slate-100">Clients</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1 text-[10px] sm:text-sm">Manage your client database</p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search clients..."
          />
          <Button onClick={handleAdd} className="gap-1">
            <Plus className="w-3 h-3" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Cards - Compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:hidden">
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-600 dark:text-slate-400">Total</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{clients.length}</span>
        </div>
        <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-600 dark:text-slate-400">Companies</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{clients.filter(c => c.company).length}</span>
        </div>
        <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-900/20 rounded-lg px-3 py-2">
          <span className="text-[10px] text-slate-600 dark:text-slate-400">Individuals</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{clients.filter(c => !c.company).length}</span>
        </div>
      </div>

      {/* Desktop Stats Cards */}
      <div className="hidden sm:grid grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Clients</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">{clients.length}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Companies</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {clients.filter(c => c.company).length}
                </p>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <MapPin className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 px-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Individuals</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-100 mt-2">
                  {clients.filter(c => !c.company).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600 dark:text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500 mb-4">No clients yet. Add your first client!</p>
              <Button onClick={handleAdd} variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Client
              </Button>
            </div>
          ) : (
            <>
              {/* Mobile Card Layout - Ultra Compact */}
              <div className="md:hidden space-y-1">
                {filteredClients.map((client) => (
                  <Card
                    key={client.id}
                    className="hover:shadow-md transition-shadow cursor-pointer active:scale-[0.98] py-1"
                  >
                    <CardContent className="p-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[11px] text-slate-900 dark:text-slate-100 truncate leading-tight">{client.name}</h3>
                          <p className="text-[9px] text-slate-600 dark:text-slate-400 truncate leading-tight">{client.email}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0 ml-1.5 text-slate-600 dark:text-slate-400" aria-label="More options">
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-[150px]">
                            <DropdownMenuItem onClick={() => handleEdit(client)} aria-label="Edit client">
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 dark:text-red-400"
                              aria-label="Delete client"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table Layout */}
              <Table className="hidden md:table">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100">{client.name}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">{client.email}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">{client.phone}</TableCell>
                      <TableCell className="text-slate-900 dark:text-slate-100">
                        {client.company ? (
                          <Badge variant="secondary">{client.company}</Badge>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" size="icon" aria-label="More options">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(client)} aria-label="Edit client">
                              <Pencil className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(client.id)}
                              className="text-red-600 dark:text-red-400"
                              aria-label="Delete client"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Add Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-company">Company (Optional)</Label>
              <Input
                id="edit-company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Update Client</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
