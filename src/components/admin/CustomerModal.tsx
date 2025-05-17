import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Order } from '../../lib/orderService';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string | null;
}

interface CustomerSummary {
  totalSpent: number;
  orderCount: number;
  orders: Order[];
}

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customerName }) => {
  const [customerData, setCustomerData] = useState<CustomerSummary>({
    totalSpent: 0,
    orderCount: 0,
    orders: []
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen && customerName) {
      const fetchCustomerData = async () => {
        setLoading(true);
        try {
          // Fetch all orders for this customer
          const { data: orders, error } = await supabase
            .from('orders')
            .select('*')
            .eq('customer_name', customerName)
            .order('created_at', { ascending: false });
          
          if (error) {
            console.error('Error fetching customer data:', error);
            return;
          }
          
          // Calculate summary data
          const orderCount = orders?.length || 0;
          const totalSpent = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
          
          setCustomerData({
            totalSpent,
            orderCount,
            orders: orders || []
          });
        } catch (err) {
          console.error('Failed to fetch customer data:', err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchCustomerData();
    }
  }, [isOpen, customerName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="customer-modal" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Customer Profile
                  </h3>
                  <button
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {loading ? (
                  <div className="flex justify-center my-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-luxury-gold"></div>
                  </div>
                ) : (
                  <>
                    {/* Customer info */}
                    <div className="bg-gray-50 p-4 rounded-md mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="bg-luxury-gold bg-opacity-20 p-3 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-luxury-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold text-gray-900">{customerName}</h4>
                          <div className="text-sm text-gray-500">Customer since: {customerData.orders.length > 0 ? new Date(customerData.orders[customerData.orders.length - 1].created_at).toLocaleDateString() : 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white border rounded-md p-4">
                        <div className="text-sm text-gray-500">Total Spent</div>
                        <div className="text-2xl font-bold text-gray-900">{customerData.totalSpent.toLocaleString()} MAD</div>
                      </div>
                      <div className="bg-white border rounded-md p-4">
                        <div className="text-sm text-gray-500">Orders</div>
                        <div className="text-2xl font-bold text-gray-900">{customerData.orderCount}</div>
                      </div>
                    </div>
                    
                    {/* Order history */}
                    <h4 className="font-medium text-gray-900 mb-3">Order History</h4>
                    <div className="max-h-64 overflow-y-auto border rounded-md">
                      {customerData.orders.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {customerData.orders.map((order) => (
                              <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                  {order.id.substring(0, 8)}...
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {order.total_amount.toLocaleString()} MAD
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    order.payment_status === 'paid' 
                                      ? 'bg-green-100 text-green-800' 
                                      : order.payment_status === 'cancelled' 
                                        ? 'bg-red-100 text-red-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {order.payment_status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-4 text-gray-500">No order history available</div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-luxury-gold text-base font-medium text-white hover:bg-luxury-gold/90 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;
