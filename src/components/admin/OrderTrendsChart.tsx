import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { supabase } from '../../lib/supabase';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }[];
}

const OrderTrendsChart: React.FC = () => {
  const [chartData, setChartData] = useState<ChartData>({
    labels: [],
    datasets: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      try {
        // Calculate dates for the past 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6); // 7 days including today
        
        // Fetch orders for the date range
        const { data: orders, error } = await supabase
          .from('orders')
          .select('created_at, total_amount, payment_status')
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endOfDay(endDate).toISOString())
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching chart data:', error);
          return;
        }
        
        // Prepare date labels and data containers
        const labels: string[] = [];
        const orderCounts: number[] = [];
        const revenue: number[] = [];
        
        // Initialize all 7 days with zeros
        for (let i = 0; i < 7; i++) {
          const date = new Date(startDate);
          date.setDate(date.getDate() + i);
          labels.push(formatDate(date));
          orderCounts.push(0);
          revenue.push(0);
        }
        
        // Fill in data from orders
        if (orders) {
          orders.forEach(order => {
            const orderDate = new Date(order.created_at);
            const dateStr = formatDate(orderDate);
            const dayIndex = labels.indexOf(dateStr);
            
            if (dayIndex !== -1) {
              orderCounts[dayIndex]++;
              revenue[dayIndex] += order.total_amount || 0;
            }
          });
        }
        
        // Create chart data
        setChartData({
          labels,
          datasets: [
            {
              label: 'Orders',
              data: orderCounts,
              borderColor: 'rgb(53, 162, 235)',
              backgroundColor: 'rgba(53, 162, 235, 0.5)',
              fill: true,
            },
            {
              label: 'Revenue (MAD)',
              data: revenue,
              borderColor: 'rgb(75, 192, 192)',
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              fill: true,
            },
          ],
        });
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchChartData();
  }, []);

  // Helper function to format date as "MMM DD"
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Helper function to get end of day
  const endOfDay = (date: Date): Date => {
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return end;
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Orders & Revenue (Last 7 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Orders',
        },
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Order Trends</h3>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-gray-400">Loading chart data...</div>
        </div>
      ) : (
        <div className="h-72">
          <Line options={chartOptions} data={chartData} />
        </div>
      )}
    </div>
  );
};

export default OrderTrendsChart;
