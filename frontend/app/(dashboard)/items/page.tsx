'use client';

import React, { useEffect, useState } from 'react';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';
import { ItemForm } from '@/components/items/ItemForm';
import api from '@/lib/api';
import { Plus, Search, Package, MoreHorizontal, Tag, Trash2, Edit, Download, Upload } from 'lucide-react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Item {
  id: number;
  code: string;
  name: string;
  type: 'product' | 'service';
  salePrice: number;
  saleTax: string;
  description: string;
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ItemsPage = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [itemToEdit, setItemToEdit] = useState<Item | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (error) {
      console.error('Failed to fetch items', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.delete(`/items/${itemToDelete.id}`);
      fetchItems();
    } catch (error) {
      console.error('Failed to delete item', error);
    }
  };

  const handleExport = async () => {
    try {
      const { data } = await api.get('/items/export');
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `items-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Items exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export items');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        await api.post('/items/import', { csvContent: content });
        toast.success('Items imported successfully');
        fetchItems();
      } catch (error) {
        console.error('Import failed', error);
        toast.error('Failed to import items. Check CSV format.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
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
      accessor: (i: Item) => (
        <div className="flex items-center gap-2 justify-center">
          <button 
            onClick={() => {
              setItemToEdit(i);
              setIsModalOpen(true);
            }}
            className="p-2 hover:bg-indigo-50 rounded-lg transition-all text-gray-400 hover:text-indigo-600"
          >
            <Edit size={18} />
          </button>
          <button 
            onClick={() => {
              setItemToDelete(i);
              setIsDeleteModalOpen(true);
            }}
            className="p-2 hover:bg-red-50 rounded-lg transition-all text-gray-400 hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      ),
      className: 'w-32'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Items & Inventory</h1>
          <p className="text-gray-500 font-medium">Manage your products and services catalog.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExport}
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-100 flex items-center gap-2 transition-all shadow-sm"
          >
            <Download size={20} />
            Export CSV
          </button>
          <label className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-xl font-bold border border-gray-100 flex items-center gap-2 transition-all shadow-sm cursor-pointer">
            <Upload size={20} />
            Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImport} />
          </label>
          <button 
            onClick={() => {
              setItemToEdit(null);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            New Item
          </button>
        </div>
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

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={itemToEdit ? "Edit Item" : "Create New Item"}
      >
        <ItemForm 
          initialData={itemToEdit}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchItems();
          }} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Item"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone and may affect existing invoices.`}
        confirmLabel="Delete Item"
        isDestructive={true}
      />
    </div>

  );
};

export default ItemsPage;
