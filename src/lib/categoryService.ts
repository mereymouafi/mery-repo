import { supabase } from './supabase';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

/**
 * Fetch all categories from Supabase
 */
export const getCategories = async (): Promise<{
  data: Category[] | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { data: null, error: error as Error };
  }
};

/**
 * Get a category by its slug
 */
export const getCategoryBySlug = async (slug: string): Promise<{
  data: Category | null;
  error: Error | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return { data: null, error: error as Error };
  }
};
