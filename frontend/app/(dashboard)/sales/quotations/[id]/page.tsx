'use client';

import React, { useEffect, useState, use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { QuotationForm } from '@/components/quotations/QuotationForm';
import api from '@/lib/api';

const EditQuotationPage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        const res = await api.get(`/quotations/${id}`);
        setQuotation(res.data);
      } catch (error) {
        console.error('Failed to fetch quotation', error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuotation();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading quotation data...</div>;
  if (!quotation) return <div className="p-8 text-center font-bold text-rose-500">Quotation not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/quotations" className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
            <ArrowLeft size={24} className="text-gray-400" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Quotation: {quotation.number}</h1>
        </div>
      </div>

      <QuotationForm initialData={quotation} />
    </div>
  );
};

export default EditQuotationPage;
