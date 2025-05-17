import { supabase } from './supabase';
import fs from 'fs';
import path from 'path';
import { broadcastProductsChange } from './refreshProductsCache';

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

interface StaticProduct {
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

interface StaticCategory {
  id: string;
  name: string;
}

interface StaticBrand {
  id: string;
  name: string;
}

export async function syncProductsFile(changeType: 'product_deleted' | 'product_updated' | 'product_added' | 'category_deleted' | 'category_updated' | 'category_added' = 'product_updated', id?: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Fetch all categories from database
    const { data: dbCategories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    // Fetch all products from database
    const { data: dbProducts, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    // Build the static format categories
    const staticCategories: StaticCategory[] = [
      { id: 'all', name: 'All Products' },
      ...dbCategories.map((cat: DatabaseCategory) => ({
        id: cat.slug,
        name: cat.name
      }))
    ];

    // Keep the brands as they are (could be enhanced to sync from DB if needed)
    const staticBrands: StaticBrand[] = [
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

    // Create a map to look up category slugs by id
    const categorySlugMap: Record<string, string> = {};
    dbCategories.forEach((cat: DatabaseCategory) => {
      categorySlugMap[cat.id] = cat.slug;
    });

    // Build the static format products
    const staticProducts: StaticProduct[] = dbProducts.map((product: DatabaseProduct, index: number) => ({
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

    // Generate the products.ts file content
    const content = `// Mock product data
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

// Added new categories and brands inspired by negosiodelux.store
export const categories = ${JSON.stringify(staticCategories, null, 2)};

export const brands = ${JSON.stringify(staticBrands, null, 2)};

export const products: Product[] = ${JSON.stringify(staticProducts, null, 2)};
`;

    // Get the absolute path to the products.ts file
    const filePath = path.resolve(process.cwd(), 'src', 'data', 'products.ts');
    console.log(`Syncing products file to: ${filePath}`);
    console.log(`Writing ${staticProducts.length} products and ${staticCategories.length - 1} categories`);
    
    try {
      // Write the file synchronously to ensure it's completed before proceeding
      fs.writeFileSync(filePath, content, { encoding: 'utf8' });
      console.log('Products file successfully updated!');
      
      // Broadcast the change to trigger refreshes across the application
      await broadcastProductsChange(changeType, id);
      
      // Force a cache-bust if possible in development environments
      if (typeof window !== 'undefined') {
        console.log('Broadcasting change event to refresh products');
        // The broadcastProductsChange already handles this
      }
      
      return { success: true };
    } catch (writeError: any) {
      console.error('Error writing to products file:', writeError);
      throw new Error(`Failed to write products file: ${writeError.message}`);
    }
  } catch (error: any) {
    console.error('Error syncing products file:', error);
    return { success: false, error: error.message };
  }
}
