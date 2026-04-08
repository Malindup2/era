'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal } from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

const CustomersPage = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get('/customers');
        setCustomers(res.data);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const columns = [
    { 
      header: 'Customer', 
      accessor: (c: Customer) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
            {c.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-gray-900">{c.name}</p>
            <p className="text-xs text-gray-500">Member since {new Date(c.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Contact Info', 
      accessor: (c: Customer) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={14} className="text-gray-400" />
            {c.email || 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Phone size={14} className="text-gray-400" />
            {c.phone || 'N/A'}
          </div>
        </div>
      )
    },
    { 
      header: 'Address', 
      accessor: (c: Customer) => (
        <div className="flex items-start gap-2 text-xs text-gray-600 max-w-xs">
          <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="truncate">{c.address || 'No address provided'}</span>
        </div>
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Customers</h1>
          <p className="text-gray-500 font-medium">Manage your client relationships and billing details.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} />
          New Customer
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search customers by name, email or phone..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <Table columns={columns as any} data={customers} isLoading={loading} />
    </div>
  );
};

export default CustomersPage;
