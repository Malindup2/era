'use client';

import React, { useEffect, useState, use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { InvoiceForm } from '@/components/invoices/InvoiceForm';
import api from '@/lib/api';

const EditInvoicePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (error) {
        console.error('Failed to fetch invoice', error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading invoice data...</div>;
  if (!invoice) return <div className="p-8 text-center font-bold text-rose-500">Invoice not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/invoices" className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
            <ArrowLeft size={24} className="text-gray-400" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Invoice: {invoice.number}</h1>
        </div>
      </div>

      <InvoiceForm initialData={invoice} />
    </div>
  );
};

export default EditInvoicePage;
