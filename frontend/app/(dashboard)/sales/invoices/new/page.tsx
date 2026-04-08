'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save, Send } from 'lucide-react';
import api from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Customer {
  id: number;
  name: string;
}

interface Item {
  id: number;
  name: string;
  salePrice: number;
  description: string;
}

interface LineItem {
  itemId: number;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
}

const NewInvoicePage = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  
  const [customerId, setCustomerId] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { itemId: 0, description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, iRes] = await Promise.all([
          api.get('/customers'),
          api.get('/items')
        ]);
        setCustomers(cRes.data);
        setAvailableItems(iRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };
    fetchData();
  }, []);

  const addLineItem = () => {
    setLineItems([...lineItems, { itemId: 0, description: '', quantity: 1, unitPrice: 0, taxRate: 0, amount: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    const newItems = [...lineItems];
    newItems.splice(index, 1);
    setLineItems(newItems);
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const newItems = [...lineItems];
    const item = { ...newItems[index], [field]: value };
    
    // If selecting an existing item, auto-fill details
    if (field === 'itemId') {
      const selectedItem = availableItems.find(ai => ai.id === Number(value));
      if (selectedItem) {
        item.description = selectedItem.description || selectedItem.name;
        item.unitPrice = Number(selectedItem.salePrice);
      }
    }

    // Calculate row amount
    const qty = Number(item.quantity);
    const price = Number(item.unitPrice);
    const tax = Number(item.taxRate);
    item.amount = qty * price * (1 + tax / 100);
    
    newItems[index] = item;
    setLineItems(newItems);
  };

  const subtotal = lineItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const taxTotal = lineItems.reduce((sum, item) => sum + (item.amount - (Number(item.quantity) * Number(item.unitPrice))), 0);
  const total = subtotal + taxTotal;

  const handleSubmit = async (e: React.FormEvent) => {
    if (!customerId) {
      toast.error('Please select a customer before saving.');
      return;
    }

    try {
      const payload = {
        customerId: Number(customerId),
        invoiceDate,
        dueDate: dueDate || invoiceDate,
        notes,
        subtotal,
        taxTotal,
        total,
        lineItems: lineItems.map(item => ({
          ...item,
          itemId: item.itemId || null
        }))
      };

      await api.post('/invoices', payload);
      toast.success('Invoice created successfully');
      router.push('/sales/invoices');
    } catch (error: any) {
      console.error('Failed to create invoice', error);
      toast.error(error.response?.data?.message || 'An error occurred during invoice creation.');
    }
  };

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
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={() => router.push('/sales/invoices')}
            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-white transition-all border border-transparent hover:border-gray-100"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-200"
          >
            <Save size={20} />
            Save Invoice
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 pb-20">
        {/* Main Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Customer *</label>
            <select 
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900 placeholder:text-gray-400"
            >
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Invoice Date</label>
            <input 
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Due Date</label>
            <input 
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Line Items</h3>
            <button 
              type="button" 
              onClick={addLineItem}
              className="flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Plus size={18} /> Add Row
            </button>
          </div>

          <div className="p-8 space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-start group">
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Item</label>
                  <select 
                    value={item.itemId}
                    onChange={(e) => updateLineItem(index, 'itemId', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-hidden text-sm bg-white text-gray-900"
                  >
                    <option value="0">Select Item</option>
                    {availableItems.map(ai => <option key={ai.id} value={ai.id}>{ai.name}</option>)}
                  </select>
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Description</label>
                  <input 
                    value={item.description}
                    onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-hidden text-sm text-gray-900 placeholder:text-gray-400"
                    placeholder="Auto-filled or manual..."
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Qty</label>
                  <input 
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-hidden text-sm text-gray-900"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Price</label>
                  <input 
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-hidden text-sm text-gray-900"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Tax %</label>
                  <input 
                    type="number"
                    value={item.taxRate}
                    onChange={(e) => updateLineItem(index, 'taxRate', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-500 outline-hidden text-sm text-gray-900"
                  />
                </div>
                <div className="col-span-1 space-y-1">
                  <label className="text-[10px] uppercase font-black text-gray-400">Amount</label>
                  <div className="px-3 py-2 text-sm font-bold text-gray-900 bg-gray-50 rounded-lg border border-transparent">
                    {item.amount.toFixed(2)}
                  </div>
                </div>
                <div className="col-span-1 pt-6 flex justify-end">
                  <button 
                    type="button" 
                    onClick={() => removeLineItem(index)}
                    className="p-2 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: Notes & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-2">
              <label className="text-sm font-bold text-gray-700">Internal Notes / Terms</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 outline-hidden transition-all text-sm resize-none text-gray-900 placeholder:text-gray-400"
                placeholder="Thanks for your business!"
              />
            </div>
          </div>

          <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-sm font-medium">Subtotal</span>
                <span className="font-bold">{subtotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span className="text-sm font-medium">Tax Total</span>
                <span className="font-bold">{taxTotal.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
              </div>
              <div className="pt-4 border-t border-gray-100 flex justify-between items-center text-gray-900">
                <span className="text-lg font-black tracking-tight">Total Amount</span>
                <span className="text-3xl font-black text-indigo-600">
                  {total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewInvoicePage;
