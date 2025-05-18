import { supabase } from './supabase';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  brand: string | null;
  image: string;
  images: string[] | null;
  is_new: boolean | null;
  is_best_seller: boolean | null;
  color: string;
  dimensions: string;
  material: string;
  made_in: string;
  sizes: string[] | null;
  created_at: string;
  slug?: string; // Optional slug for URL-friendly version of the product name
}

/**
 * Fetch all products from Supabase
 */
export const getProducts = async (): Promise<{
  data: Product[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categoryId: string): Promise<{
  data: Product[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category_id', categoryId)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get a product by its ID
 */
export const getProductById = async (id: string): Promise<{
  data: Product | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching product with id ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Search products by query
 */
export const searchProducts = async (query: string): Promise<{
  data: Product[] | null;
  error: Error | null;
}> => {
  try {
    // This uses Postgres full-text search with "ilike" for case-insensitive matching
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`);

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error searching products with query "${query}":`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Add a new product
 */
export const addProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<{
  data: Product | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error adding product:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Update an existing product
 */
export const updateProduct = async (id: string, updates: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<{
  data: Product | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error updating product with id ${id}:`, error);
    return { data: null, error: error as Error };
  }
};

/**
 * Delete a product
 */
export const deleteProduct = async (id: string): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error(`Error deleting product with id ${id}:`, error);
    return { success: false, error: error as Error };
  }
};

/**
 * Get latest products
 * @param limit Number of products to return
 */
export const getLatestProducts = async (limit: number = 4): Promise<{
  data: Product[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching latest products:`, error);
    return { data: null, error: error as Error };
  }
};