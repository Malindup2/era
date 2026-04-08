'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ChevronDown,
  ChevronRight,
  FileText,
  Users,
  Quote,
  Receipt,
  LogOut,
  Building2
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useRouter } from 'next/navigation';
import { ConfirmationModal } from '../ui/ConfirmationModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [salesOpen, setSalesOpen] = useState(true);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const navItems = [
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' },
    { label: 'Items', icon: <Package size={20} />, href: '/items' },
  ];

  const salesItems = [
    { label: 'Invoices', icon: <FileText size={18} />, href: '/sales/invoices' },
    { label: 'Quotations', icon: <Quote size={18} />, href: '/sales/quotations' },
    { label: 'Credit Notes', icon: <Receipt size={18} />, href: '/sales/credit-notes' },
    { label: 'Customers', icon: <Users size={18} />, href: '/sales/customers' },
  ];

  return (
    <aside className="relative z-30 w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 overflow-visible">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-3 mb-10 group no-underline transition-all">
          <div className="w-12 h-12 flex items-center justify-center transition-transform">
            <Image src="/logo.svg" alt="ERA Biz" width={40} height={40} priority />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">ERA Biz</span>
            <span className="text-[10px] uppercase font-bold text-indigo-500 tracking-widest leading-none">Enterprise</span>
          </div>
        </Link>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium",
                pathname === item.href
                  ? "bg-indigo-50 text-indigo-600 shadow-xs"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <span className={cn(
                "transition-colors",
                pathname === item.href ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"
              )}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}

          {/* Sales Submenu */}
          <div className="pt-2">
            <button
              onClick={() => setSalesOpen(!salesOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm font-medium group"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart size={20} className="text-gray-400 group-hover:text-gray-600" />
                <span>Sales</span>
              </div>
              {salesOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {salesOpen && (
              <div className="relative z-40 mt-1 ml-4 space-y-1 pl-4 border-l border-gray-100">
                {salesItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-xs font-medium",
                      pathname === item.href
                        ? "text-indigo-600 bg-indigo-50/50"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100">
        <button 
          onClick={() => setIsLogoutModalOpen(true)}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-100 transition-all font-bold group"
        >
          <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span>Logout</span>
        </button>
      </div>

      <ConfirmationModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        message="Are you sure you want to log out? You will need to sign in again to access the dashboard."
        confirmLabel="Logout Now"
        isDestructive={true}
      />
    </aside>
  );
};

export default Sidebar;
