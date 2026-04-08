'use client';

import React from 'react';
import { FileText, Building2, User, Calendar, Tag } from 'lucide-react';

interface InvoicePreviewProps {
  invoice: any;
}

export const InvoicePreview = ({ invoice }: InvoicePreviewProps) => {
  if (!invoice) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
    }).format(value);
  };

  return (
    <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-xl max-w-4xl mx-auto print:shadow-none print:border-none print:p-0" id="printable-invoice">
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex items-center gap-3 text-indigo-600">
          <Building2 size={40} strokeWidth={2.5} />
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight">Erabiz POS</h2>
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Business Management</p>
          </div>
        </div>
        <div className="text-right">
          <h1 className="text-4xl font-black text-gray-900 mb-1">INVOICE</h1>
          <p className="text-lg font-bold text-gray-500">{invoice.number}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-12 mb-12 py-8 border-y border-gray-50">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-wider">
            <User size={14} /> Billed To
          </div>
          <div>
            <p className="text-xl font-black text-gray-900">{invoice.customer?.name}</p>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              {invoice.customer?.email}<br />
              {invoice.customer?.phone}<br />
              {invoice.customer?.address}
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-end text-right space-y-4">
          <div className="flex justify-end gap-12">
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Date Issued</p>
              <p className="text-sm font-bold text-gray-900">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Due Date</p>
              <p className="text-sm font-bold text-gray-900">{new Date(invoice.dueDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${invoice.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400'}`}>
              {invoice.status}
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-12">
        <thead>
          <tr className="border-b-2 border-gray-900">
            <th className="py-4 text-left text-xs font-black text-gray-400 uppercase tracking-wider">Description</th>
            <th className="py-4 text-center text-xs font-black text-gray-400 uppercase tracking-wider w-24">Qty</th>
            <th className="py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider w-32">Unit Price</th>
            <th className="py-4 text-right text-xs font-black text-gray-400 uppercase tracking-wider w-32">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {invoice.lineItems?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td className="py-6">
                <p className="font-bold text-gray-900">{item.description}</p>
              </td>
              <td className="py-6 text-center font-bold text-gray-600">{item.quantity}</td>
              <td className="py-6 text-right font-bold text-gray-600">{formatCurrency(item.unitPrice)}</td>
              <td className="py-6 text-right font-black text-gray-900">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex justify-between items-start gap-12">
        <div className="max-w-sm">
          <p className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Notes & Terms</p>
          <p className="text-sm text-gray-500 leading-relaxed italic">
            {invoice.notes || 'Thank you for your business. Please pay within the due date to avoid late fees.'}
          </p>
        </div>
        <div className="w-64 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
            <span>Tax Total</span>
            <span>{formatCurrency(invoice.taxTotal)}</span>
          </div>
          <div className="pt-4 border-t-2 border-gray-900 flex justify-between items-center text-gray-900">
            <span className="text-lg font-black tracking-tight">Total Due</span>
            <span className="text-2xl font-black text-indigo-600">
              {formatCurrency(invoice.total)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-20 pt-8 border-t border-gray-100 text-center">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Generated via Erabiz POS Integration Engine</p>
      </div>
    </div>
  );
};
