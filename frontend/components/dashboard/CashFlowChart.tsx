'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

import api from '@/lib/api';
import { useState, useEffect } from 'react';

interface CashFlowData {
  month: string;
  incoming: number;
  outgoing: number;
}

const CashFlowChart = () => {
  const [data, setData] = useState<CashFlowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchCashFlow = async () => {
      try {
        const res = await api.get('/dashboard/cash-flow');
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch cash flow data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCashFlow();
  }, []);

  if (!isMounted || loading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-50 rounded-3xl animate-pulse">
        <p className="text-gray-400 font-bold text-sm tracking-tight">Analyzing cash flow...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '20px', 
              border: 'none', 
              boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
              padding: '16px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="incoming" 
            stroke="#4f46e5" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorIncoming)" 
          />
          <Area 
            type="monotone" 
            dataKey="outgoing" 
            stroke="#f43f5e" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorOutgoing)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CashFlowChart;

