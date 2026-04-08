'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal, Printer, RefreshCw, Edit, Trash2 } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Quotation {
  id: number;
  number: string;
  quotationDate: string;
  expiryDate: string;
  status: string;
  total: number;
  customer: {
    id: number;
    name: string;
  };
}

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<Quotation | null>(null);
  const router = useRouter();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/quotations');
      setQuotations(res.data);
    } catch (error) {
      console.error('Failed to fetch quotations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const convertToInvoice = async (id: number) => {
    try {
      await api.post(`/quotations/${id}/convert`);
      toast.success('Successfully converted to invoice!');
      fetchQuotations();
    } catch (error: any) {
      console.error('Failed to convert to invoice', error);
      toast.error(error.response?.data?.message || 'Conversion failed.');
    }
  };

  const deleteQuotation = async () => {
    if (!quotationToDelete) return;
    try {
      await api.delete(`/quotations/${quotationToDelete.id}`);
      fetchQuotations();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete quotation', error);
    }
  };

  // Calculation Logic
  const metrics = useMemo(() => {
    const now = new Date();
    return {
      expired: quotations
        .filter(q => q.status !== 'converted' && q.status !== 'accepted' && new Date(q.expiryDate) < now)
        .reduce((sum, q) => sum + Number(q.total), 0),
      sent: quotations
        .filter(q => q.status === 'sent')
        .reduce((sum, q) => sum + Number(q.total), 0),
      draft: quotations
        .filter(q => q.status === 'draft')
        .reduce((sum, q) => sum + Number(q.total), 0),
    };
  }, [quotations]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All', count: quotations.length },
    { id: 'draft', label: 'Draft', count: quotations.filter(q => q.status === 'draft').length },
    { id: 'sent', label: 'Sent', count: quotations.filter(q => q.status === 'sent').length },
    { id: 'accepted', label: 'Accepted', count: quotations.filter(q => q.status === 'accepted').length },
    { id: 'rejected', label: 'Reject', count: quotations.filter(q => q.status === 'rejected').length },
    { id: 'converted', label: 'Converted', count: quotations.filter(q => q.status === 'converted').length },
  ], [quotations]);

  const filteredQuotations = useMemo(() => {
    return quotations.filter(q => {
      const matchesTab = activeTab === 'all' || q.status === activeTab;
      const matchesSearch = 
        q.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [quotations, activeTab, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(value) + ' Rs';
  };

  const getStatusStyles = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date() && status !== 'converted' && status !== 'accepted';
    if (isExpired) return "bg-rose-100 text-rose-700";
    
    switch (status) {
      case 'converted': return "bg-emerald-100 text-emerald-700";
      case 'accepted': return "bg-blue-100 text-blue-700";
      case 'sent': return "bg-amber-100 text-amber-700";
      case 'rejected': return "bg-gray-100 text-gray-400";
      default: return "bg-gray-50 text-gray-500";
    }
  };

  const columns = [
    { 
      header: 'Expiry Date', 
      accessor: (q: Quotation) => {
        const expiryDate = new Date(q.expiryDate);
        const now = new Date();
        const isExpired = expiryDate < now && q.status !== 'converted' && q.status !== 'accepted';
        
        return (
          <span className={cn(
            "font-black",
            isExpired ? "text-rose-600" : "text-gray-900"
          )}>
            {expiryDate.toLocaleDateString()}
          </span>
        );
      }
    },
    { 
      header: 'Quotation Date', 
      accessor: (q: Quotation) => (
        <span className="text-gray-600 font-medium">
          {new Date(q.quotationDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (q: Quotation) => (
        <span className={cn(
          "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
          getStatusStyles(q.status, q.expiryDate)
        )}>
           {new Date(q.expiryDate) < new Date() && q.status !== 'converted' && q.status !== 'accepted' ? 'Expired' : q.status}
        </span>
      )
    },
    { 
      header: 'Customer', 
      accessor: (q: Quotation) => (
        <span className="font-bold text-gray-900">{q.customer?.name}</span>
      )
    },
    { 
      header: 'Number', 
      accessor: (q: Quotation) => (
        <span className="font-medium text-gray-600 border-b border-dotted border-gray-300 pb-0.5">{q.number}</span>
      )
    },
    { 
      header: 'Amount', 
      accessor: (q: Quotation) => (
        <div className="font-bold text-gray-900 text-right">
          {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(q.total)}
        </div>
      ),
      className: 'text-right'
    },
    {
      header: '',
      accessor: (q: Quotation) => (
        <div className="flex items-center gap-2 justify-end">
          {q.status !== 'converted' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                convertToInvoice(q.id);
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1 active:scale-95"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Convert
            </button>
          )}
          <Link 
            href={`/sales/quotations/${q.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
          >
            <Edit size={16} />
          </Link>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setQuotationToDelete(q);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'w-44 text-right'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Quotations</h1>
        <div className="flex gap-3">
          <Link 
            href="/sales/quotations/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            New Quotation
          </Link>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-rose-600 transition-colors">Expired</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-rose-600 tracking-tight">{formatCurrency(metrics.expired / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-rose-400">K Rs</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-amber-600 transition-colors">Sent</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-amber-600 tracking-tight">{formatCurrency(metrics.sent / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-amber-400">K Rs</span>
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
          data={filteredQuotations} 
          isLoading={loading} 
        />
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteQuotation}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${quotationToDelete?.number}? This action cannot be undone.`}
        confirmText="Delete Quotation"
        variant="destructive"
      />
    </div>
  );
};

export default QuotationsPage;
