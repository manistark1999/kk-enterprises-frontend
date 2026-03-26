import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { api } from '@/services/api';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';

interface RevenueData {
  label: string;
  value: number;
}

interface RevenueChartProps {
  isDarkMode: boolean;
  period?: 'today' | 'weekly' | 'monthly' | 'yearly';
  chartType?: 'bar' | 'pie' | 'line';
  data: RevenueData[];
  loading?: boolean;
  error?: string | null;
  colors?: string[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export const RevenueChart: React.FC<RevenueChartProps> = ({ 
  isDarkMode, 
  period, 
  chartType = 'line',
  data = [],
  loading,
  error,
  colors
}) => {

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  let displayData = data;
  let isDummyData = false;

  if (!data || data.length === 0) {
    // Inject seed/sample data strictly mapped matching specific period structures for UI feedback testing empty states
    isDummyData = true;
    
    if (period === 'today') {
      displayData = [
        { label: '08:00', value: 1200 }, { label: '10:00', value: 3400 },
        { label: '12:00', value: 5500 }, { label: '14:00', value: 4200 },
        { label: '16:00', value: 8900 }, { label: '18:00', value: 6500 }
      ];
    } else if (period === 'monthly') {
      displayData = [
        { label: 'Week 1', value: 42000 }, { label: 'Week 2', value: 55000 },
        { label: 'Week 3', value: 38000 }, { label: 'Week 4', value: 61000 }
      ];
    } else if (period === 'yearly') {
      displayData = [
        { label: 'Jan', value: 120000 }, { label: 'Feb', value: 135000 },
        { label: 'Mar', value: 155000 }, { label: 'Apr', value: 142000 },
        { label: 'May', value: 180000 }, { label: 'Jun', value: 195000 },
        { label: 'Jul', value: 210000 }, { label: 'Aug', value: 220000 },
        { label: 'Sep', value: 205000 }, { label: 'Oct', value: 245000 },
        { label: 'Nov', value: 260000 }, { label: 'Dec', value: 280000 }
      ];
    } else {
       // Custom or Weekly
       displayData = [
         { label: 'Mon', value: 12000 }, { label: 'Tue', value: 25000 },
         { label: 'Wed', value: 18000 }, { label: 'Thu', value: 34000 },
         { label: 'Fri', value: 28000 }, { label: 'Sat', value: 42000 },
         { label: 'Sun', value: 38000 }
       ];
    }
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <div className="overflow-x-auto overflow-y-hidden w-full pb-2" style={{ height: 300 }}>
            <div style={{ minWidth: displayData.length > 7 ? '800px' : '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis interval={0} dataKey="label" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                    formatter={(val: any) => {
                      const num = parseFloat(String(val || 0));
                      return [`₹${isNaN(num) ? '0' : num.toLocaleString()}`, 'Revenue'];
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      case 'pie':
        return (
          <div style={{ height: 300, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={displayData}
                  dataKey="value"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                >
                  {displayData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={(colors || COLORS)[index % (colors || COLORS).length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => {
                    const num = parseFloat(String(val || 0));
                    return `₹${isNaN(num) ? '0' : num.toLocaleString()}`;
                  }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'line':
      default:
        return (
          <div className="overflow-x-auto overflow-y-hidden w-full pb-2" style={{ height: 300 }}>
            <div style={{ minWidth: displayData.length > 7 ? '800px' : '100%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={displayData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis interval={0} dataKey="label" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#9ca3af' : '#6b7280', fontSize: 12 }} tickFormatter={(val) => `₹${val/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff', border: 'none', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    formatter={(val: any) => {
                      const num = parseFloat(String(val || 0));
                      return [`₹${isNaN(num) ? '0' : num.toLocaleString()}`, 'Revenue'];
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" animationDuration={1000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      {error && (
        <div className="mb-2 flex items-center justify-center gap-2 text-[10px] text-orange-500 bg-orange-500/5 py-1 px-3 rounded-full w-fit mx-auto">
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
      {isDummyData && (
        <div className="mb-2 flex items-center justify-center gap-2 text-[10px] text-blue-500 bg-blue-500/10 py-1.5 px-4 rounded-full w-fit mx-auto border border-blue-500/20 shadow-sm backdrop-blur-sm">
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="font-semibold tracking-wide">NO LIVE REVENUE DATA • DISPLAYING SAMPLE PREVIEW</span>
        </div>
      )}
      {renderChart()}
    </div>
  );
};
