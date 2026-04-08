'use client';

import React, { useEffect, useState } from 'react';
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
    name: string;
  };
}

const QuotationsPage = () => {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
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
      fetchQuotations();
    } catch (error) {
      console.error('Failed to convert to invoice', error);
      toast.error('Conversion failed.');
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  const getStatusStyles = (status: string, expiryDate: string) => {
    const isExpired = new Date(expiryDate) < new Date() && status !== 'converted' && status !== 'accepted';
    if (isExpired) return "bg-rose-100 text-rose-700";
    
    switch (status) {
      case 'converted': return "bg-emerald-100 text-emerald-700";
      case 'accepted': return "bg-blue-100 text-blue-700";
      case 'sent': return "bg-amber-100 text-amber-700";
      case 'rejected': return "bg-rose-200 text-rose-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const columns = [
    { 
      header: 'Quotation', 
      accessor: (q: Quotation) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{q.number}</p>
            <p className="text-xs text-gray-500">{q.customer?.name}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Dates', 
      accessor: (q: Quotation) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            Issue: {new Date(q.quotationDate).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            Expiry: {new Date(q.expiryDate).toLocaleDateString()}
          </div>
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (q: Quotation) => (
        <div className="font-bold text-gray-900">
          {formatCurrency(q.total)}
        </div>
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
      header: 'Action',
      accessor: (q: Quotation) => (
        <div className="flex items-center gap-2 justify-end">
          {q.status !== 'converted' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                convertToInvoice(q.id);
              }}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
            >
              <RefreshCw size={12} />
              Convert to Inv
            </button>
          )}
          <Link 
            href={`/sales/quotations/${q.id}`}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
          >
            <Edit size={18} />
          </Link>
          <button 
            onClick={() => {
              setQuotationToDelete(q);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'w-48 text-right'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Quotations</h1>
          <p className="text-gray-500 font-medium">Manage and convert estimates for your clients.</p>
        </div>
        <Link 
          href="/sales/quotations/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          New Quotation
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by quote number or customer name..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <Table columns={columns as any} data={quotations} isLoading={loading} />

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteQuotation}
        title="Delete Quotation"
        message={`Are you sure you want to delete quotation ${quotationToDelete?.number}? This action cannot be undone.`}
        confirmLabel="Delete Quotation"
        isDestructive={true}
      />
    </div>
  );
};

export default QuotationsPage;
