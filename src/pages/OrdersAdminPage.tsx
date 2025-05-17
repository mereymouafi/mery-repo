import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import DailySummary from '../components/admin/DailySummary';
import OrderTrendsChart from '../components/admin/OrderTrendsChart';
import FilterBar from '../components/admin/FilterBar';
import CustomerModal from '../components/admin/CustomerModal';
import OrdersReport from '../components/admin/OrdersReport';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';
import { 
  Order, 
  OrderItem, 
  getFilteredOrders, 
  getOrderWithItems,
  updateOrderStatus,
  OrdersFilter 
} from '../lib/orderService';

interface OrderWithItems extends Order {
  items?: OrderItem[];
  expanded?: boolean;
}

const OrdersAdminPage: React.FC = () => {
  // Get the authenticated user from context
  const { user } = useAuth();
  
  // Use the user information for personalization or additional security checks if needed
  // For example, you could display the user's email in the UI or check their role
  // Main state for orders list and loading state
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering and searching
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  // Initialize with null to fetch all orders by default
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  // State for order details
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  // State for customer modal
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  
  // Exchange rate (static for demo purposes)
  const MADtoUSDRate = 0.1; // 1 MAD = 0.1 USD (example rate)
  
  // Format price to USD
  const formatToUSD = (priceInMAD: number): string => {
    const priceInUSD = priceInMAD * MADtoUSDRate;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(priceInUSD);
  };

  // Fetch orders based on filters
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Prepare filter
        const filter: OrdersFilter = {
          status: selectedStatus || undefined,
          searchQuery: searchQuery || undefined,
          startDate: selectedDate || undefined,
          endDate: selectedDate || undefined
        };
        
        console.log('Fetching orders with filter:', filter);
        
        // Get filtered orders
        const { data, error } = await getFilteredOrders(filter);
        
        if (error) {
          console.error('Error fetching orders:', error);
          setError('Failed to fetch orders');
          return;
        }
        
        setOrders(data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [searchQuery, selectedStatus, selectedDate]);

  // Set up real-time subscription
  useEffect(() => {
    // Subscribe to orders changes
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        (payload) => {
          console.log('Orders change received:', payload);
          
          // Refresh the orders list when changes occur
          refreshOrders();
        }
      )
      .subscribe();
      
    return () => {
      // Clean up subscription on component unmount
      subscription.unsubscribe();
    };
  }, []);

  // Refresh orders function for subscription updates
  const refreshOrders = async () => {
    try {
      const filter: OrdersFilter = {
        status: selectedStatus || undefined,
        searchQuery: searchQuery || undefined,
        startDate: selectedDate || undefined,
        endDate: selectedDate || undefined
      };
      
      console.log('Refreshing orders with filter:', filter);
      
      const { data, error } = await getFilteredOrders(filter);
      
      if (error) {
        console.error('Error refreshing orders:', error);
        return;
      }
      
      setOrders(data || []);
    } catch (err) {
      console.error('Failed to refresh orders:', err);
    }
  };

  // Handle expanding a row to show order items
  const handleExpandRow = async (orderId: string) => {
    if (expandedOrderId === orderId) {
      // Collapse row if already expanded
      setExpandedOrderId(null);
      return;
    }
    
    // Expand row and fetch order items
    setExpandedOrderId(orderId);
    
    // Find the order in state
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;
    
    // Check if items are already loaded
    if (orders[orderIndex].items) return;
    
    try {
      // Fetch order items
      const { items, error } = await getOrderWithItems(orderId);
      
      if (error || !items) {
        console.error('Error fetching order items:', error);
        return;
      }
      
      // Update orders state with items
      const updatedOrders = [...orders];
      updatedOrders[orderIndex] = { ...updatedOrders[orderIndex], items };
      setOrders(updatedOrders);
    } catch (err) {
      console.error('Failed to fetch order items:', err);
    }
  };

  // Handle status change
  const handleStatusChange = async (orderId: string, newStatus: 'pending' | 'paid' | 'cancelled') => {
    try {
      const { success, error } = await updateOrderStatus(orderId, newStatus);
      
      if (error || !success) {
        console.error('Error updating order status:', error);
        return;
      }
      
      // Refresh orders to get updated data
      refreshOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    }
  };

  // Handle clicking on a customer to open the modal
  const handleCustomerClick = (customerName: string) => {
    setSelectedCustomer(customerName);
    setIsCustomerModalOpen(true);
  };

  // Handle resetting filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('');
    setSelectedDate(null);
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Orders Admin | Maroc Luxe</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-4">
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Orders Dashboard</h1>
        </div>
      
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {/* Daily Summary Stats */}
        <DailySummary selectedDate={selectedDate as Date} />
        
        {/* Orders Report Download */}
        <OrdersReport selectedDate={selectedDate as Date} />
        
        {/* Filters and Search */}
        <FilterBar 
          onSearchChange={setSearchQuery}
          onStatusChange={setSelectedStatus}
          onDateChange={setSelectedDate}
          onResetFilters={handleResetFilters}
          selectedStatus={selectedStatus}
          selectedDate={selectedDate}
          searchQuery={searchQuery}
        />
        
        {/* Orders List */}
        <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Latest Orders</h2>
          </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxury-gold"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            No orders found for your selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className={`hover:bg-gray-50 ${expandedOrderId === order.id ? 'bg-gray-50' : ''}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button 
                          onClick={() => handleExpandRow(order.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {expandedOrderId === order.id ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleCustomerClick(order.customer_name)}
                          className="text-indigo-600 hover:text-indigo-900 hover:underline focus:outline-none"
                        >
                          {order.customer_name}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="text-gray-900">{order.total_amount.toLocaleString()} MAD</div>
                        <div className="text-xs text-gray-500">{formatToUSD(order.total_amount)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.payment_status === 'paid' ? 'bg-green-100 text-green-800' : order.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <select 
                            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={order.payment_status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as 'pending' | 'paid' | 'cancelled')}
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row showing order items */}
                    {expandedOrderId === order.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-gray-50">
                          <div className="rounded-md border border-gray-200 p-4">
                            <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                            
                            {/* Customer Information */}
                            <div className="mb-4 p-4 bg-white rounded-md shadow-sm">
                              <h5 className="text-sm font-medium text-gray-700 mb-2">Customer Information</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">Name:</p>
                                  <p className="text-sm font-medium">{order.customer_name}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">Phone:</p>
                                  <p className="text-sm font-medium">{order.phone}</p>
                                </div>
                                <div className="md:col-span-2">
                                  <p className="text-sm text-gray-500">Shipping Address:</p>
                                  <p className="text-sm font-medium">{order.address}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Order Items */}
                            <h5 className="text-sm font-medium text-gray-700 mb-2">Items</h5>
                            {!order.items ? (
                              <div className="text-center py-4">
                                <div className="animate-spin inline-block w-6 h-6 border-t-2 border-luxury-gold rounded-full"></div>
                                <p className="text-sm text-gray-500 mt-2">Loading items...</p>
                              </div>
                            ) : order.items.length === 0 ? (
                              <p className="text-sm text-gray-500">No items found for this order.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-100">
                                    <tr>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody className="bg-white divide-y divide-gray-200">
                                    {order.items.map((item) => (
                                      <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap">
                                          <div className="flex items-center space-x-3">
                                            {item.image && (
                                              <div className="flex-shrink-0 h-10 w-10">
                                                <img className="h-10 w-10 object-cover rounded" src={item.image} alt={item.name} />
                                              </div>
                                            )}
                                            <div>
                                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                              {item.size && <div className="text-xs text-gray-500">Size: {item.size}</div>}
                                            </div>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {item.price.toLocaleString()} MAD
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                          {(item.price * item.quantity).toLocaleString()} MAD
                                        </td>
                                      </tr>
                                    ))}
                                    <tr className="bg-gray-50">
                                      <td colSpan={3} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">Total:</td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-gray-900">
                                        {order.total_amount.toLocaleString()} MAD
                                      </td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
        
        {/* Order Trends Chart */}
        <div className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Order Trends</h2>
          </div>
          <div className="p-6">
            <OrderTrendsChart />
          </div>
        </div>
      </div>
      
      {/* Customer Modal */}
      <CustomerModal 
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerName={selectedCustomer || ''}
      />
    </div>
  );
};

export default OrdersAdminPage;
