'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Calendar, FileText, MoreHorizontal, Printer, Edit, Trash2, Link as LinkIcon } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
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
    id: number;
    name: string;
  };
  invoice?: {
    id: number;
    number: string;
  };
}

const CreditNotesPage = () => {
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [creditNoteToDelete, setCreditNoteToDelete] = useState<CreditNote | null>(null);

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

  const deleteCreditNote = async () => {
    if (!creditNoteToDelete) return;
    try {
      await api.delete(`/credit-notes/${creditNoteToDelete.id}`);
      fetchCreditNotes();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to delete credit note', error);
    }
  };

  const updateCreditNoteStatus = async (id: number, status: 'draft' | 'open' | 'closed') => {
    try {
      await api.patch(`/credit-notes/${id}`, { status });
      fetchCreditNotes();
    } catch (error) {
      console.error('Failed to update credit note status', error);
    }
  };

  // Calculation Logic
  const metrics = useMemo(() => ({
    open: creditNotes
      .filter(cn => cn.status === 'open')
      .reduce((sum, cn) => sum + Number(cn.total), 0),
    closed: creditNotes
      .filter(cn => cn.status === 'closed')
      .reduce((sum, cn) => sum + Number(cn.total), 0),
    draft: creditNotes
      .filter(cn => cn.status === 'draft')
      .reduce((sum, cn) => sum + Number(cn.total), 0),
  }), [creditNotes]);

  const tabs = useMemo(() => [
    { id: 'all', label: 'All', count: creditNotes.length },
    { id: 'draft', label: 'Draft', count: creditNotes.filter(cn => cn.status === 'draft').length },
    { id: 'open', label: 'Open', count: creditNotes.filter(cn => cn.status === 'open').length },
    { id: 'closed', label: 'Closed', count: creditNotes.filter(cn => cn.status === 'closed').length },
  ], [creditNotes]);

  const filteredCreditNotes = useMemo(() => {
    return creditNotes.filter(cn => {
      const matchesTab = activeTab === 'all' || cn.status === activeTab;
      const matchesSearch = 
        cn.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cn.customer?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [creditNotes, activeTab, searchQuery]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
    }).format(value) + ' Rs';
  };

  const columns = [
    { 
      header: 'Credit Note Date', 
      accessor: (cnm: CreditNote) => (
        <span className="font-black text-gray-900">
          {new Date(cnm.creditNoteDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: (cnm: CreditNote) => (
        <span className={cn(
          "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
          cnm.status === 'open' ? "bg-amber-100 text-amber-700" : 
          cnm.status === 'closed' ? "bg-emerald-100 text-emerald-700" :
          "bg-gray-100 text-gray-500"
        )}>
          {cnm.status}
        </span>
      )
    },
    { 
      header: 'Customer', 
      accessor: (cnm: CreditNote) => (
        <span className="font-bold text-gray-900">{cnm.customer?.name}</span>
      )
    },
    { 
      header: 'Number', 
      accessor: (cnm: CreditNote) => (
        <span className="font-medium text-gray-600 border-b border-dotted border-gray-300 pb-0.5">{cnm.number}</span>
      )
    },
    { 
      header: 'Linked Invoice', 
      accessor: (cnm: CreditNote) => (
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
          {cnm.invoice ? (
            <>
              <LinkIcon size={14} className="text-gray-400" />
              {cnm.invoice.number}
            </>
          ) : (
            <span className="text-gray-300">Standalone</span>
          )}
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (cnm: CreditNote) => (
        <div className="font-bold text-rose-600 text-right">
          -{new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(cnm.total)}
        </div>
      ),
      className: 'text-right'
    },
    {
      header: '',
      accessor: (cnm: CreditNote) => (
        <div className="flex items-center justify-end gap-2">
          {cnm.status !== 'draft' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCreditNoteStatus(cnm.id, 'draft');
              }}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              Draft
            </button>
          )}
          {cnm.status !== 'open' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCreditNoteStatus(cnm.id, 'open');
              }}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              Open
            </button>
          )}
          {cnm.status !== 'closed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                updateCreditNoteStatus(cnm.id, 'closed');
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all active:scale-95"
            >
              Close
            </button>
          )}
          <Link 
            href={`/sales/credit-notes/${cnm.id}`}
            onClick={(e) => e.stopPropagation()}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
          >
            <Edit size={16} />
          </Link>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setCreditNoteToDelete(cnm);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      className: 'w-80 text-right'
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Credit Notes</h1>
        <div className="flex gap-3">
          <Link 
            href="/sales/credit-notes/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-95"
          >
            New Credit Note
          </Link>
          <button className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all">
            <MoreHorizontal size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-amber-600 transition-colors">Open</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-amber-600 tracking-tight">{formatCurrency(metrics.open / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-amber-400">K Rs</span>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 group-hover:text-emerald-600 transition-colors">Closed</p>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-black text-emerald-600 tracking-tight">{formatCurrency(metrics.closed / 1000).replace('Rs', '')}</span>
            <span className="text-lg font-bold text-emerald-400">K Rs</span>
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
          data={filteredCreditNotes} 
          isLoading={loading} 
        />
      </div>

      <ConfirmationModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={deleteCreditNote}
        title="Delete Credit Note"
        message={`Are you sure you want to delete credit note ${creditNoteToDelete?.number}? This action cannot be undone.`}
        confirmText="Delete Credit Note"
        variant="destructive"
      />
    </div>
  );
};

export default CreditNotesPage;
