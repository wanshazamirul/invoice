'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Settings, Download, Upload, Trash2, Save, Building2, FileText, Database } from 'lucide-react';
import { useAlert } from '@/contexts/alert-context';

export default function SettingsPage() {
  const { settings, updateSettings, exportAllData, importAllData } = useStore();
  const { success, error: showError } = useAlert();
  const [local, setLocal] = useState(settings);
  const [saved, setSaved] = useState(false);

  useEffect(() => { setLocal(settings); }, [settings]);

  const handleSave = () => {
    updateSettings(local);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    success('Exported', 'Backup downloaded.');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          importAllData(data);
          success('Imported', 'Data restored.');
        } catch {
          showError('Failed', 'Invalid backup file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClear = () => {
    if (confirm('Delete ALL data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="py-6 sm:py-10 space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your invoice preferences.</p>
      </div>

      {/* Company Info */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h2>
        </div>
        <div className="rounded-xl border border-border p-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-name">Company Name</Label>
            <Input id="s-name" value={local.companyInfo.name} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, name: e.target.value } })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-email">Email</Label>
              <Input id="s-email" type="email" value={local.companyInfo.email} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, email: e.target.value } })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-phone">Phone</Label>
              <Input id="s-phone" value={local.companyInfo.phone} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, phone: e.target.value } })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-address">Address</Label>
            <Textarea id="s-address" value={local.companyInfo.address} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, address: e.target.value } })} rows={2} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-tin">TIN</Label>
              <Input id="s-tin" value={local.companyInfo.tin || ''} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, tin: e.target.value } })} placeholder="C-000000000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-sst">SST Number</Label>
              <Input id="s-sst" value={local.companyInfo.sstNumber || ''} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, sstNumber: e.target.value } })} placeholder="SST-000000" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-msic">MSIC Code</Label>
              <Input id="s-msic" value={local.companyInfo.msicCode || ''} onChange={(e) => setLocal({ ...local, companyInfo: { ...local.companyInfo, msicCode: e.target.value } })} placeholder="62010" />
            </div>
          </div>
        </div>
      </section>

      {/* Invoice defaults */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Invoice Defaults</h2>
        </div>
        <div className="rounded-xl border border-border p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-inv-prefix">Invoice Prefix</Label>
              <Input id="s-inv-prefix" value={local.invoicePrefix} onChange={(e) => setLocal({ ...local, invoicePrefix: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-inv-start">Starting Number</Label>
              <Input id="s-inv-start" type="number" value={local.startingNumber} onChange={(e) => setLocal({ ...local, startingNumber: parseInt(e.target.value) || 1 })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="s-curr">Currency</Label>
              <Input id="s-curr" value={local.currency} onChange={(e) => setLocal({ ...local, currency: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-tax">Default SST (%)</Label>
              <Input id="s-tax" type="number" value={local.taxRate} onChange={(e) => setLocal({ ...local, taxRate: parseFloat(e.target.value) || 0 })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-terms">Default Terms</Label>
            <Textarea id="s-terms" value={local.defaultTerms} onChange={(e) => setLocal({ ...local, defaultTerms: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-notes">Default Notes</Label>
            <Textarea id="s-notes" value={local.defaultNotes} onChange={(e) => setLocal({ ...local, defaultNotes: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-payment">Payment Info</Label>
            <Textarea id="s-payment" value={local.paymentInfo} onChange={(e) => setLocal({ ...local, paymentInfo: e.target.value })} rows={2} placeholder="Bank account details shown on invoices..." />
          </div>
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="gap-1.5">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
        {saved && <span className="text-sm text-success font-medium">Settings updated.</span>}
      </div>

      {/* Data Management */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Data</h2>
        </div>
        <div className="rounded-xl border border-border p-5">
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-1.5">
              <Download className="w-4 h-4" /> Export Backup
            </Button>
            <Button variant="outline" onClick={handleImport} className="gap-1.5">
              <Upload className="w-4 h-4" /> Import Backup
            </Button>
            <Button variant="outline" onClick={handleClear} className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30">
              <Trash2 className="w-4 h-4" /> Clear All Data
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            All data is stored locally in your browser. Export regularly to avoid data loss.
          </p>
        </div>
      </section>
    </div>
  );
}
