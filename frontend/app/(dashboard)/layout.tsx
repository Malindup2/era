'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

    <div className="relative z-0 flex bg-gray-50 min-h-screen">
      <Sidebar />
      <main className="relative z-0 flex-1 flex flex-col">
        {/* Sleek Title Section */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
          <div className="flex items-center gap-8">
            {/* Left side empty or for other utilities if needed */}
          </div>


          <div className="flex items-center gap-8">
            {/* Live Time & Date */}
            <div className="text-right flex flex-col justify-center border-r border-gray-100 pr-8">
              <span className="text-lg font-black text-gray-900 tracking-tight leading-none">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                {time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-black text-gray-900 leading-tight">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{user?.role || 'User'}</p>
              </div>
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                <User size={18} />
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
