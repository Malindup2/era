'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal, Link as LinkIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Link from 'next/link';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CreditNote {
  id: number;
  number: string;
  creditNoteDate: string;
  status: string;
  total: number;
  customer: {
    name: string;
  };
  invoice?: {
    number: string;
  };
}

const CreditNotesPage = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCreditNotes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/credit-notes');
      setCreditNotes(res.data);
    } catch (error) {
      console.error('Failed to fetch credit notes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditNotes();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns = [
    { 
      header: 'Credit Note', 
      accessor: (cnm: CreditNote) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-400">
            <FileText size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{cnm.number}</p>
            <p className="text-xs text-gray-500">{cnm.customer?.name}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Linked Invoice', 
      accessor: (cnm: CreditNote) => (
        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
          {cnm.invoice ? (
            <>
              <LinkIcon size={14} className="text-gray-400" />
              {cnm.invoice.number}
            </>
          ) : (
            <span className="text-gray-400">Standalone</span>
          )}
        </div>
      )
    },
    { 
      header: 'Date', 
      accessor: (cnm: CreditNote) => (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Calendar size={14} className="text-gray-400" />
          {new Date(cnm.creditNoteDate).toLocaleDateString()}
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (cnm: CreditNote) => (
        <div className="font-bold text-rose-600">
          -{formatCurrency(cnm.total)}
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (cnm: CreditNote) => (
        <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-600">
          {cnm.status}
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Credit Notes</h1>
          <p className="text-gray-500 font-medium">Manage refunds and credits issued to your customers.</p>
        </div>
        <Link 
          href="/sales/credit-notes/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          New Credit Note
        </Link>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by credit note number or customer name..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <Table columns={columns as any} data={creditNotes} isLoading={loading} />
    </div>
  );
};

export default CreditNotesPage;
