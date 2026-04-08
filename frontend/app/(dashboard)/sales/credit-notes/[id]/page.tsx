'use client';

import React, { useEffect, useState, use } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { CreditNoteForm } from '@/components/credit-notes/CreditNoteForm';
import api from '@/lib/api';

const EditCreditNotePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [creditNote, setCreditNote] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCreditNote = async () => {
      try {
        const res = await api.get(`/credit-notes/${id}`);
        setCreditNote(res.data);
      } catch (error) {
        console.error('Failed to fetch credit note', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCreditNote();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold text-gray-500">Loading credit note data...</div>;
  if (!creditNote) return <div className="p-8 text-center font-bold text-rose-500">Credit note not found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/sales/credit-notes" className="p-2 hover:bg-white rounded-xl transition-all border border-transparent hover:border-gray-100">
            <ArrowLeft size={24} className="text-gray-400" />
          </Link>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Edit Credit Note: {creditNote.number}</h1>
        </div>
      </div>

      <CreditNoteForm initialData={creditNote} />
    </div>
  );
};

export default EditCreditNotePage;
