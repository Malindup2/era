'use client';

import React, { useEffect, useState, use } from 'react';
import api from '@/lib/api';
import { 
  ArrowLeft, Mail, Phone, MapPin, 
  FileText, IndianRupee, Clock, CheckCircle2, 
  AlertCircle, Receipt, RefreshCcw, TrendingUp, Edit
} from 'lucide-react';
import Link from 'next/link';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/ui/Modal';
import { CustomerForm } from '@/components/customers/CustomerForm';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CustomerHistory {
  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  invoices: any[];
  quotations: any[];
  creditNotes: any[];
}

const CustomerDetailsPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/customers/${id}/history`);
      setHistory(res.data);
    } catch (error) {
      console.error('Failed to fetch customer history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading customer history...</div>;
  if (!history) return <div className="p-8 text-center font-bold text-rose-500">Customer not found.</div>;

  const totalInvoiced = history.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalPaid = history.invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0);
  const totalCredited = history.creditNotes.reduce((sum, cn) => sum + Number(cn.total), 0);
  const totalOutstanding = totalInvoiced - totalPaid - totalCredited;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  // Combine all items into a single timeline
  const timeline = [
    ...history.invoices.map(i => ({ ...i, type: 'invoice' })),
    ...history.quotations.map(q => ({ ...q, type: 'quotation' })),
    ...history.creditNotes.map(c => ({ ...c, type: 'credit_note' })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header & Profile */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-4">
            <Link href="/sales/customers" className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
              <ArrowLeft size={24} className="text-gray-400" />
            </Link>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">{history.customer.name}</h1>
          </div>
          
          <div className="flex flex-wrap gap-6 text-sm font-medium text-gray-500">
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-indigo-400" />
              {history.customer.email}
            </div>
            <div className="flex items-center gap-2">
              <Phone size={18} className="text-indigo-400" />
              {history.customer.phone}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-indigo-400" />
              {history.customer.address}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-xl font-bold border border-gray-100 transition-all shadow-sm"
          >
            <Edit size={20} />
            Edit Profile
          </button>
          <Link 
            href="/sales/invoices/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-100"
          >
            Create Invoice
          </Link>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Sales</p>
          <p className="text-2xl font-black text-gray-900">{formatCurrency(totalInvoiced)}</p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
            <TrendingUp size={12} /> +12% from last month
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-black text-emerald-600">{formatCurrency(totalPaid)}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Historical Total</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-black text-rose-500">{formatCurrency(totalOutstanding)}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Awaiting Payment</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider">Total Credited</p>
          <p className="text-2xl font-black text-amber-500">{formatCurrency(totalCredited)}</p>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Returns & Credits</p>
        </div>
      </div>

      {/* Activity History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-indigo-600" />
            Transaction History
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-600 shadow-sm">All Activity</span>
          </div>
        </div>

        <div className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4 text-left">Type</th>
                <th className="px-8 py-4 text-left">Reference</th>
                <th className="px-8 py-4 text-left">Date</th>
                <th className="px-8 py-4 text-left">Status</th>
                <th className="px-8 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {timeline.length > 0 ? timeline.map((entry, idx) => (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      entry.type === 'invoice' ? 'bg-indigo-50 text-indigo-400' : 
                      entry.type === 'quotation' ? 'bg-blue-50 text-blue-400' : 'bg-rose-50 text-rose-400'
                    )}>
                      {entry.type === 'invoice' ? <Receipt size={18} /> : 
                       entry.type === 'quotation' ? <FileText size={18} /> : <RefreshCcw size={18} />}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-bold text-gray-900">
                    {entry.number}
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider",
                      entry.status === 'paid' ? 'bg-emerald-50 text-emerald-600' :
                      entry.status === 'converted' ? 'bg-blue-50 text-blue-600' :
                      'bg-gray-50 text-gray-400'
                    )}>
                      {entry.status}
                    </span>
                  </td>
                  <td className={cn(
                    "px-8 py-6 text-right font-black",
                    entry.type === 'credit_note' ? 'text-rose-600' : 'text-gray-900'
                  )}>
                    {entry.type === 'credit_note' ? '-' : ''}{formatCurrency(entry.total)}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-medium">
                    No transactions found for this customer.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit Customer Profile"
      >
        <CustomerForm 
          initialData={history.customer}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchHistory();
          }} 
          onCancel={() => setIsEditModalOpen(false)} 
        />
      </Modal>
    </div>
  );
};

export default CustomerDetailsPage;
