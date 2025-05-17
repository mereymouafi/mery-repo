import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';

// Define the data types
interface DatabaseProduct {
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
}

interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

interface ProductSyncResult {
  success: boolean;
  error?: string;
  productsCount?: number;
  categoriesCount?: number;
}

/**
 * Force re-download of products from Supabase and update the static file
 * This ensures the products.ts file always matches the database
 */
export async function forceProductSync(): Promise<ProductSyncResult> {
  console.log('Starting product sync...');
  
  try {
    // 1. Fetch all categories from database
    const { data: dbCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    // 2. Fetch all products from database
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    console.log(`Retrieved ${dbProducts.length} products and ${dbCategories.length} categories from database`);

    // 3. Build the static data structure
    const staticCategoriesOutput = [
      { id: 'all', name: 'All Products' },
      ...dbCategories.map((cat: DatabaseCategory) => ({
        id: cat.slug,
        name: cat.name
      }))
    ];

    // Create a map to look up category slugs by id
    const categorySlugMap: Record<string, string> = {};
    dbCategories.forEach((cat: DatabaseCategory) => {
      categorySlugMap[cat.id] = cat.slug;
    });

    // Convert database products to static format
    const staticProductsOutput = dbProducts.map((product: DatabaseProduct, index: number) => ({
      id: index + 1, // Re-index products starting from 1
      name: product.name,
      price: product.price,
      description: product.description,
      category: categorySlugMap[product.category_id] || 'uncategorized',
      ...(product.brand && { brand: product.brand }),
      image: product.image,
      images: product.images || [product.image],
      ...(product.is_new && { isNew: true }),
      ...(product.is_best_seller && { isBestSeller: true }),
      color: product.color,
      dimensions: product.dimensions,
      material: product.material,
      madeIn: product.made_in,
      ...(product.sizes && { sizes: product.sizes }),
    }));

    // Keep the brands as they are
    const staticBrandsOutput = [
      { id: 'all', name: 'All Brands' },
      { id: 'zegna', name: 'ZEGNA' },
      { id: 'loro-piana', name: 'Loro Piana' },
      { id: 'louis-vuitton', name: 'Louis Vuitton' },
      { id: 'dior', name: 'Dior' },
      { id: 'gucci', name: 'Gucci' },
      { id: 'prada', name: 'Prada' },
      { id: 'hermes', name: 'Hermès' },
      { id: 'dolce-gabbana', name: 'Dolce & Gabbana' },
      { id: 'givenchy', name: 'Givenchy' },
      { id: 'fendi', name: 'Fendi' },
      { id: 'loewe', name: 'Loewe' },
      { id: 'armani', name: 'Armani' }
    ];

    // 4. Generate the file content
    const content = `// AUTO-GENERATED FILE - DO NOT EDIT DIRECTLY
// Last updated: ${new Date().toISOString()}
// This file is automatically updated by the admin dashboard

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  brand?: string;
  image: string;
  images: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  color: string;
  dimensions: string;
  material: string;
  madeIn: string;
  sizes?: string[];
}

export const categories = ${JSON.stringify(staticCategoriesOutput, null, 2)};

export const brands = ${JSON.stringify(staticBrandsOutput, null, 2)};

export const products: Product[] = ${JSON.stringify(staticProductsOutput, null, 2)};
`;

    // 5. Write to the file
    const filePath = path.resolve(process.cwd(), 'src', 'data', 'products.ts');
    fs.writeFileSync(filePath, content, 'utf8');

    console.log(`Successfully updated products.ts with ${staticProductsOutput.length} products and ${staticCategoriesOutput.length-1} categories`);

    // 6. Force React to refresh the data if in browser context
    if (typeof window !== 'undefined') {
      // Setting a timestamp can help components know when to refresh
      localStorage.setItem('products_last_sync', Date.now().toString());
      
      // Dispatch an event that components can listen for
      const event = new CustomEvent('products_updated');
      window.dispatchEvent(event);
    }

    return {
      success: true,
      productsCount: staticProductsOutput.length,
      categoriesCount: staticCategoriesOutput.length - 1  // Minus the 'all' category
    };
  } catch (error: any) {
    console.error('Error syncing products file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper function to reload all product data after changes
 */
export async function refreshProducts(): Promise<void> {
  console.log('Refreshing all product data...');
  await forceProductSync();
  
  // Set a refresh flag that the application can check
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('products_refresh_needed', 'true');
    window.localStorage.setItem('products_refresh_timestamp', Date.now().toString());
  }
}

/**
 * Handle deleting a product in admin - ensure it's removed from the static file too
 */
export async function handleProductDelete(id: string): Promise<ProductSyncResult> {
  try {
    // 1. Delete from database
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete product from database: ${error.message}`);
    }
    
    // 2. Sync the static file
    console.log(`Product ${id} deleted, updating static file...`);
    return await forceProductSync();
  } catch (error: any) {
    console.error('Error handling product delete:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Handle deleting a category in admin - ensure it's removed from the static file too
 */
export async function handleCategoryDelete(id: string): Promise<ProductSyncResult> {
  try {
    // 1. Delete all products in this category first
    const { data: productsInCategory, error: fetchError } = await supabase
      .from('products')
      .select('id')
      .eq('category_id', id);
      
    if (fetchError) {
      throw new Error(`Failed to fetch products in category: ${fetchError.message}`);
    }
    
    if (productsInCategory && productsInCategory.length > 0) {
      const { error: deleteProductsError } = await supabase
        .from('products')
        .delete()
        .eq('category_id', id);
        
      if (deleteProductsError) {
        throw new Error(`Failed to delete products in category: ${deleteProductsError.message}`);
      }
      
      console.log(`Deleted ${productsInCategory.length} products from category ${id}`);
    }
    
    // 2. Delete the category itself
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete category from database: ${error.message}`);
    }
    
    // 3. Sync the static file
    console.log(`Category ${id} and its products deleted, updating static file...`);
    return await forceProductSync();
  } catch (error: any) {
    console.error('Error handling category delete:', error);
    return { success: false, error: error.message };
  }
}
