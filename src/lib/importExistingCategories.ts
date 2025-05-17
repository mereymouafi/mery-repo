import { supabase } from './supabase';
import { categories } from '../data/products';

/**
 * Import all existing categories from products.ts into the Supabase database
 */
export const importExistingCategories = async () => {
  try {
    console.log('Starting to import existing categories...');
    
    // Prepare categories data with slugs and descriptions
    const categoryData = categories.map(category => ({
      name: category.name,
      slug: category.id,
      description: `${category.name} collection`, // Default description
      image: getCategoryImage(category.id), // Get an appropriate image for the category
      created_at: new Date().toISOString(),
    }));
    
    console.log(`Prepared ${categoryData.length} categories for import:`, categoryData);
    
    // Import categories to Supabase
    const { data, error } = await supabase
      .from('categories')
      .upsert(categoryData, { 
        onConflict: 'slug',
        ignoreDuplicates: false
      })
      .select();
      
    if (error) {
      console.error('Error importing categories:', error);
      return { success: false, error };
    }
    
    console.log('Successfully imported categories:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Failed to import categories:', err);
    return { success: false, error: err };
  }
};

/**
 * Get an appropriate image URL for a category
 */
const getCategoryImage = (categoryId: string): string => {
  // Map category IDs to appropriate image URLs
  const categoryImages: Record<string, string> = {
    'handbags': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    'accessories': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
    'wallets': 'https://images.pexels.com/photos/1374128/pexels-photo-1374128.jpeg',
    'collections': 'https://images.pexels.com/photos/8390642/pexels-photo-8390642.jpeg',
    'footwear': 'https://images.pexels.com/photos/292999/pexels-photo-292999.jpeg',
    'clothing': 'https://images.pexels.com/photos/6770028/pexels-photo-6770028.jpeg',
    'tshirts': 'https://images.pexels.com/photos/2881785/pexels-photo-2881785.jpeg',
    'jeans': 'https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg',
    'luggage': 'https://images.pexels.com/photos/2421374/pexels-photo-2421374.jpeg',
    'all': 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg'
  };
  
  return categoryImages[categoryId] || '';
};
