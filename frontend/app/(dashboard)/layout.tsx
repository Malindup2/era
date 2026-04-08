'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Bell, Search, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsAuth(true);
      fetchProfile();
    }
  }, [router]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      setUser(res.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
    }
  };

  if (!isAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-indigo-600 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="font-bold tracking-tight">Securing your session...</p>
      </div>
    );
  }

  return (

    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl w-96 border border-gray-100">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices, customers..."
              className="bg-transparent border-none outline-hidden text-sm w-full text-gray-700"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{user?.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Accessing...'}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-200">
                <User size={20} />
              </div>
            </div>

          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
