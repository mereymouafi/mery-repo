import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface ConnectionStatus {
  ordersTable: {
    status: 'pending' | 'connected' | 'error';
    message: string;
  };
  orderItemsTable: {
    status: 'pending' | 'connected' | 'error';
    message: string;
  };
}

export default function SupabaseConnectionTest() {
  const [status, setStatus] = useState<ConnectionStatus>({
    ordersTable: { status: 'pending', message: 'Testing connection...' },
    orderItemsTable: { status: 'pending', message: 'Testing connection...' },
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      setIsLoading(true);
      
      try {
        // Test orders table
        const ordersResult = await supabase
          .from('orders')
          .select('count()', { count: 'exact', head: true });
        
        if (ordersResult.error) {
          setStatus(prev => ({
            ...prev,
            ordersTable: {
              status: 'error',
              message: `Connection error: ${ordersResult.error.message}`
            }
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            ordersTable: {
              status: 'connected',
              message: `Connected successfully! (${ordersResult.count || 0} rows)`
            }
          }));
        }

        // Test order_items table
        const orderItemsResult = await supabase
          .from('order_items')
          .select('count()', { count: 'exact', head: true });
        
        if (orderItemsResult.error) {
          setStatus(prev => ({
            ...prev,
            orderItemsTable: {
              status: 'error',
              message: `Connection error: ${orderItemsResult.error.message}`
            }
          }));
        } else {
          setStatus(prev => ({
            ...prev,
            orderItemsTable: {
              status: 'connected',
              message: `Connected successfully! (${orderItemsResult.count || 0} rows)`
            }
          }));
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md my-4">
      <h2 className="text-xl font-bold mb-4">Supabase Connection Test</h2>
      
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Orders Table</h3>
          <div className={`text-sm ${status.ordersTable.status === 'connected' ? 'text-green-600' : status.ordersTable.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
            {status.ordersTable.status === 'pending' && 'Testing...'}
            {status.ordersTable.status === 'connected' && '✅ '}
            {status.ordersTable.status === 'error' && '❌ '}
            {status.ordersTable.message}
          </div>
        </div>
        
        <div className="border rounded p-4">
          <h3 className="font-medium mb-2">Order Items Table</h3>
          <div className={`text-sm ${status.orderItemsTable.status === 'connected' ? 'text-green-600' : status.orderItemsTable.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
            {status.orderItemsTable.status === 'pending' && 'Testing...'}
            {status.orderItemsTable.status === 'connected' && '✅ '}
            {status.orderItemsTable.status === 'error' && '❌ '}
            {status.orderItemsTable.message}
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        {isLoading ? 'Testing connection...' : 'Connection test complete'}
      </div>
      
      <div className="mt-4 text-xs">
        <p>Supabase URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '❌ Missing'}</p>
        <p>Supabase Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Missing'}</p>
      </div>
    </div>
  );
}
