'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Invoice {
  id: number;
  number: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  customer: {
    name: string;
  };
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await api.get('/invoices');
        setInvoices(res.data);
      } catch (error) {
        console.error('Failed to fetch invoices', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusStyles = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'paid';
    
    if (isOverdue) return "bg-rose-100 text-rose-700";
    
    switch (status) {
      case 'paid': return "bg-emerald-100 text-emerald-700";
      case 'viewed': return "bg-amber-100 text-amber-700";
      case 'awaiting_payment': return "bg-blue-100 text-blue-700";
      case 'rejected': return "bg-rose-200 text-rose-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const columns = [
    { 
      header: 'Invoice', 
      accessor: (inv: Invoice) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{inv.number}</p>
            <p className="text-xs text-gray-500">{inv.customer?.name}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (inv: Invoice) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            Issue: {new Date(inv.invoiceDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            Due: {new Date(inv.dueDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (inv: Invoice) => (
        <div className="font-bold text-gray-900">
          {formatCurrency(inv.total)}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (inv: Invoice) => (
        <span className={cn(
          "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
          getStatusStyles(inv.status, inv.dueDate)
        )}>
          {new Date(inv.dueDate) < new Date() && inv.status !== 'paid' ? 'Overdue' : inv.status}
        </span>
      )
    },
    {
      header: 'Action',
      accessor: () => (
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      ),
      className: 'w-20 text-center'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-500 font-medium">Create and track invoices for your customers.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number or customer name..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <Table columns={columns as any} data={invoices} isLoading={loading} />
    </div>
  );
};

export default InvoicesPage;
