'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

interface CustomerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CustomerForm = ({ onSuccess, onCancel }: CustomerFormProps) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CustomerFormData>();

  const onSubmit = async (data: CustomerFormData) => {
    try {
      await api.post('/customers', data);
      toast.success('Customer created successfully!');
      onSuccess();
    } catch (error: any) {
      console.error('Failed to create customer', error);
      toast.error(error.response?.data?.message || 'Failed to create customer');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-700">Customer Name *</label>
        <input 
          {...register('name', { required: 'Name is required' })}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900 placeholder:text-gray-400"
          placeholder="e.g. Acme Corp"
        />
        {errors.name && <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Email</label>
          <input 
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="contact@acme.com"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-bold text-gray-700">Phone</label>
          <input 
            {...register('phone')}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm text-gray-900 placeholder:text-gray-400"
            placeholder="+1 555-0123"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-bold text-gray-700">Address</label>
        <textarea 
          {...register('address')}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-hidden transition-all text-sm resize-none text-gray-900 placeholder:text-gray-400"
          placeholder="Enter billing address..."
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
          {isSubmitting ? 'Saving...' : 'Create Customer'}
        </button>
      </div>
    </form>
  );
};
