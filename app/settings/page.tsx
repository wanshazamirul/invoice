'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store/useStore';
import { InvoiceSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, FileText, Settings as SettingsIcon, Database, Sun, Moon, Monitor } from 'lucide-react';
import { useAlert } from '@/contexts/alert-context';
import { useTheme } from '@/contexts/theme-context';

export default function SettingsPage() {
  const { settings, updateSettings, exportAllData, importAllData } = useStore();
  const { success, error } = useAlert();
  const { theme, setTheme, actualTheme } = useTheme();
  const [formData, setFormData] = useState<InvoiceSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTab, setCurrentTab] = useState('company');

  const handleSave = () => {
    updateSettings(formData);
    setHasChanges(false);
    success('Settings saved', 'Your settings have been updated successfully.');
  };

  const handleChange = (field: keyof InvoiceSettings, value: any) => {
    setFormData({ ...formData, [field]: value });
    setHasChanges(true);
  };

  const handleCompanyInfoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      companyInfo: { ...formData.companyInfo, [field]: value },
    });
    setHasChanges(true);
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
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm('This will replace all your data. Are you sure?')) {
            importAllData(data);
            success('Data imported', 'All data has been imported successfully.');
          }
        } catch (err) {
          error('Import failed', 'Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2">Configure your invoice application</p>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-yellow-800">You have unsaved changes</p>
          <Button onClick={handleSave} size="sm">
            Save Changes
          </Button>
        </div>
      )}

      {/* Custom Navigation - Horizontal Layout */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setCurrentTab('company')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border-2 transition-all whitespace-nowrap ${
            currentTab === 'company'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <Building2 className={`w-4 h-4 flex-shrink-0 ${currentTab === 'company' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`} />
          <span className="text-xs sm:text-sm font-medium">Company</span>
        </button>

        <button
          onClick={() => setCurrentTab('invoice')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border-2 transition-all whitespace-nowrap ${
            currentTab === 'invoice'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <FileText className={`w-4 h-4 flex-shrink-0 ${currentTab === 'invoice' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`} />
          <span className="text-xs sm:text-sm font-medium">Invoice</span>
        </button>

        <button
          onClick={() => setCurrentTab('general')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border-2 transition-all whitespace-nowrap ${
            currentTab === 'general'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <SettingsIcon className={`w-4 h-4 flex-shrink-0 ${currentTab === 'general' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`} />
          <span className="text-xs sm:text-sm font-medium">General</span>
        </button>

        <button
          onClick={() => setCurrentTab('data')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg border-2 transition-all whitespace-nowrap ${
            currentTab === 'data'
              ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
          }`}
        >
          <Database className={`w-4 h-4 flex-shrink-0 ${currentTab === 'data' ? 'text-emerald-600 dark:text-emerald-500' : 'text-slate-600 dark:text-slate-400'}`} />
          <span className="text-xs sm:text-sm font-medium">Data</span>
        </button>
      </div>

      {/* Company Settings */}
      {currentTab === 'company' && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.companyInfo.name}
                onChange={(e) => handleCompanyInfoChange('name', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.companyInfo.email}
                  onChange={(e) => handleCompanyInfoChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.companyInfo.phone}
                  onChange={(e) => handleCompanyInfoChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label>Address</Label>
              <Textarea
                value={formData.companyInfo.address}
                onChange={(e) => handleCompanyInfoChange('address', e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <Label>Payment Information</Label>
              <Textarea
                value={formData.paymentInfo}
                onChange={(e) => handleChange('paymentInfo', e.target.value)}
                rows={4}
                placeholder="Bank: Maybank&#10;Account: 123456789012&#10;Account Name: Your Name"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Settings */}
      {currentTab === 'invoice' && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Invoice Prefix</Label>
                  <Input
                    value={formData.invoicePrefix}
                    onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                    placeholder="INV"
                  />
                </div>
                <div>
                  <Label>Starting Number</Label>
                  <Input
                    type="number"
                    value={formData.startingNumber}
                    onChange={(e) =>
                      handleChange('startingNumber', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quotation Prefix</Label>
                  <Input
                    value={formData.quotationPrefix}
                    onChange={(e) => handleChange('quotationPrefix', e.target.value)}
                    placeholder="QUOT"
                  />
                </div>
                <div>
                  <Label>Starting Number</Label>
                  <Input
                    type="number"
                    value={formData.quotationStartingNumber}
                    onChange={(e) =>
                      handleChange('quotationStartingNumber', parseInt(e.target.value))
                    }
                  />
                </div>
              </div>

              <Separator />

              <div>
                <Label>Default Tax Rate (SST %)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <Label>Default Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(v) => v && handleChange('currency', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency">
                      {formData.currency === 'RM' && 'RM - Malaysian Ringgit'}
                      {formData.currency === 'USD' && 'USD - US Dollar'}
                      {formData.currency === 'SGD' && 'SGD - Singapore Dollar'}
                      {formData.currency === 'EUR' && 'EUR - Euro'}
                      {formData.currency === 'GBP' && 'GBP - British Pound'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RM">RM - Malaysian Ringgit</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Default Notes</Label>
                <Textarea
                  value={formData.defaultNotes}
                  onChange={(e) => handleChange('defaultNotes', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Default Terms</Label>
                <Textarea
                  value={formData.defaultTerms}
                  onChange={(e) => handleChange('defaultTerms', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
      )}

      {/* General Settings */}
      {currentTab === 'general' && (
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    theme === 'light'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Sun className={`w-6 h-6 ${theme === 'light' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="text-sm font-medium">Light</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    theme === 'dark'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="text-sm font-medium">Dark</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                    theme === 'system'
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Monitor className={`w-6 h-6 ${theme === 'system' ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`} />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                {theme === 'system'
                  ? `Using system theme (${actualTheme === 'dark' ? 'Dark' : 'Light'})`
                  : theme === 'dark'
                  ? 'Dark mode enabled'
                  : 'Light mode enabled'}
                </p>
              </div>
            </CardContent>
          </Card>
      )}

      {/* Data Management */}
      {currentTab === 'data' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Download all your invoices, clients, products, and settings as a JSON file.
              </p>
              <Button onClick={handleExport} variant="outline" className="gap-2">
                <Database className="w-4 h-4" />
                Export All Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-slate-100">Import Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Restore your data from a previously exported JSON file. This will replace all
                existing data.
              </p>
              <Input type="file" accept=".json" onChange={handleImport} />
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                Clear all data from the application. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    confirm(
                      'Are you sure you want to delete ALL data? This cannot be undone!'
                    )
                  ) {
                    localStorage.clear();
                    window.location.reload();
                  }
                }}
              >
                Clear All Data
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Save Button - Only show for Company and Invoice tabs */}
      {(currentTab === 'company' || currentTab === 'invoice') && (
        <div className="flex justify-end">
          <Button onClick={handleSave} size="lg" disabled={!hasChanges}>
            Save All Settings
          </Button>
        </div>
      )}
    </div>
  );
}
