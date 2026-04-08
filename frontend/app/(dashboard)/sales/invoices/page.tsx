'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal, Printer } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

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
  subtotal: number;
  taxTotal: number;
  notes: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  lineItems: any[];
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const markAsPaid = async (id: number) => {
    try {
      await api.patch(`/invoices/${id}/mark-paid`);
      fetchInvoices();
    } catch (error) {
      console.error('Failed to mark as paid', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

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
      accessor: (inv: Invoice) => (
        <div className="flex items-center gap-2 justify-end">
          {inv.status !== 'paid' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                markAsPaid(inv.id);
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all"
            >
              Mark Paid
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all text-gray-400 hover:text-gray-600">
            <MoreHorizontal size={20} />
          </button>
        </div>
      ),
      className: 'w-48 text-right'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end print:hidden">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Invoices</h1>
          <p className="text-gray-500 font-medium">Create and track invoices for your customers.</p>
        </div>
        <Link 
          href="/sales/invoices/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create Invoice
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm print:hidden">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by invoice number or customer name..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <div className="print:hidden">
        <Table 
          columns={columns as any} 
          data={invoices} 
          isLoading={loading} 
          onRowClick={(inv) => setSelectedInvoice(inv)}
        />
      </div>

      {/* Invoice Preview Modal */}
      <Modal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        title="Invoice Preview"
      >
        <div className="space-y-6">
          <div className="flex justify-end gap-3 print:hidden">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
            >
              <Printer size={18} />
              Print / Save PDF
            </button>
            {selectedInvoice?.status !== 'paid' && (
              <button 
                onClick={() => {
                  markAsPaid(selectedInvoice!.id);
                  setSelectedInvoice(null);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-100"
              >
                Mark as Paid
              </button>
            )}
          </div>
          
          <InvoicePreview invoice={selectedInvoice} />
        </div>
      </Modal>

      {/* Hidden Print-only section (Alternative if browser print dialog cuts off modals) */}
      <div className="hidden print:block fixed inset-0 z-[100] bg-white">
        <InvoicePreview invoice={selectedInvoice} />
      </div>
    </div>
  );
};

export default InvoicesPage;
