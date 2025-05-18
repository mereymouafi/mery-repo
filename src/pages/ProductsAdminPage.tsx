import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ConfirmationModal from '../components/ui/ConfirmationModal';

import { brands, products, categories } from '../data/products';

interface Product {
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
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

const ProductsAdminPage: React.FC = () => {
  // Get URL parameters
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const categoryIdFromUrl = searchParams.get('categoryId');
  const brandIdFromUrl = searchParams.get('brandId');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<{id: string, name: string}[]>([]);
  const [importing, setImporting] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(categoryIdFromUrl);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(brandIdFromUrl);
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [image, setImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [color, setColor] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [material, setMaterial] = useState('');
  const [madeIn, setMadeIn] = useState('');
  const [sizes, setSizes] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  
  // Confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchProducts();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('products-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          fetchProducts();
        }
      )
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update selected filters when URL parameters change
  useEffect(() => {
    setSelectedCategoryId(categoryIdFromUrl);
    setSelectedBrandId(brandIdFromUrl);
  }, [categoryIdFromUrl, brandIdFromUrl]);

  // Filter products when selectedCategoryId or selectedBrandId changes
  useEffect(() => {
    let filtered = [...dbProducts];
    
    // Filter by category if selected
    if (selectedCategoryId) {
      filtered = filtered.filter(product => product.category_id === selectedCategoryId);
    }
    
    // Filter by brand if selected
    if (selectedBrandId) {
      filtered = filtered.filter(product => product.brand === selectedBrandId);
    }
    
    setFilteredProducts(filtered);
  }, [selectedCategoryId, selectedBrandId, dbProducts]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setDbCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };
  
  const fetchBrands = async () => {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setDbBrands(data || []);
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      const productsData = data || [];
      setDbProducts(productsData);
      
      // Apply filters if selected
      let filtered = [...productsData];
      
      if (selectedCategoryId) {
        filtered = filtered.filter(product => product.category_id === selectedCategoryId);
      }
      
      if (selectedBrandId) {
        filtered = filtered.filter(product => product.brand === selectedBrandId);
      }
      
      setFilteredProducts(filtered);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const parseImages = (imagesString: string): string[] => {
    return imagesString
      .split(',')
      .map(url => url.trim())
      .filter(url => url.length > 0);
  };

  const parseSizes = (sizesString: string): string[] => {
    return sizesString
      .split(',')
      .map(size => size.trim())
      .filter(size => size.length > 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMessage('');

    try {
      // Validate inputs
      if (!name || !price || !categoryId || !image || !color || !material || !madeIn) {
        setError('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      // Parse additional images and sizes
      const imagesArray = additionalImages ? parseImages(additionalImages) : [];
      if (image && !imagesArray.includes(image)) {
        imagesArray.unshift(image);
      }
      
      const sizesArray = sizes ? parseSizes(sizes) : null;

      // Prepare product data
      const productData = {
        name,
        description,
        price: parseFloat(price),
        category_id: categoryId,
        brand: brand || null,
        image,
        images: imagesArray.length > 0 ? imagesArray : null,
        is_new: isNew,
        is_best_seller: isBestSeller,
        color,
        dimensions,
        material,
        made_in: madeIn,
        sizes: sizesArray,
      };

      let error;

      if (editMode && editProductId) {
        // Update existing product
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editProductId);
        
        error = updateError;
      } else {
        // Insert new product
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData])
          .select();
        
        error = insertError;
      }

      if (error) {
        throw error;
      }

      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setCategoryId('');
      setBrand('');
      setImage('');
      setAdditionalImages('');
      setIsNew(false);
      setIsBestSeller(false);
      setColor('');
      setDimensions('');
      setMaterial('');
      setMadeIn('');
      setSizes('');
      
      // Reset edit mode
      if (editMode) {
        setEditMode(false);
        setEditProductId(null);
        setSuccessMessage('Product updated successfully!');
      } else {
        setSuccessMessage('Product added successfully!');
      }

      setError(null);
      // Refresh products list
      fetchProducts();
    } catch (err: any) {
      console.error(editMode ? 'Error updating product:' : 'Error adding product:', err);
      setError(err.message || (editMode ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (id: string) => {
    setProductToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete);

      if (error) {
        throw error;
      }

      // Filter out the deleted product from both product states
      setDbProducts(dbProducts.filter(product => product.id !== productToDelete));
      setFilteredProducts(filteredProducts.filter(product => product.id !== productToDelete));
      
      // Show success message
      setSuccessMessage('Product deleted successfully');
      
      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      console.error('Error deleting product:', err);
      setError(err.message || 'Failed to delete product');
    } finally {
      // Close the modal
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleEdit = (product: Product) => {
    // Set form fields with product data
    setName(product.name);
    setDescription(product.description);
    setPrice(product.price.toString());
    setCategoryId(product.category_id);
    setBrand(product.brand || '');
    setImage(product.image);
    setAdditionalImages(product.images ? product.images.filter(img => img !== product.image).join(', ') : '');
    setIsNew(product.is_new || false);
    setIsBestSeller(product.is_best_seller || false);
    setColor(product.color);
    setDimensions(product.dimensions);
    setMaterial(product.material);
    setMadeIn(product.made_in);
    setSizes(product.sizes ? product.sizes.join(', ') : '');
    
    // Set edit mode
    setEditMode(true);
    setEditProductId(product.id);
    
    // Scroll to the form
    document.getElementById('product-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const cancelEdit = () => {
    // Reset form
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setBrand('');
    setImage('');
    setAdditionalImages('');
    setIsNew(false);
    setIsBestSeller(false);
    setColor('');
    setDimensions('');
    setMaterial('');
    setMadeIn('');
    setSizes('');
    
    // Reset edit mode
    setEditMode(false);
    setEditProductId(null);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = dbCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };
  
  const getBrandName = (brandId: string): string => {
    const brand = dbBrands.find(b => b.id === brandId);
    return brand ? brand.name : 'Unknown';
  };
  
  const importAllProducts = async () => {
    setImporting(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      // First, ensure all categories exist in the database
      const categoryMap: Record<string, string> = {};
      
      // If we have existing categories, populate the map
      if (dbCategories.length > 0) {
        dbCategories.forEach(cat => {
          categoryMap[cat.slug] = cat.id;
        });
      } else {
        // If no categories exist, we need to create them first
        console.log('No categories found, creating categories...');
        
        // Filter out the 'all' category
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
          throw new Error(`Error creating categories: ${insertError.message}`);
        }
        
        if (insertedCategories) {
          insertedCategories.forEach(cat => {
            categoryMap[cat.slug] = cat.id;
          });
          // Refresh categories list
          fetchCategories();
        }
      }
      
      let addedCount = 0;
      let skippedCount = 0;
      let errorCount = 0;
      
      // Import each product from the products.ts file
      for (const product of products) {
        // Check if product already exists by name
        const { data: existingProduct } = await supabase
          .from('products')
          .select('id, name')
          .eq('name', product.name)
          .maybeSingle();
        
        if (existingProduct) {
          skippedCount++;
          continue;
        }
        
        // Convert the product to the database format
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
        
        // Insert the product
        const { error: insertError } = await supabase
          .from('products')
          .insert([productToInsert]);
        
        if (insertError) {
          errorCount++;
          console.error(`Error adding product "${product.name}":`, insertError);
        } else {
          addedCount++;
        }
      }
      
      setSuccessMessage(`Import completed: ${addedCount} products added, ${skippedCount} skipped, ${errorCount} errors`);
      
      // Refresh the products list
      fetchProducts();
    } catch (err: any) {
      console.error('Import failed:', err);
      setError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="container px-4 py-6 mx-auto">
      <Helmet>
        <title>Product Management | Maroc Luxe Admin</title>
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <button
          onClick={importAllProducts}
          disabled={importing}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
        >
          {importing ? 'Importing...' : 'Import All Products from products.ts'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Product Form */}
        <div className="bg-white shadow-md rounded-lg p-6" id="product-form">
          <h2 className="text-xl font-semibold mb-4">{editMode ? 'Update Product' : 'Add New Product'}</h2>
          
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name*
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price (MAD)*
                </label>
                <input
                  type="number"
                  id="price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Select a category</option>
                  {dbCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand
                </label>
                <select
                  id="brand"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Main Image URL*
              </label>
              <input
                type="url"
                id="image"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://example.com/image.jpg"
                required
              />
              {image && (
                <div className="mt-2">
                  <img src={image} alt="Preview" className="h-24 w-auto object-contain border rounded" />
                </div>
              )}
            </div>

            <div>
              <label htmlFor="additionalImages" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Images (comma-separated URLs)
              </label>
              <textarea
                id="additionalImages"
                value={additionalImages}
                onChange={(e) => setAdditionalImages(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 resize-y"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                style={{ minHeight: '80px' }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                  Color*
                </label>
                <input
                  type="text"
                  id="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="dimensions" className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions
                </label>
                <input
                  type="text"
                  id="dimensions"
                  value={dimensions}
                  onChange={(e) => setDimensions(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="35 × 29 × 18 cm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="material" className="block text-sm font-medium text-gray-700 mb-1">
                  Material*
                </label>
                <input
                  type="text"
                  id="material"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Full-grain calfskin leather"
                />
              </div>

              <div>
                <label htmlFor="madeIn" className="block text-sm font-medium text-gray-700 mb-1">
                  Made In*
                </label>
                <input
                  type="text"
                  id="madeIn"
                  value={madeIn}
                  onChange={(e) => setMadeIn(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  placeholder="Italy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1">
                Sizes (comma-separated)
              </label>
              <input
                type="text"
                id="sizes"
                value={sizes}
                onChange={(e) => setSizes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="S, M, L, XL"
              />
            </div>

            <div className="flex space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isNew"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isNew" className="ml-2 block text-sm text-gray-900">
                  New Product
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isBestSeller"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isBestSeller" className="ml-2 block text-sm text-gray-900">
                  Best Seller
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition duration-150 ease-in-out disabled:opacity-50"
              >
                {submitting ? (editMode ? 'Updating...' : 'Adding...') : (editMode ? 'Update Product' : 'Add Product')}
              </button>
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="bg-white shadow-md rounded-lg p-6">
          {/* Category Filter */}
          {/* Filters */}
          <div className="space-y-6">
            {/* Category Filter */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Filter by Category</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 rounded text-sm transition-colors ${selectedCategoryId === null ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setSelectedCategoryId(null)}
                >
                  All Categories
                </button>
                {dbCategories.map((category) => (
                  <button
                    key={category.id}
                    className={`px-3 py-1 rounded text-sm transition-colors ${selectedCategoryId === category.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    onClick={() => setSelectedCategoryId(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Brand Filter */}
            {dbBrands.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Filter by Brand</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    className={`px-3 py-1 rounded text-sm transition-colors ${selectedBrandId === null ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    onClick={() => setSelectedBrandId(null)}
                  >
                    All Brands
                  </button>
                  {dbBrands.map((brand) => (
                    <button
                      key={brand.id}
                      className={`px-3 py-1 rounded text-sm transition-colors ${selectedBrandId === brand.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                      onClick={() => setSelectedBrandId(brand.id)}
                    >
                      {brand.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <h2 className="text-xl font-semibold mb-4">Existing Products</h2>
          
          {loading ? (
            <p className="text-gray-500">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-500">No products found{selectedCategoryId ? ` in this category` : ''}</p>
          ) : (
            <>
              <div className="mb-2">
                <p className="text-sm text-gray-600">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  {selectedCategoryId ? ` in category "${getCategoryName(selectedCategoryId)}"` : ''}
                  {selectedBrandId ? ` from brand "${getBrandName(selectedBrandId)}"` : ''}
                </p>
              </div>
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 mr-3">
                            <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt={product.name} />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            {product.brand && <div className="text-xs text-gray-500">{product.brand}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.price.toLocaleString()} MAD
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getCategoryName(product.category_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => openDeleteModal(product.id)}
                          className="text-red-600 hover:text-red-900 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </>
          )}
        </div>
      </div>
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete this product? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
      />
    </div>
  );
};

export default ProductsAdminPage;
