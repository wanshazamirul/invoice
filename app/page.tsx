'use client';

import { useEffect } from 'react';
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

export default function DashboardPage() {
  const { loadData, getDashboardStats } = useStore();
  const stats = getDashboardStats();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: '+12.5%',
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: `${stats.pendingInvoices} invoices`,
    },
    {
      title: 'Overdue Amount',
      value: formatCurrency(stats.overdueAmount),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      trend: `${stats.overdueInvoices} invoices`,
    },
    {
      title: 'Paid This Month',
      value: formatCurrency(stats.paidThisMonth),
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+8.2%',
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-2">Welcome back! Here's your business overview.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.trend}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <Icon className="w-6 h-6 text-slate-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Create New Invoice</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600" />
            </a>
            <a
              href="/clients/new"
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Add New Client</span>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
            </a>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-slate-600">
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
