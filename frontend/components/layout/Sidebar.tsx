'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = () => {
  const pathname = usePathname();
  const [salesOpen, setSalesOpen] = useState(true);

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
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-2 text-indigo-600 mb-8">
          <Building2 size={32} strokeWidth={2.5} />
          <span className="text-xl font-black tracking-tight text-gray-900">Erabiz POS</span>
        </div>

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
              <div className="mt-1 ml-4 space-y-1 pl-4 border-l border-gray-100">
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

      <div className="mt-auto p-4 border-t border-gray-50">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-medium">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
