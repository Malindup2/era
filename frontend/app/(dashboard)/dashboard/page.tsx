'use client';

import React, { useEffect, useState } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import CashFlowChart from '@/components/dashboard/CashFlowChart';
import api from '@/lib/api';
import { 
  HandCoins, 
  Wallet, 
  TrendingUp, 
  Clock,
  Plus,
  ArrowRight,
  MoreVertical
} from 'lucide-react';
import Link from 'next/link';

const DashboardPage = () => {
  const [summary, setSummary] = useState({
    totalReceivables: 0,
    totalPayables: 0,
    bankBalance: 0,
    netProfit: 0,
  });
  const [overview, setOverview] = useState({
    paidTotal: 0,
    overdueTotal: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, overRes] = await Promise.all([
          api.get('/dashboard/summary'),
          api.get('/dashboard/invoice-overview')
        ]);
        setSummary(sumRes.data);
        setOverview(overRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Financial Overview</h1>
          <p className="text-gray-500 font-medium">Welcome back! Here's what's happening today.</p>
        </div>
        <Link 
          href="/sales/invoices/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create New Invoice
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Receivables" 
          value={formatCurrency(summary.totalReceivables)} 
          icon={<HandCoins size={24} />}
          trend={{ value: '12%', isUp: true }}
          color="indigo"
        />
        <StatCard 
          label="Total Payables" 
          value={formatCurrency(summary.totalPayables)} 
          icon={<TrendingUp size={24} />}
          color="red"
        />
        <StatCard 
          label="Bank Balance" 
          value={formatCurrency(summary.bankBalance)} 
          icon={<Wallet size={24} />}
          trend={{ value: '5%', isUp: true }}
          color="green"
        />
        <StatCard 
          label="Net Profit" 
          value={formatCurrency(summary.netProfit)} 
          icon={<Clock size={24} />}
          color="blue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[450px]">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cash Flow</h3>
              <p className="text-sm text-gray-500">Monthly incoming vs outgoing cash</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-indigo-600 rounded-full"></span> Incoming
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <span className="w-3 h-3 bg-rose-500 rounded-full"></span> Outgoing
              </div>
            </div>
          </div>
          <div className="flex-1">
            <CashFlowChart />
          </div>
        </div>

        {/* Invoice Overview */}
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-900">Invoices Overview</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Paid</p>
              <p className="text-2xl font-black text-emerald-600 mb-4">{formatCurrency(overview.paidTotal)}</p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[75%] rounded-full"></div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-1">Total Overdue</p>
              <p className="text-2xl font-black text-rose-600 mb-4">{formatCurrency(overview.overdueTotal)}</p>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full w-[25%] rounded-full"></div>
              </div>
            </div>
          </div>

          <Link 
            href="/sales/invoices"
            className="mt-8 group flex items-center justify-between p-4 bg-indigo-50 hover:bg-indigo-100 rounded-2xl text-indigo-700 font-bold transition-all"
          >
            <span>View All Invoices</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
