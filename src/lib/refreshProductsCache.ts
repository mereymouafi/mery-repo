/**
 * This utility helps refresh product data across the application
 * to ensure that deleted or modified products are properly updated everywhere
 */

import { supabase } from './supabase';

export interface ProductsRefreshEvent {
  type: 'product_deleted' | 'product_updated' | 'product_added' | 'category_deleted' | 'category_updated' | 'category_added';
  id?: string;
  timestamp: number;
}

/**
 * Creates a cache-busting timestamp for product data
 * This helps components know when to reload product data
 */
export async function broadcastProductsChange(
  type: ProductsRefreshEvent['type'], 
  id?: string
): Promise<void> {
  // The timestamp will help components know when data was last changed
  const timestamp = Date.now();
  
  try {
    // Save the refresh event to localStorage in browser environments
    if (typeof window !== 'undefined') {
      const event: ProductsRefreshEvent = { type, id, timestamp };
      window.localStorage.setItem('products_refresh_timestamp', timestamp.toString());
      window.localStorage.setItem('products_last_event', JSON.stringify(event));
      
      // Dispatch a custom event that components can listen for
      window.dispatchEvent(new CustomEvent('products_data_changed', { detail: event }));
    }
    
    // Also broadcast via Supabase realtime to help sync across clients/devices
    await supabase.channel('products-refresh')
      .send({
        type: 'broadcast',
        event: 'products_refresh',
        payload: { type, id, timestamp },
      });
      
    console.log(`Products refresh broadcast: ${type} at ${new Date(timestamp).toISOString()}`);
  } catch (error) {
    console.error('Error broadcasting products change:', error);
  }
}

/**
 * Get the latest refresh timestamp for products data
 */
export function getProductsRefreshTimestamp(): number {
  if (typeof window !== 'undefined') {
    const savedTimestamp = window.localStorage.getItem('products_refresh_timestamp');
    if (savedTimestamp) {
      return parseInt(savedTimestamp, 10);
    }
  }
  return 0;
}
