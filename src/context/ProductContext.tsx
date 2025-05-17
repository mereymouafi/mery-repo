import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProducts, Product, deleteProduct } from '../lib/productService';
import { getCategories, Category, deleteCategory } from '../lib/categoryService';
import { supabase } from '../lib/supabase';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  deleteProductGlobal: (id: string) => Promise<{ success: boolean; error: Error | null }>;
  deleteCategoryGlobal: (id: string) => Promise<{ success: boolean; error: Error | null }>;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      const { data, error } = await getProducts();
      if (error) {
        throw error;
      }
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await getCategories();
      if (error) {
        throw error;
      }
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories');
    }
  };

  const refreshProducts = async () => {
    setLoading(true);
    await fetchProducts();
    setLoading(false);
  };

  const refreshCategories = async () => {
    setLoading(true);
    await fetchCategories();
    setLoading(false);
  };

  // Global delete functions that update context state and database
  const deleteProductGlobal = async (id: string) => {
    try {
      const result = await deleteProduct(id);
      if (result.success) {
        // Update local state immediately for better UX
        setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      }
      return result;
    } catch (err) {
      console.error('Error in global product delete:', err);
      return { success: false, error: err as Error };
    }
  };

  const deleteCategoryGlobal = async (id: string) => {
    try {
      const result = await deleteCategory(id);
      if (result.success) {
        // Update local states immediately for better UX
        setCategories(prevCategories => prevCategories.filter(c => c.id !== id));
        // Also remove all products in this category
        setProducts(prevProducts => prevProducts.filter(p => p.category_id !== id));
      }
      return result;
    } catch (err) {
      console.error('Error in global category delete:', err);
      return { success: false, error: err as Error };
    }
  };

  // Initial data load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchProducts(), fetchCategories()]);
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to product changes
    const productSubscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        payload => {
          console.log('Product change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // Add the new product to the state
            const newProduct = payload.new as Product;
            setProducts(prevProducts => [...prevProducts, newProduct]);
          } else if (payload.eventType === 'UPDATE') {
            // Update the product in the state
            const updatedProduct = payload.new as Product;
            setProducts(prevProducts => 
              prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove the product from the state
            const deletedProduct = payload.old as Product;
            setProducts(prevProducts => 
              prevProducts.filter(p => p.id !== deletedProduct.id)
            );
          } else {
            // Fallback: refresh all products
            fetchProducts();
          }
        }
      )
      .subscribe();

    // Subscribe to category changes  
    const categorySubscription = supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        payload => {
          console.log('Category change detected:', payload);
          
          // Handle different types of changes
          if (payload.eventType === 'INSERT') {
            // Add the new category to the state
            const newCategory = payload.new as Category;
            setCategories(prevCategories => [...prevCategories, newCategory]);
          } else if (payload.eventType === 'UPDATE') {
            // Update the category in the state
            const updatedCategory = payload.new as Category;
            setCategories(prevCategories => 
              prevCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
            );
          } else if (payload.eventType === 'DELETE') {
            // Remove the category from the state
            const deletedCategory = payload.old as Category;
            setCategories(prevCategories => 
              prevCategories.filter(c => c.id !== deletedCategory.id)
            );
            
            // Also remove all products in this category
            if (deletedCategory.id) {
              setProducts(prevProducts => 
                prevProducts.filter(p => p.category_id !== deletedCategory.id)
              );
            }
          } else {
            // Fallback: refresh all categories
            fetchCategories();
          }
        }
      )
      .subscribe();
      
    return () => {
      productSubscription.unsubscribe();
      categorySubscription.unsubscribe();
    };
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        loading,
        error,
        refreshProducts,
        refreshCategories,
        deleteProductGlobal,
        deleteCategoryGlobal
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}; 