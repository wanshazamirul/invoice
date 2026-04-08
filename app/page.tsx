'use client';

import { useEffect, useMemo } from 'react';
import { useStore } from '@/lib/store/useStore';
import {
  DollarSign,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  FileText,
  ArrowUpRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/helpers';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { loadData, getDashboardStats, invoices, clients } = useStore();
  const stats = getDashboardStats();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Revenue over time (last 6 months)
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

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
      const count = paidInvoices.length;

      months.push({
        name: monthName,
        revenue,
        invoices: count,
      });
    }

    return months;
  }, [invoices]);

  // Calculate trends
  const trends = useMemo(() => {
    const currentMonth = revenueData[revenueData.length - 1];
    const previousMonth = revenueData[revenueData.length - 2];

    // Total Revenue trend (current month vs previous month)
    const revenueTrend = previousMonth && previousMonth.revenue > 0
      ? ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1)
      : '0.0';

    // Paid This Month trend (current month vs 2 months ago for better comparison)
    const twoMonthsAgo = revenueData[revenueData.length - 3];
    const paidTrend = twoMonthsAgo && twoMonthsAgo.revenue > 0
      ? ((currentMonth.revenue - twoMonthsAgo.revenue) / twoMonthsAgo.revenue * 100).toFixed(1)
      : '0.0';

    return {
      revenueTrend: parseFloat(revenueTrend),
      paidTrend: parseFloat(paidTrend),
    };
  }, [revenueData]);

  // Invoice status distribution
  const statusData = useMemo(() => {
    const statuses = invoices.reduce(
      (acc, inv) => {
        acc[inv.status] = (acc[inv.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(statuses).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [invoices]);

  const STATUS_COLORS = {
    Draft: '#94a3b8',
    Pending: '#eab308',
    Paid: '#10b981',
    Overdue: '#ef4444',
    Partial: '#3b82f6',
  };

  // Top clients by revenue
  const topClientsData = useMemo(() => {
    const clientRevenue = clients.map((client) => {
      const clientInvoices = invoices.filter(
        (inv) => inv.clientId === client.id && inv.status === 'paid'
      );
      const revenue = clientInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

      return {
        name: client.name,
        revenue,
        invoices: clientInvoices.length,
      };
    });

    return clientRevenue
      .filter((c) => c.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [invoices, clients]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-500',
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      trend: trends.revenueTrend !== 0 ? `${trends.revenueTrend > 0 ? '+' : ''}${trends.revenueTrend}%` : 'No data',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      trend: `${stats.pendingInvoices} invoice${stats.pendingInvoices !== 1 ? 's' : ''}`,
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats.overdueAmount),
      icon: AlertCircle,
      color: 'text-red-600 dark:text-red-500',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      trend: `${stats.overdueInvoices} invoice${stats.overdueInvoices !== 1 ? 's' : ''}`,
    },
    {
      title: 'Paid This Month',
      value: formatCurrency(stats.paidThisMonth),
      icon: CheckCircle,
      color: 'text-blue-600 dark:text-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      trend: trends.paidTrend !== 0 ? `${trends.paidTrend > 0 ? '+' : ''}${trends.paidTrend}%` : 'No data',
    },
  ];

  const quickStats = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Users,
    },
    {
      title: 'Total Invoices',
      value: stats.totalInvoices,
      icon: FileText,
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">Welcome back! Here's your business overview.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 sm:px-6">
                <CardTitle className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.title}
                </CardTitle>
                <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span className="hidden sm:inline">{stat.trend}</span>
                  <span className="sm:hidden">{stat.trend}</span>
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-4 sm:pt-6 px-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{stat.title}</p>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 sm:mt-2">{stat.value}</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-slate-600 dark:text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value, 'RM');
                    }
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Invoice Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients */}
      <Card>
        <CardHeader>
          <CardTitle>Top Clients by Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {topClientsData.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-center py-8">No client data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClientsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  formatter={(value: any) => {
                    if (typeof value === 'number') {
                      return formatCurrency(value, 'RM');
                    }
                    return value;
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="/invoices/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                <span className="font-medium dark:text-slate-100">Create New Invoice</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-500" />
            </a>
            <a
              href="/clients/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                <span className="font-medium dark:text-slate-100">Add New Client</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
            </a>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              👋 Welcome to your new invoicing system! Here's how to get started:
            </p>
            <ol className="text-sm text-slate-600 space-y-2 mt-4 list-decimal list-inside">
              <li>Add your clients in the Clients section</li>
              <li>Create products/services for quick invoicing</li>
              <li>Configure your settings in Settings</li>
              <li>Create your first invoice!</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
