'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import { Invoice } from '@/types';
import {
  ArrowRight,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/helpers';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  pending: 'bg-warning/10 text-warning border-warning/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  draft: 'bg-muted text-muted-foreground border-border',
  partial: 'bg-info/10 text-info border-info/20',
};

export default function DashboardPage() {
  const { loadData, invoices, clients } = useStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const pending = invoices.filter((i) => i.status === 'pending');
    const overdue = invoices.filter((i) => i.status === 'overdue');
    const paid = invoices.filter((i) => i.status === 'paid');
    const now = new Date();
    const thisMonth = paid.filter(
      (i) => new Date(i.paidDate || '').getMonth() === now.getMonth()
    );

    return {
      outstanding: [...pending, ...overdue].reduce((s, i) => s + i.total, 0),
      overdueCount: overdue.length,
      pendingCount: pending.length,
      paidThisMonth: thisMonth.reduce((s, i) => s + i.paidAmount, 0),
      totalClients: clients.length,
    };
  }, [invoices, clients]);

  // Revenue trend — last 6 months
  const sparkline = useMemo(() => {
    const months: { label: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const val = invoices
        .filter(
          (inv) =>
            inv.status === 'paid' &&
            new Date(inv.paidDate || '').getMonth() === d.getMonth() &&
            new Date(inv.paidDate || '').getFullYear() === d.getFullYear()
        )
        .reduce((s, inv) => s + inv.paidAmount, 0);
      months.push({
        label: d.toLocaleString('default', { month: 'short' }),
        value: val,
      });
    }
    const max = Math.max(...months.map((m) => m.value), 1);
    return months.map((m) => ({ ...m, pct: (m.value / max) * 100 }));
  }, [invoices]);

  // Recent invoices — last 8
  const recent = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 8),
    [invoices]
  );

  // Status counts for breakdown
  const statusCounts = useMemo(() => {
    const groups = { overdue: 0, pending: 0, draft: 0, partial: 0, paid: 0 };
    invoices.forEach((i) => {
      if (i.status in groups) groups[i.status as keyof typeof groups]++;
    });
    return groups;
  }, [invoices]);

  const total = invoices.length || 1;

  return (
    <div className="space-y-8 py-6 sm:py-10">
      {/* Hero stat */}
      <div>
        <p className="text-sm text-muted-foreground font-medium">Outstanding</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-tight mt-1">
          {formatCurrency(stats.outstanding)}
        </p>
        <div className="flex items-center gap-3 mt-2 text-sm">
          {stats.overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              {stats.overdueCount} overdue
            </span>
          )}
          {stats.pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-warning font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {stats.pendingCount} pending
            </span>
          )}
          {stats.overdueCount === 0 && stats.pendingCount === 0 && (
            <span className="text-success font-semibold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              All clear
            </span>
          )}
        </div>
      </div>

      {/* Status breakdown bar */}
      {invoices.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2 rounded-full overflow-hidden bg-muted">
            {statusCounts.overdue > 0 && (
              <div
                className="bg-destructive"
                style={{ width: `${(statusCounts.overdue / total) * 100}%` }}
              />
            )}
            {statusCounts.pending > 0 && (
              <div
                className="bg-warning"
                style={{ width: `${(statusCounts.pending / total) * 100}%` }}
              />
            )}
            {statusCounts.partial > 0 && (
              <div
                className="bg-info"
                style={{ width: `${(statusCounts.partial / total) * 100}%` }}
              />
            )}
            {statusCounts.draft > 0 && (
              <div
                className="bg-muted-foreground/30"
                style={{ width: `${(statusCounts.draft / total) * 100}%` }}
              />
            )}
            {statusCounts.paid > 0 && (
              <div
                className="bg-success"
                style={{ width: `${(statusCounts.paid / total) * 100}%` }}
              />
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
            {statusCounts.overdue > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                {statusCounts.overdue} Overdue
              </span>
            )}
            {statusCounts.pending > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-warning" />
                {statusCounts.pending} Pending
              </span>
            )}
            {statusCounts.paid > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success" />
                {statusCounts.paid} Paid
              </span>
            )}
            {statusCounts.draft > 0 && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                {statusCounts.draft} Draft
              </span>
            )}
          </div>
        </div>
      )}

      {/* Quick stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          href="/invoices?status=paid"
          className="rounded-xl border border-border p-4 hover:border-success/30 hover:bg-success/5 transition-all group"
        >
          <p className="text-2xl font-bold">{formatCurrency(stats.paidThisMonth)}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-success" />
            Paid this month
          </p>
        </Link>
        <Link
          href="/clients"
          className="rounded-xl border border-border p-4 hover:border-info/30 hover:bg-info/5 transition-all group"
        >
          <p className="text-2xl font-bold">{stats.totalClients}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-info" />
            Clients
          </p>
        </Link>
        <Link
          href="/invoices/new"
          className="rounded-xl border border-dashed border-border p-4 hover:border-primary/40 hover:bg-primary/5 transition-all group"
        >
          <p className="text-2xl font-bold text-primary">
            <Plus className="w-6 h-6" />
          </p>
          <p className="text-xs text-muted-foreground mt-1">Create invoice</p>
        </Link>
      </div>

      {/* Revenue sparkline + Recent invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sparkline */}
        <div className="rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Revenue</h3>
          <div className="flex items-end gap-1.5 h-24">
            {sparkline.map((m, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-sm transition-all duration-500"
                  style={{
                    height: `${Math.max(m.pct, 3)}%`,
                    backgroundColor: 'oklch(60% 0.16 55)',
                    opacity: m.value > 0 ? 1 : 0.12,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {sparkline.map((m, i) => (
              <span key={i} className="text-[10px] text-muted-foreground">
                {m.label}
              </span>
            ))}
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-border p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Recent activity</h3>
            <Link
              href="/invoices"
              className="text-xs text-primary font-medium flex items-center gap-1 hover:opacity-80"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <FileText className="w-5 h-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">No invoices yet</p>
              <Link
                href="/invoices/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
              >
                <Plus className="w-4 h-4" />
                Create your first invoice
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/invoices/${inv.id}`}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      inv.status === 'paid'
                        ? 'bg-success'
                        : inv.status === 'overdue'
                        ? 'bg-destructive'
                        : inv.status === 'pending'
                        ? 'bg-warning'
                        : 'bg-muted-foreground/40'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {inv.client?.name || 'Unknown client'}
                      </p>
                      <p className="text-sm font-semibold tabular-nums shrink-0">
                        {formatCurrency(inv.total)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {inv.invoiceNumber} &middot; {formatDate(inv.issueDate)}
                      {inv.dueDate && (
                        <span
                          className={
                            inv.status === 'overdue'
                              ? 'text-destructive font-medium'
                              : ''
                          }
                        >
                          {' '}
                          &middot; Due {formatDate(inv.dueDate)}
                        </span>
                      )}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
