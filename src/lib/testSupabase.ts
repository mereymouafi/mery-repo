import { supabase } from './supabase';

/**
 * Simple function to test the Supabase connection
 * This will try to query the tables and return the structure
 */
export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    // Test orders table connection
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(1);
    
    if (ordersError) {
      console.error('Error connecting to orders table:', ordersError.message);
      return { success: false, error: ordersError };
    }
    
    console.log('Successfully connected to orders table');
    console.log('Orders table structure:', ordersData ? 'Data retrieved' : 'No data yet');
    
    // Test order_items table connection
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .limit(1);
    
    if (itemsError) {
      console.error('Error connecting to order_items table:', itemsError.message);
      return { success: false, error: itemsError };
    }
    
    console.log('Successfully connected to order_items table');
    console.log('Order items table structure:', itemsData ? 'Data retrieved' : 'No data yet');
    
    return { 
      success: true, 
      ordersData, 
      itemsData 
    };
  } catch (error) {
    console.error('Unexpected error testing Supabase connection:', error);
    return { success: false, error };
  }
};

// Export table names for reference
export const tableNames = {
  orders: 'orders',
  orderItems: 'order_items'
};
