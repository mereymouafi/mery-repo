import { supabase } from './supabase';
import type { Database } from './database.types';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type OrderItemInsert = Database['public']['Tables']['order_items']['Insert'];

/**
 * Creates a new order in the database
 */
export const createOrder = async (order: OrderInsert): Promise<{ data: Order | null, error: any }> => {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  return { data, error };
};

/**
 * Creates order items linked to an order
 */
export const createOrderItems = async (items: OrderItemInsert[]): Promise<{ data: OrderItem[] | null, error: any }> => {
  console.log('Creating order items with data:', JSON.stringify(items, null, 2));
  
  try {
    // Ensure all fields are properly formatted for Supabase
    const formattedItems = items.map(item => ({
      ...item,
      order_id: item.order_id, // Ensure UUID format
      product_id: typeof item.product_id === 'string' ? parseInt(item.product_id) : item.product_id, // Ensure integer
      price: typeof item.price === 'string' ? parseFloat(item.price) : item.price, // Ensure number
      quantity: typeof item.quantity === 'string' ? parseInt(item.quantity) : item.quantity, // Ensure integer
    }));

    console.log('Formatted items for insert:', JSON.stringify(formattedItems, null, 2));
    
    // Insert items in batches to avoid potential size limitations
    // Process 10 items at a time
    const batchSize = 10;
    const results: OrderItem[] = [];
    let hasError = null;
    
    for (let i = 0; i < formattedItems.length; i += batchSize) {
      const batch = formattedItems.slice(i, i + batchSize);
      console.log(`Processing batch ${i/batchSize + 1}, size: ${batch.length}`);
      
      const { data, error } = await supabase
        .from('order_items')
        .insert(batch)
        .select();
      
      if (error) {
        console.error(`Error in batch ${i/batchSize + 1}:`, error);
        hasError = error;
        break;
      } else {
        console.log(`Batch ${i/batchSize + 1} successful, items:`, data?.length);
        if (data) results.push(...data);
      }
    }
    
    if (hasError) {
      return { data: null, error: hasError };
    }
    
    console.log('All order items created successfully, total:', results.length);
    return { data: results, error: null };
  } catch (e) {
    console.error('Exception creating order items:', e);
    return { data: null, error: e };
  }
};

/**
 * Gets an order by ID including all its items
 */
export const getOrderWithItems = async (orderId: string): Promise<{ 
  order: Order | null, 
  items: OrderItem[] | null, 
  error: any 
}> => {
  // Get order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();
  
  if (orderError) {
    return { order: null, items: null, error: orderError };
  }
  
  // Get order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', orderId);
  
  return { 
    order, 
    items, 
    error: itemsError 
  };
};

/**
 * Updates order payment status
 */
export const updateOrderStatus = async (
  orderId: string, 
  status: 'pending' | 'paid' | 'cancelled'
): Promise<{ success: boolean, error: any }> => {
  const { error } = await supabase
    .from('orders')
    .update({ 
      payment_status: status,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId);
  
  return { 
    success: !error, 
    error 
  };
};

/**
 * Get all orders with optional filtering
 */
export const getOrders = async (
  options: { status?: string, limit?: number, offset?: number } = {}
): Promise<{ 
  data: Order[] | null, 
  count: number | null, 
  error: any 
}> => {
  const { status, limit = 50, offset = 0 } = options;
  
  try {
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' });
    
    if (status) {
      query = query.eq('payment_status', status);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    return { data, count, error };
  } catch (error) {
    console.error('Error in getOrders:', error);
    return { data: null, count: null, error };
  }
};

// Types for admin dashboard features
export interface OrdersFilter {
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  searchQuery?: string;
}

export interface OrderWithCustomer extends Order {
  customer_email?: string;
}

export interface DailySummary {
  totalOrders: number;
  totalRevenue: number;
  newCustomers: number;
  date: string;
}

/**
 * Get filtered orders for the admin dashboard
 */
export const getFilteredOrders = async (
  filter: OrdersFilter = {},
  limit = 100
): Promise<{ data: OrderWithCustomer[] | null, error: any }> => {
  try {
    const { status, startDate, endDate, searchQuery } = filter;
    
    console.log('Filter params:', { status, startDate, endDate, searchQuery });
    
    let query = supabase
      .from('orders')
      .select('*');
    
    // Apply filters
    if (status) {
      query = query.eq('payment_status', status);
    }
    
    if (startDate && startDate instanceof Date) {
      query = query.gte('created_at', startDate.toISOString());
    }
    
    if (endDate && endDate instanceof Date) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('created_at', endOfDay.toISOString());
    }
    
    if (searchQuery) {
      query = query.ilike('customer_name', `%${searchQuery}%`);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit);
    
    console.log(`Orders fetched: ${data?.length || 0}`, error ? `Error: ${error.message}` : '');
    
    return { data, error };
  } catch (error) {
    console.error('Error in getFilteredOrders:', error);
    return { data: null, error };
  }
};

/**
 * Get daily stats for dashboard summary
 */
export const getDailySummary = async (date: Date): Promise<DailySummary> => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get orders for this day
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString());
    
    if (error) {
      console.error('Error fetching daily summary:', error);
      return {
        totalOrders: 0,
        totalRevenue: 0,
        newCustomers: 0,
        date: date.toISOString()
      };
    }
    
    // Calculate stats
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;
    
    // Count unique customers (this is a simplification - ideally we'd check if they are new)
    const uniqueCustomers = new Set(orders?.map(order => order.customer_name || ''));
    
    return {
      totalOrders,
      totalRevenue,
      newCustomers: uniqueCustomers.size,
      date: date.toISOString()
    };
  } catch (error) {
    console.error('Error in getDailySummary:', error);
    return {
      totalOrders: 0,
      totalRevenue: 0,
      newCustomers: 0,
      date: date.toISOString()
    };
  }
};

/**
 * Get orders trend for the past days
 */
export const getOrdersTrend = async (days = 7): Promise<{ 
  dates: string[], 
  orderCounts: number[], 
  revenue: number[] 
}> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);
    
    // Get orders for date range
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching orders trend:', error);
      return { dates: [], orderCounts: [], revenue: [] };
    }
    
    // Prepare date labels and data arrays
    const dates: string[] = [];
    const orderCounts: number[] = [];
    const revenue: number[] = [];
    
    // Initialize arrays with zeros for all days
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      dates.push(formatDate(date));
      orderCounts.push(0);
      revenue.push(0);
    }
    
    // Fill in data from orders
    if (orders) {
      orders.forEach(order => {
        const orderDate = new Date(order.created_at);
        const dateStr = formatDate(orderDate);
        const dayIndex = dates.indexOf(dateStr);
        
        if (dayIndex !== -1) {
          orderCounts[dayIndex]++;
          revenue[dayIndex] += order.total_amount || 0;
        }
      });
    }
    
    return { dates, orderCounts, revenue };
  } catch (error) {
    console.error('Error in getOrdersTrend:', error);
    return { dates: [], orderCounts: [], revenue: [] };
  }
};

/**
 * Helper function to format date as "MMM DD"
 */
const formatDate = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Helper function to format a date as YYYY-MM-DD
 */
export const formatDateForFilename = (date: Date | null): string => {
  if (!date) return 'no-date';
  return date.toISOString().split('T')[0];
};

/**
 * Get orders with items for a specific day
 */
export const getOrdersForDay = async (date: Date | null): Promise<{ 
  orders: Order[] | null, 
  itemsByOrderId: Record<string, OrderItem[]> | null,
  error: any 
}> => {
  try {
    if (!date) {
      return { orders: null, itemsByOrderId: null, error: 'No date provided' };
    }
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get orders for this day
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('created_at', { ascending: true });
    
    if (error || !orders || orders.length === 0) {
      return { orders: null, itemsByOrderId: null, error: error || 'No orders found for this date' };
    }
    
    // Fetch all order items for these orders
    const orderIds = orders.map(order => order.id);
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .in('order_id', orderIds);
    
    if (itemsError) {
      return { orders, itemsByOrderId: null, error: itemsError };
    }
    
    // Group items by order_id for easier access
    const itemsByOrderId: Record<string, OrderItem[]> = {};
    orderItems?.forEach(item => {
      if (!itemsByOrderId[item.order_id]) {
        itemsByOrderId[item.order_id] = [];
      }
      itemsByOrderId[item.order_id].push(item);
    });
    
    return { orders, itemsByOrderId, error: null };
  } catch (error) {
    console.error('Error fetching orders for day:', error);
    return { orders: null, itemsByOrderId: null, error };
  }
};

/**
 * Generate a downloadable daily orders report in CSV format
 */
export const generateDailyOrdersCSV = async (date: Date | null): Promise<{ data: string, error: any }> => {
  try {
    const { orders, itemsByOrderId, error } = await getOrdersForDay(date);
    
    if (error || !orders || !itemsByOrderId) {
      return { data: '', error: error || 'Failed to generate report' };
    }
    
    // Generate CSV header
    let csv = 'Order ID,Date,Customer Name,Phone,Address,Total Amount,Payment Method,Payment Status,Products\n';
    
    // Generate CSV rows
    orders.forEach(order => {
      const orderDate = new Date(order.created_at).toLocaleString();
      const items = itemsByOrderId[order.id] || [];
      
      // Format products as a single string with product details
      const productsStr = items.map(item => 
        `${item.name} (${item.size}) x${item.quantity} - ${item.price} MAD`
      ).join(' | ');
      
      // Create CSV row with escaped values to handle commas in text
      const row = [
        order.id,
        orderDate,
        `"${order.customer_name || ''}"`,
        `"${order.phone || ''}"`,
        `"${order.address || ''}"`,
        order.total_amount,
        order.payment_method,
        order.payment_status,
        `"${productsStr}"`
      ].join(',');
      
      csv += row + '\n';
    });
    
    return { data: csv, error: null };
  } catch (error) {
    console.error('Error generating CSV report:', error);
    return { data: '', error };
  }
};

/**
 * Generate a downloadable daily orders report in Excel format
 * This returns a base64 string that can be used to create a Blob
 */
export const generateDailyOrdersExcel = async (date: Date | null): Promise<{ data: string, error: any }> => {
  try {
    // We'll use the CSV data and convert it to Excel format on the client side
    // using the xlsx library that will be imported in the component
    const { data: csvData, error } = await generateDailyOrdersCSV(date);
    
    if (error || !csvData) {
      return { data: '', error: error || 'Failed to generate Excel report' };
    }
    
    return { data: csvData, error: null };
  } catch (error) {
    console.error('Error generating Excel report:', error);
    return { data: '', error };
  }
};
