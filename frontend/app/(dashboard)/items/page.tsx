'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import api from '@/lib/api';
import { Plus, Search, Package, MoreHorizontal, Tag } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Item {
  id: number;
  code: string;
  name: string;
  type: 'product' | 'service';
  salePrice: number;
  saleTax: string;
}

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get('/items');
        setItems(res.data);
      } catch (error) {
        console.error('Failed to fetch items', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const columns = [
    { 
      header: 'Item', 
      accessor: (i: Item) => (
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-bold",
            i.type === 'product' ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
          )}>
            <Package size={20} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{i.name}</p>
            <p className="text-xs text-gray-500">Code: {i.code}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Type', 
      accessor: (i: Item) => (
        <span className={cn(
          "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
          i.type === 'product' ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"
        )}>
          {i.type}
        </span>
      )
    },
    { 
      header: 'Sale Price', 
      accessor: (i: Item) => (
        <div className="font-bold text-gray-900">
          {formatCurrency(i.salePrice)}
        </div>
      )
    },
    { 
      header: 'Tax Status', 
      accessor: (i: Item) => (
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Tag size={14} className="text-gray-400" />
          {i.saleTax}
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Items & Inventory</h1>
          <p className="text-gray-500 font-medium">Manage your products and services catalog.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200">
          <Plus size={20} />
          Add New Item
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex-1 flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name, code or description..." 
            className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
          />
        </div>
      </div>

      <Table columns={columns as any} data={items} isLoading={loading} />
    </div>
  );
};

export default ItemsPage;
