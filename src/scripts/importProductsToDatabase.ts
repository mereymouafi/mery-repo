import { supabase } from '../lib/supabase';
import { products, categories } from '../data/products';

/**
 * This script imports all products from the products.ts file into the Supabase database
 * It maps product categories to category_id values from the database
 */
async function importProducts() {
  console.log('Starting product import...');
  
  // First, ensure all categories exist in the database
  const { data: existingCategories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, slug, name');
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return;
  }
  
  // Create a map of category slugs to their IDs for easy lookup
  const categoryMap: Record<string, string> = {};
  
  // If we have existing categories, populate the map
  if (existingCategories && existingCategories.length > 0) {
    existingCategories.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });
  } else {
    // If no categories exist, we need to create them first
    console.log('No categories found, creating categories...');
    
    // Filter out the "all" category as it's just for UI filtering
    const categoriesToInsert = categories
      .filter(cat => cat.id !== 'all')
      .map(cat => ({
        slug: cat.id,
        name: cat.name
      }));
    
    const { data: insertedCategories, error: insertError } = await supabase
      .from('categories')
      .insert(categoriesToInsert)
      .select();
    
    if (insertError) {
      console.error('Error creating categories:', insertError);
      return;
    }
    
    if (insertedCategories) {
      insertedCategories.forEach(cat => {
        categoryMap[cat.slug] = cat.id;
      });
    }
  }
  
  console.log('Category mapping:', categoryMap);
  
  // Now import products one by one
  for (const product of products) {
    // Convert the product to the right format for the database
    const productToInsert = {
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: categoryMap[product.category], // Map the category slug to ID
      brand: product.brand || null,
      image: product.image,
      images: product.images,
      is_new: product.isNew || false,
      is_best_seller: product.isBestSeller || false,
      color: product.color,
      dimensions: product.dimensions,
      material: product.material,
      made_in: product.madeIn,
      sizes: product.sizes || null,
    };
    
    // Check if product already exists by name
    const { data: existingProduct } = await supabase
      .from('products')
      .select('id, name')
      .eq('name', product.name)
      .maybeSingle();
    
    if (existingProduct) {
      console.log(`Product "${product.name}" already exists, skipping...`);
      continue;
    }
    
    // Insert the product
    const { error: insertError } = await supabase
      .from('products')
      .insert([productToInsert]);
    
    if (insertError) {
      console.error(`Error adding product "${product.name}":`, insertError);
    } else {
      console.log(`Added product: ${product.name}`);
    }
  }
  
  console.log('Product import completed!');
}

// Run the import function
importProducts()
  .catch(error => {
    console.error('Import failed:', error);
  });
