'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal, Printer, Edit, Trash2, Send, ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
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
    id: number;
    name: string;
    email: string;
  };
  lineItems: any[];
}

const InvoicesPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

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
      // Backend status transition used by the invoice action buttons.
      await api.patch(`/invoices/${id}/mark-paid`);
      fetchInvoices();
    } catch (error) {
      console.error('Failed to mark as paid', error);
    }
  };

  const markAsSent = async (id: number) => {
    try {
      // This marks the invoice as sent/viewed from the preview modal.
      await api.patch(`/invoices/${id}/send`);
      fetchInvoices();
      setSelectedInvoice(null);
    } catch (error) {
      console.error('Failed to mark as sent', error);
    }
  };

  const deleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await api.delete(`/invoices/${invoiceToDelete.id}`);
      fetchInvoices();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete invoice', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculation Logic
  const metrics = useMemo(() => {
    const now = new Date();
    return {
      overdue: invoices
        .filter(inv => inv.status !== 'paid' && new Date(inv.dueDate) < now)
        .reduce((sum, inv) => sum + Number(inv.total), 0),
      open: invoices
        .filter(inv => inv.status === 'awaiting_payment' || inv.status === 'viewed')
        .reduce((sum, inv) => sum + Number(inv.total), 0),
      draft: invoices
        .filter(inv => inv.status === 'draft')
        .reduce((sum, inv) => sum + Number(inv.total), 0),
    };
  }, [invoices]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All', count: invoices.length },
    { id: 'draft', label: 'Draft', count: invoices.filter(i => i.status === 'draft').length },
    { id: 'viewed', label: 'Viewed', count: invoices.filter(i => i.status === 'viewed').length },
    { id: 'awaiting_payment', label: 'Awaiting Payment', count: invoices.filter(i => i.status === 'awaiting_payment').length },
    { id: 'paid', label: 'Paid', count: invoices.filter(i => i.status === 'paid').length },
    { id: 'rejected', label: 'Reject', count: invoices.filter(i => i.status === 'rejected').length },
  ], [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesTab = activeTab === 'all' || inv.status === activeTab;
      const matchesSearch = 
        inv.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [invoices, activeTab, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(value) + ' Rs';
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
      header: 'Due Date', 
      accessor: (inv: Invoice) => {
        const dueDate = new Date(inv.dueDate);
        const now = new Date();
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return (
          <span className={cn(
            "font-black",
            diffDays > 0 && inv.status !== 'paid' ? "text-rose-600" : "text-gray-900"
          )}>
            {inv.status === 'paid' ? dueDate.toLocaleDateString() : (diffDays > 0 ? `${diffDays} days ago` : dueDate.toLocaleDateString())}
          </span>
        );
      }
    },
    { 
      header: 'Invoice Date', 
      accessor: (inv: Invoice) => (
        <span className="text-gray-600 font-medium">
          {new Date(inv.invoiceDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
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
      header: 'Customer', 
      accessor: (inv: Invoice) => (
        <span className="font-bold text-gray-900">{inv.customer?.name}</span>
      )
    },
    { 
      header: 'Number', 
      accessor: (inv: Invoice) => (
        <span className="font-medium text-gray-600 border-b border-dotted border-gray-300 pb-0.5">{inv.number}</span>
      )
    },
    { 
      header: 'Amount', 
      accessor: (inv: Invoice) => (
        <div className="font-bold text-gray-900 text-right">
          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(inv.total)}...
        </div>
      ),
      className: 'text-right'
    },
    {
      header: '',
      accessor: (inv: Invoice) => (
        <div className="flex items-center justify-end gap-2">
          {/* Opens the preview modal so the invoice details are visible without navigation. */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedInvoice(inv);
            }}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
          >
            <FileText size={14} />
            View Details
          </button>
          <Link 
            href={`/sales/invoices/${inv.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
          >
            <Edit size={16} />
          </Link>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setInvoiceToDelete(inv);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'w-56 text-right'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Invoices</h1>
        <div className="flex gap-3">
          <Link 
            href="/sales/invoices/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            New Invoice
          </Link>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-rose-600 transition-colors">Overdue</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-rose-600 tracking-tight">{formatCurrency(metrics.overdue / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-rose-400">K Rs</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-indigo-600 transition-colors">Open</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-indigo-600 tracking-tight">{formatCurrency(metrics.open / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-indigo-400">K Rs</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-gray-600 transition-colors">Draft</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-gray-900 tracking-tight">{formatCurrency(metrics.draft / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-gray-400">K Rs</span>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="relative border-b border-gray-100 print:hidden overflow-hidden">
        <div className="flex items-center gap-8 overflow-x-auto no-scrollbar pb-4 prose prose-indigo">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "pb-4 text-sm font-bold whitespace-nowrap transition-all relative",
                activeTab === tab.id 
                  ? "text-gray-900" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {tab.label} ({tab.count})
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full" />
              )}
            </button>
          ))}
          <button className="pb-4 text-sm font-bold text-gray-400 hover:text-gray-600 whitespace-nowrap">
            Recurring Templates
          </button>
        </div>
        <div className="absolute left-0 top-0 bottom-4 w-4 bg-linear-to-r from-gray-50 to-transparent lg:hidden" />
        <div className="absolute right-0 top-0 bottom-4 w-4 bg-linear-to-l from-gray-50 to-transparent lg:hidden" />
      </div>

      {/* Search Bar */}
      <div className="relative group print:hidden">
        <div className="absolute left-0 inset-y-0 flex items-center pl-4 pointer-events-none">
          <Search size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search or filter results.." 
          className="w-full bg-white border-none py-4 pl-12 pr-4 text-sm font-medium text-gray-700 placeholder:text-gray-300 focus:ring-0 focus:outline-hidden border-b border-gray-100 transition-all"
        />
      </div>

      {/* Table Section */}
      <div className="print:hidden">
        <Table 
          columns={columns as any} 
          data={filteredInvoices} 
          isLoading={loading} 
          onRowClick={(inv) => setSelectedInvoice(inv)}
        />
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${invoiceToDelete?.number}? This action cannot be undone.`}
        confirmText="Delete Invoice"
        variant="destructive"
      />

      {/* Modal & Print sections keep existing logic but wrapped in NexCore aesthetics */}
      <Modal 
        isOpen={!!selectedInvoice} 
        onClose={() => setSelectedInvoice(null)} 
        title="Invoice Details"
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
            {selectedInvoice?.status === 'awaiting_payment' && (
              <button 
                onClick={() => {
                  if (selectedInvoice) markAsSent(selectedInvoice.id);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold transition-all"
              >
                <Send size={18} />
                Mark as Sent
              </button>
            )}
            {selectedInvoice?.status !== 'paid' && (
              <button 
                onClick={() => {
                  if (selectedInvoice) {
                    markAsPaid(selectedInvoice.id);
                    setSelectedInvoice(null);
                  }
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

      <div className="hidden print:block fixed inset-0 z-[100] bg-white">
        <InvoicePreview invoice={selectedInvoice} />
      </div>
    </div>
  );
};

export default InvoicesPage;
