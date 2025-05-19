import { supabase } from '../lib/supabase';

export interface SearchResult {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  price?: number;
  type: 'product' | 'brand' | 'category';
  slug?: string;
}

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;
  const results: SearchResult[] = [];

  try {
    // Search products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, description, image, price')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);

    if (productsError) {
      console.error('Error searching products:', productsError);
    } else if (products) {
      results.push(
        ...products.map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          image: product.image,
          price: product.price,
          type: 'product' as const,
        }))
      );
    }

    // Search brands
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('id, name, description, image, slug')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5);

    if (brandsError) {
      console.error('Error searching brands:', brandsError);
    } else if (brands) {
      results.push(
        ...brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          description: brand.description,
          image: brand.image,
          type: 'brand' as const,
          slug: brand.slug,
        }))
      );
    }

    // Search categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, description, image, slug')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(5);

    if (categoriesError) {
      console.error('Error searching categories:', categoriesError);
    } else if (categories) {
      results.push(
        ...categories.map((category) => ({
          id: category.id,
          name: category.name,
          description: category.description,
          image: category.image,
          type: 'category' as const,
          slug: category.slug,
        }))
      );
    }

    return results;
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, description, image, price')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(20);

    if (error) {
      console.error('Error searching products:', error);
      return [];
    }

    return data.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      image: product.image,
      price: product.price,
      type: 'product' as const,
    }));
  } catch (error) {
    console.error('Search products error:', error);
    return [];
  }
}

export async function searchBrands(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, description, image, slug')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);

    if (error) {
      console.error('Error searching brands:', error);
      return [];
    }

    return data.map((brand) => ({
      id: brand.id,
      name: brand.name,
      description: brand.description,
      image: brand.image,
      type: 'brand' as const,
      slug: brand.slug,
    }));
  } catch (error) {
    console.error('Search brands error:', error);
    return [];
  }
}

export async function searchCategories(query: string): Promise<SearchResult[]> {
  if (!query || query.trim() === '') {
    return [];
  }

  const searchTerm = `%${query.toLowerCase()}%`;

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description, image, slug')
      .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
      .limit(10);

    if (error) {
      console.error('Error searching categories:', error);
      return [];
    }

    return data.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      type: 'category' as const,
      slug: category.slug,
    }));
  } catch (error) {
    console.error('Search categories error:', error);
    return [];
  }
}
