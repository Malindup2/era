'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';

const NewInvoicePage = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/invoices" className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
            <ArrowLeft size={24} className="text-gray-400" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create New Invoice</h1>
        </div>
      </div>

      <InvoiceForm />
    </div>
  );
};

export default NewInvoicePage;
