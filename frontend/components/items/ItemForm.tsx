'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';

interface ItemFormData {
  name: string;
  code: string;
  type: 'product' | 'service';
  salePrice: number;
  saleTax: string;
  description: string;
}

interface ItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ItemForm = ({ onSuccess, onCancel }: ItemFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ItemFormData>({
    defaultValues: {
      type: 'product',
      saleTax: 'No Tax'
    }
  });

  const onSubmit = async (data: ItemFormData) => {
    try {
      await api.post('/items', data);
      onSuccess();
    } catch (error) {
      console.error('Failed to create item', error);
      alert('An error occurred while creating the item.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Item Name *</label>
          <input 
            {...register('name', { required: 'Name is required' })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm"
            placeholder="e.g. Wireless Mouse"
          />
          {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Item Code *</label>
          <input 
            {...register('code', { required: 'Code is required' })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm"
            placeholder="ITEM-001"
          />
          {errors.code && <p className="text-xs text-rose-500 font-medium">{errors.code.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Type</label>
          <select 
            {...register('type')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm bg-white"
          >
            <option value="product">Product</option>
            <option value="service">Service</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Sale Price *</label>
          <input 
            {...register('salePrice', { required: 'Price is required', valueAsNumber: true })}
            type="number"
            step="0.01"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm"
            placeholder="0.00"
          />
          {errors.salePrice && <p className="text-xs text-rose-500 font-medium">{errors.salePrice.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-700">Sale Tax</label>
        <select 
          {...register('saleTax')}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm bg-white"
        >
          <option value="No Tax">No Tax</option>
          <option value="VAT 15%">VAT 15%</option>
          <option value="GST 18%">GST 18%</option>
        </select>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-700">Description</label>
        <textarea 
          {...register('description')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm resize-none"
          placeholder="Enter item description..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-100"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Create Item'}
        </button>
      </div>
    </form>
  );
};
