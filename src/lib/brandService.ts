import { supabase } from './supabase';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Fetch all brands from Supabase
 */
export const getBrands = async (): Promise<{
  data: Brand[] | null;
  error: Error | null;
}> => {
  try {
    console.log('Fetching brands from Supabase...');
    
    // Log environment variable status for debugging
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    console.log('Supabase URL defined:', supabaseUrl ? 'Yes' : 'No');
    console.log('Supabase Key defined:', supabaseKey ? 'Yes' : 'No');
    
    // Directly fetch brands
    const { data: brands, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');
    
    // Handle Supabase error
    if (error) {
      console.error('Supabase error when fetching brands:', error);
      return { data: null, error: new Error(`Failed to fetch brands: ${error.message}`) };
    }
    
    // Log results
    if (!brands || brands.length === 0) {
      console.log('No brands found in Supabase database');
    } else {
      console.log(`Successfully fetched ${brands.length} brands from Supabase:`, brands);
    }
    
    return { data: brands, error: null };
  } catch (error) {
    // Catch any unexpected errors
    console.error('Unexpected error in getBrands:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error occurred') };
  }
};
