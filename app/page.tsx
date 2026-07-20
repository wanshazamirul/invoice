'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store/useStore';
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  Users,
  FileText,
  ArrowRight,
  Plus,
  Send,
} from 'lucide-react';
import { formatCurrency } from '@/lib/helpers';

const CHART_COLORS = [
  'oklch(60% 0.16 55)',  // amber-copper
  'oklch(58% 0.14 160)', // green
  'oklch(55% 0.14 245)', // blue
  'oklch(68% 0.14 85)',  // warm amber
  'oklch(54% 0.18 25)',  // red
];

export default function DashboardPage() {
  const { loadData, getDashboardStats, invoices, clients } = useStore();
  const stats = getDashboardStats();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Revenue trend (last 6 months)
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();
    const allValues: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString('default', { month: 'short' });
      const paidInvoices = invoices.filter(
        (inv) =>
          inv.status === 'paid' &&
          new Date(inv.paidDate || '').getMonth() === date.getMonth() &&
          new Date(inv.paidDate || '').getFullYear() === date.getFullYear()
      );
      const revenue = paidInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
      allValues.push(revenue);
      months.push({ name: monthName, revenue, count: paidInvoices.length });
    }

    const maxVal = Math.max(...allValues, 1);
    return months.map((m) => ({ ...m, maxVal, pct: (m.revenue / maxVal) * 100 }));
  }, [invoices]);

  // Invoice status breakdown
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { draft: 0, pending: 0, paid: 0, overdue: 0, partial: 0 };
    invoices.forEach((inv) => {
      counts[inv.status] = (counts[inv.status] || 0) + 1;
    });
    const total = invoices.length || 1;
    return [
      { label: 'Paid', count: counts.paid, color: 'bg-success', pct: (counts.paid / total) * 100 },
      { label: 'Pending', count: counts.pending, color: 'bg-warning', pct: (counts.pending / total) * 100 },
      { label: 'Overdue', count: counts.overdue, color: 'bg-destructive', pct: (counts.overdue / total) * 100 },
      { label: 'Draft', count: counts.draft, color: 'bg-muted-foreground/50', pct: (counts.draft / total) * 100 },
      { label: 'Partial', count: counts.partial, color: 'bg-info', pct: (counts.partial / total) * 100 },
    ].filter((s) => s.count > 0);
  }, [invoices]);

  // Top clients
  const topClients = useMemo(() => {
    return clients
      .map((c) => {
        const rev = invoices
          .filter((inv) => inv.clientId === c.id && inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.paidAmount, 0);
        return { name: c.name, revenue: rev, count: invoices.filter((inv) => inv.clientId === c.id).length };
      })
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices, clients]);

  const maxClientRev = Math.max(...topClients.map((c) => c.revenue), 1);

  // Donut segments for status
  const donutSegments = useMemo(() => {
    const total = invoices.length || 1;
    let accum = 0;
    const map: Record<string, string> = { paid: '#4ade80', pending: '#fbbf24', overdue: '#f87171', draft: '#94a3b8', partial: '#60a5fa' };
    return statusData.map((s) => {
      const start = accum;
      accum += s.pct;
      return { ...s, hex: map[s.label.toLowerCase()] || '#94a3b8', start };
    });
  }, [statusData, invoices.length]);

  const conicGradient = donutSegments
    .map((s) => `${s.hex} ${s.start}% ${s.start + s.pct}%`)
    .join(', ');

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
      sub: `${stats.totalInvoices} invoices`,
    },
    {
      title: 'Pending',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
      sub: `${stats.pendingInvoices} awaiting payment`,
    },
    {
      title: 'Overdue',
      value: formatCurrency(stats.overdueAmount),
      icon: AlertCircle,
      color: 'text-destructive',
      bg: 'bg-destructive/10',
      sub: `${stats.overdueInvoices} past due`,
    },
    {
      title: 'Paid This Month',
      value: formatCurrency(stats.paidThisMonth),
      icon: CheckCircle,
      color: 'text-info',
      bg: 'bg-info/10',
      sub: `${stats.totalClients} clients`,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Overview of your invoicing activity
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/invoices/new"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Invoice</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {stat.title}
                  </p>
                  <p className="text-lg sm:text-xl font-bold tracking-tight truncate">
                    {stat.value}
                  </p>
                </div>
                <div className={`p-2 rounded-lg ${stat.bg} shrink-0`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">
                {stat.sub}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trend — CSS bar chart */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold mb-4">Revenue Trend</h3>
          <div className="flex items-end gap-2 sm:gap-3 h-44">
            {revenueData.map((m, i) => (
              <div key={m.name} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-medium text-muted-foreground">
                  {m.revenue > 0 ? formatCurrency(m.revenue, '').replace('.00', '') : ''}
                </span>
                <div
                  className="w-full rounded-t-md transition-all duration-500"
                  style={{
                    height: `${Math.max(m.pct, 2)}%`,
                    backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                    opacity: m.revenue > 0 ? 1 : 0.15,
                  }}
                />
                <span className="text-[10px] text-muted-foreground">{m.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Status — CSS donut */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold mb-4">Invoice Status</h3>
          {invoices.length === 0 ? (
            <div className="flex items-center justify-center h-44 text-sm text-muted-foreground">
              No invoices yet
            </div>
          ) : (
            <div className="flex items-center gap-6">
              {/* Donut */}
              <div
                className="w-28 h-28 shrink-0 rounded-full relative"
                style={{
                  background: `conic-gradient(${conicGradient || '#e5e7eb 0% 100%'})`,
                  mask: 'radial-gradient(circle, transparent 55%, black 56%)',
                  WebkitMask: 'radial-gradient(circle, transparent 55%, black 56%)',
                }}
              />
              {/* Legend */}
              <div className="flex-1 space-y-2 min-w-0">
                {statusData.map((s) => (
                  <div key={s.label} className="flex items-center justify-between gap-2 text-sm">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2.5 h-2.5 rounded-full ${s.color} shrink-0`} />
                      <span className="truncate">{s.label}</span>
                    </div>
                    <span className="font-semibold tabular-nums shrink-0">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Clients + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Top Clients */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Top Clients</h3>
            <Link
              href="/clients"
              className="text-xs text-primary hover:opacity-80 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {topClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No client revenue yet</p>
              <Link
                href="/clients/new"
                className="text-xs text-primary hover:opacity-80 font-medium"
              >
                Add your first client
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => (
                <div key={c.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate">{c.name}</span>
                    <span className="text-muted-foreground tabular-nums shrink-0 ml-2">
                      {formatCurrency(c.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(c.revenue / maxClientRev) * 100}%`,
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <h3 className="text-sm font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { href: '/invoices/new', icon: Plus, label: 'Create new invoice', color: 'text-primary' },
              { href: '/clients/new', icon: Users, label: 'Add new client', color: 'text-info' },
              { href: '/products/new', icon: FileText, label: 'Add product or service', color: 'text-success' },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border hover:border-primary/30 hover:bg-muted/50 transition-all group"
                >
                  <div className={`p-1.5 rounded-md bg-muted ${action.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium flex-1">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>

          {/* Reminder CTA */}
          {stats.pendingInvoices > 0 && (
            <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-3">
              <Send className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">
                  {stats.pendingInvoices} invoice{stats.pendingInvoices > 1 ? 's' : ''} awaiting payment
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Send reminders to follow up on outstanding payments.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
