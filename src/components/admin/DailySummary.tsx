import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface DailySummaryProps {
  selectedDate: Date | null;
}

interface SummaryStats {
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
}

const DailySummary: React.FC<DailySummaryProps> = ({ selectedDate }) => {
  const [stats, setStats] = useState<SummaryStats>({
    totalOrders: 0,
    totalRevenue: 0,
    newCustomers: 0
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDailyStats = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('orders')
          .select('*, customer_name');
        
        // Apply date filtering only if a date is selected
        if (selectedDate) {
          // Create start and end of day for filtering
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);
          
          query = query
            .gte('created_at', startOfDay.toISOString())
            .lte('created_at', endOfDay.toISOString());
        }
        
        // Execute the query
        const { data: orders, error } = await query;
        
        if (error) {
          console.error('Error fetching daily stats:', error);
          return;
        }
        
        // Calculate stats
        const totalOrders = orders?.length || 0;
        const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
        
        // Count unique customers (unique customer_name values)
        const uniqueCustomers = new Set();
        orders?.forEach(order => {
          if (order.customer_name) {
            uniqueCustomers.add(order.customer_name);
          }
        });
        const newCustomers = uniqueCustomers.size;
        
        setStats({ totalOrders, totalRevenue, newCustomers });
      } catch (err) {
        console.error('Failed to fetch daily stats:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDailyStats();
  }, [selectedDate]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-indigo-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 uppercase">Total Orders</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? '...' : stats.totalOrders}
            </h3>
          </div>
          <div className="p-3 bg-indigo-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {selectedDate ? `For ${selectedDate.toLocaleDateString()}` : 'All Time'}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 uppercase">Total Revenue</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? '...' : `${stats.totalRevenue.toLocaleString()} MAD`}
            </h3>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {selectedDate ? `For ${selectedDate.toLocaleDateString()}` : 'All Time'}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-amber-500">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 uppercase">New Customers</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">
              {loading ? '...' : stats.newCustomers}
            </h3>
          </div>
          <div className="p-3 bg-amber-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <div className="text-sm text-gray-500 mt-2">
          {selectedDate ? `For ${selectedDate.toLocaleDateString()}` : 'All Time'}
        </div>
      </div>
    </div>
  );
};

export default DailySummary;
