import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Filter, X, ChevronDown } from 'lucide-react';

// Import products types and dependencies
import { Product } from '../data/products';
import QuickViewModal from '../components/common/QuickViewModal';
import { getCategories, Category } from '../lib/categoryService';
import { Brand } from '../lib/brandService';
import { supabase } from '../lib/supabase';

// Generate a URL-friendly slug from a product name
const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

const ShopPage: React.FC = () => {
  const { category } = useParams<{ category?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const brandParam = searchParams.get('brand');
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: category || 'all',
    brand: brandParam || 'all',
    priceRange: 'all',
    sortBy: 'newest',
  });
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Dynamic categories and brands from Supabase
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<Brand[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  
  // Quick View Modal state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Open Quick View Modal
  const handleQuickView = (productId: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setQuickViewProduct(product);
      setIsQuickViewOpen(true);
    }
  };

  // Close Quick View Modal
  const closeQuickView = () => {
    setIsQuickViewOpen(false);
  };
  
  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*');
          
        if (error) {
          console.error('Error fetching products:', error);
        } else {
          // Process the data to ensure images and sizes are proper arrays
          const processedData = data?.map(product => {
            // Process images (convert from string to array if needed)
            let images = product.images;
            if (typeof images === 'string') {
              try {
                images = JSON.parse(images);
              } catch (e) {
                images = [product.image];
              }
            } else if (!images) {
              images = [product.image];
            }
            
            // Process sizes (convert from string to array if needed)
            let sizes = product.sizes;
            if (typeof sizes === 'string') {
              try {
                sizes = JSON.parse(sizes);
              } catch (e) {
                if (sizes) {
                  sizes = sizes.split(',').map((size: string) => size.trim());
                }
              }
            }
            
            return {
              ...product,
              images,
              sizes
            };
          }) || [];
          
          setProducts(processedData);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const { data, error } = await getCategories();
        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          setDbCategories(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    };
    
    fetchCategories();
  }, []);
  
  useEffect(() => {
    const fetchBrandsFromSupabase = async () => {
      setLoadingBrands(true);
      try {
        const { data: brands, error } = await supabase
          .from('brands')
          .select('*') // Fetch all fields to match the Brand interface
          .order('name', { ascending: true });
  
        if (error) {
          console.error('Error fetching brands from Supabase:', error.message);
          return;
        }
  
        setDbBrands(brands || []);
        console.log('Fetched brands directly from Supabase:', brands);
      } catch (err) {
        console.error('Unexpected error while fetching brands:', err);
      } finally {
        setLoadingBrands(false);
      }
    };
  
    fetchBrandsFromSupabase();
  }, []);
  
  // Update filtered products when filters change or when products are loaded
  useEffect(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }
    
    let result = [...products];
    
    // Filter by category
    if (filters.category !== 'all') {
      console.log('Filtering by category slug:', filters.category);
      console.log('All available categories:', dbCategories.map(c => ({ id: c.id, name: c.name, slug: c.slug })));
      
      // Handle special cases for specific categories
      if (filters.category === 'moccasins' || filters.category === 'mocassins') {
        // Special handling for Moccasins category
        const moccasinsKeywords = ['moccasins', 'mocassin', 'mocassins', 'loafer', 'loafers', 'mocassins'];
        
        console.log('Special handling for Moccasins category');
        result = result.filter(product => {
          // First check the category field
          if (product.category) {
            // If category is already 'Moccasins', it matches
            if (String(product.category).toLowerCase() === 'moccasins' || 
                String(product.category).toLowerCase() === 'mocassins') {
              return true;
            }
            
            // Check if category contains any moccasins keywords
            if (moccasinsKeywords.some(keyword => 
              String(product.category).toLowerCase().includes(keyword.toLowerCase()))) {
              return true;
            }
          }
          
          // Then check the product name
          if (product.name && moccasinsKeywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check description as well
          if (product.description && moccasinsKeywords.some(keyword => 
            product.description.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          return false;
        });
      }
      else if (filters.category === 'valises' || filters.category === 'valises-louis-vuitton') {
        // Special handling for Valises category
        const valiseKeywords = ['valise', 'horizon', 'suitcase', 'luggage'];
        
        console.log('Special handling for Valises category');
        result = result.filter(product => {
          // First check the category field (could be ID, name, or string)
          if (product.category) {
            // If category is already 'Valises', it matches
            if (String(product.category).toLowerCase() === 'valises') {
              return true;
            }
            
            // Check if category contains any valise keywords
            if (valiseKeywords.some(keyword => 
              String(product.category).toLowerCase().includes(keyword.toLowerCase()))) {
              return true;
            }
            
            // Check if category matches any Valise category ID from dbCategories
            if (product.category) {
              const categoryIds = dbCategories
                .filter(cat => cat.name.toLowerCase().includes('valise'))
                .map(cat => cat.id);
              
              if (categoryIds.includes(product.category)) {
                return true;
              }
            }
          }
          
          // Then check the product name
          if (product.name && valiseKeywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check description as well
          if (product.description && valiseKeywords.some(keyword => 
            product.description.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          return false;
        });
      } 
      // Special case for sneakers category
      else if (filters.category === 'sneakers' || filters.category === 'footwear') {
        // Use an array of keywords to match for footwear/sneakers
        const footwearKeywords = ['sneakers', 'shoes', 'footwear', 'triple stitch', 'sneaker', 'shoe'];
        
        console.log('Special handling for footwear/sneakers category');
        result = result.filter(product => {
          // First check the category field
          if (product.category && footwearKeywords.some(keyword => 
            String(product.category).toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Then check the product name
          if (product.name && footwearKeywords.some(keyword => 
            product.name.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          // Check description as well
          if (product.description && footwearKeywords.some(keyword => 
            product.description.toLowerCase().includes(keyword.toLowerCase()))) {
            return true;
          }
          
          return false;
        });
      } else {
        // For other categories, try multiple strategies
        console.log('Looking for category with slug:', filters.category);
        const selectedCategory = dbCategories.find(cat => cat.slug === filters.category);
        console.log('Selected category from database:', selectedCategory);
        
        // Log all products' categories for debugging
        console.log('All product categories:', products.map(p => ({ id: p.id, name: p.name, category: p.category })));
        
        if (selectedCategory) {
          // Try matching by category ID first (could be stored in category or category_id field)
          console.log('Matching by category ID');
          console.log('Trying to match products with category ID:', selectedCategory.id);
          const filteredById = result.filter(product => {
            const matches = product.category && String(product.category) === String(selectedCategory.id);
            console.log(`Product ${product.id} (${product.name}) - category: ${product.category} - matches: ${matches}`);
            return matches;
          });
          
          if (filteredById.length > 0) {
            result = filteredById;
          } else {
            // Try matching by category name
            console.log('Matching by category name:', selectedCategory.name);
            result = result.filter(product => {
              const matchesExact = product.category && String(product.category).toLowerCase() === String(selectedCategory.name).toLowerCase();
              const matchesPartial = product.category && String(product.category).toLowerCase().includes(String(selectedCategory.name).toLowerCase());
              console.log(`Product ${product.id} (${product.name}) - category: ${product.category} - exact match: ${matchesExact}, partial match: ${matchesPartial}`);
              return matchesExact || matchesPartial;
            });
          }
        } else {
          // Try matching by formatted name from slug
          const categoryName = filters.category
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          console.log('Matching by formatted slug name:', categoryName);
          result = result.filter(product => {
            const matches = product.category && String(product.category).toLowerCase().includes(categoryName.toLowerCase());
            console.log(`Product ${product.id} (${product.name}) - category: ${product.category} - matches by name: ${matches}`);
            return matches;
          });
        }
      }
      
      console.log('Filtered products:', result.map(p => ({ id: p.id, name: p.name, category: p.category })));
    }
    
    // Filter by brand
    if (filters.brand !== 'all') {
      // Find the brand by slug
      const selectedBrand = dbBrands.find(b => b.slug === filters.brand);
      
      if (selectedBrand) {
        // Filter by brand ID or slug
        result = result.filter(product => 
          product.brand && (String(product.brand) === String(selectedBrand.id) || 
                           product.brand === selectedBrand.slug));
      } else {
        // Fallback to direct comparison
        result = result.filter(product => 
          product.brand && product.brand === filters.brand);
      }
    }
    
    // Filter by price range
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number);
      result = result.filter(product => 
        product.price >= min && (max ? product.price <= max : true));
    }
    
    // Sort products
    if (filters.sortBy === 'price-low') {
      result.sort((a: Product, b: Product) => a.price - b.price);
    } else if (filters.sortBy === 'price-high') {
      result.sort((a: Product, b: Product) => b.price - a.price);
    } else if (filters.sortBy === 'name') {
      result.sort((a: Product, b: Product) => a.name.localeCompare(b.name));
    }
    // 'newest' is default sorting from the data
    
    setFilteredProducts(result);
  }, [filters, category, products]);

  // Update filters when URL params change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      category: category || 'all'
    }));
  }, [category]);
  
  // Update brand filter when URL param changes
  useEffect(() => {
    if (brandParam) {
      setFilters(prev => ({
        ...prev,
        brand: brandParam
      }));
    }
  }, [brandParam]);

  // Handle filter changes
  const handleFilterChange = (filterType: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // Get page title based on category or brand parameter
  const getPageTitle = () => {
    // Check if a brand is selected from URL parameter
    if (brandParam) {
      const brandMatch = dbBrands.find(brand => brand.slug === brandParam);
      if (brandMatch) return brandMatch.name;
    }
    
    // Check if a brand is selected from filters
    if (filters.brand !== 'all') {
      const brandMatch = dbBrands.find(brand => brand.slug === filters.brand);
      if (brandMatch) return brandMatch.name;
    }
    
    // If no brand is selected, check for category
    if (category) {
      // Check if it's a category from Supabase
      const categoryMatch = dbCategories.find(cat => cat.slug === category);
      if (categoryMatch) return categoryMatch.name;
      
      // Default formatting for URL parameter
      return category
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return 'Shop All';
  };

  return (
    <>
      <Helmet>
        <title>{getPageTitle()} | Luxe Maroc</title>
        <meta name="description" content={`Shop our luxury ${category || 'products'} collection at Luxe Maroc.`} />
      </Helmet>
      
      {/* Hide product IDs */}
      <style>
        {`
          /* Hide any elements that might be displaying product IDs */
          [data-product-id], .product-id, #product-id, div[data-product-id] {
            display: none !important;
          }
        `}
      </style>

      {/* Page Header */}
      <section className="bg-luxury-cream py-12">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-serif text-luxury-black text-center">{getPageTitle()}</h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-col lg:flex-row">
            {/* Desktop Filters Sidebar */}
            <div className="hidden lg:block w-64 flex-shrink-0 pr-8">
              <div className="sticky top-24">
                <h3 className="text-xl font-serif text-luxury-black mb-6">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Category</h4>
                  {loadingCategories ? (
                    <p className="text-sm text-luxury-gray">Loading categories...</p>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category"
                          value="all"
                          checked={filters.category === 'all'}
                          onChange={() => handleFilterChange('category', 'all')}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">All Products</span>
                      </label>
                      {dbCategories.map(cat => (
                        <label key={cat.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category"
                            value={cat.slug}
                            checked={filters.category === cat.slug}
                            onChange={() => handleFilterChange('category', cat.slug)}
                            className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span className="ml-2 text-luxury-gray">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Brand Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Brand</h4>
                  {loadingBrands ? (
                    <p className="text-sm text-luxury-gray">Loading brands...</p>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="brand"
                          value="all"
                          checked={filters.brand === 'all'}
                          onChange={() => handleFilterChange('brand', 'all')}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">All Brands</span>
                      </label>
                      {dbBrands.map((brand: Brand) => (
                        <label key={brand.id} className="flex items-center">
                          <input
                            type="radio"
                            name="brand"
                            value={brand.slug}
                            checked={filters.brand === brand.slug}
                            onChange={() => handleFilterChange('brand', brand.slug)}
                            className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span className="ml-2 text-luxury-gray">{brand.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        value="all"
                        checked={filters.priceRange === 'all'}
                        onChange={() => handleFilterChange('priceRange', 'all')}
                        className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                      />
                      <span className="ml-2 text-luxury-gray">All Prices</span>
                    </label>
                    {[
                      { label: 'Under 1,000 MAD', value: '0-1000' },
                      { label: '1,000 - 2,000 MAD', value: '1000-2000' },
                      { label: '2,000 - 5,000 MAD', value: '2000-5000' },
                      { label: 'Over 5,000 MAD', value: '5000-' },
                    ].map(range => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={() => handleFilterChange('priceRange', range.value)}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Filters Button */}
            <div className="lg:hidden mb-6">
              <button
                onClick={toggleMobileFilters}
                className="flex items-center justify-center w-full py-2 border border-luxury-gray text-luxury-black"
              >
                <Filter size={18} className="mr-2" />
                Filters
              </button>
            </div>

            {/* Mobile Filters Sidebar */}
            <div
              className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ${
                mobileFiltersOpen ? 'translate-x-0' : '-translate-x-full'
              } lg:hidden`}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-serif text-luxury-black">Filters</h3>
                <button
                  onClick={toggleMobileFilters}
                  className="text-luxury-gray p-1"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 overflow-y-auto h-[calc(100vh-60px)]">
                {/* Category Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Category</h4>
                  {loadingCategories ? (
                    <p className="text-sm text-luxury-gray">Loading categories...</p>
                  ) : (
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="category-mobile"
                          value="all"
                          checked={filters.category === 'all'}
                          onChange={() => handleFilterChange('category', 'all')}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">All Products</span>
                      </label>
                      {dbCategories.map(cat => (
                        <label key={cat.id} className="flex items-center">
                          <input
                            type="radio"
                            name="category-mobile"
                            value={cat.slug}
                            checked={filters.category === cat.slug}
                            onChange={() => handleFilterChange('category', cat.slug)}
                            className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                          />
                          <span className="ml-2 text-luxury-gray">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Brand Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Brand</h4>
                  <div className="space-y-2">
                    {dbBrands.map((brand: Brand) => (
                      <label key={brand.id} className="flex items-center">
                        <input
                          type="radio"
                          name="brand-mobile"
                          value={brand.slug}
                          checked={filters.brand === brand.slug}
                          onChange={() => handleFilterChange('brand', brand.slug)}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">{brand.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Price Range Filter */}
                <div className="mb-8">
                  <h4 className="text-sm font-medium text-luxury-black mb-3">Price Range</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange-mobile"
                        value="all"
                        checked={filters.priceRange === 'all'}
                        onChange={() => handleFilterChange('priceRange', 'all')}
                        className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                      />
                      <span className="ml-2 text-luxury-gray">All Prices</span>
                    </label>
                    {[
                      { label: 'Under 1,000 MAD', value: '0-1000' },
                      { label: '1,000 - 2,000 MAD', value: '1000-2000' },
                      { label: '2,000 - 5,000 MAD', value: '2000-5000' },
                      { label: 'Over 5,000 MAD', value: '5000-' },
                    ].map(range => (
                      <label key={range.value} className="flex items-center">
                        <input
                          type="radio"
                          name="priceRange-mobile"
                          value={range.value}
                          checked={filters.priceRange === range.value}
                          onChange={() => handleFilterChange('priceRange', range.value)}
                          className="h-4 w-4 border-luxury-gray text-luxury-gold focus:ring-luxury-gold"
                        />
                        <span className="ml-2 text-luxury-gray">{range.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <button
                    className="flex-1 py-2 border border-luxury-black bg-luxury-black text-white"
                    onClick={() => {
                      setFilters({
                        category: 'all',
                        brand: 'all',
                        priceRange: 'all',
                        sortBy: 'newest',
                      });
                      toggleMobileFilters();
                    }}
                  >
                    Reset
                  </button>
                  <button
                    className="flex-1 py-2 border border-luxury-gold bg-luxury-gold text-luxury-black"
                    onClick={toggleMobileFilters}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Sort Options */}
              <div className="flex justify-between items-center mb-8">
                <p className="text-luxury-gray">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </p>

                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="appearance-none border border-luxury-gray pl-4 pr-10 py-2 bg-transparent focus:outline-none focus:border-luxury-gold"
                  >
                    <option value="newest">Sort by: Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name">Name: A to Z</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-luxury-gray" />
                </div>
              </div>

              {/* Loading state */}
              {loading ? (
                <div className="text-center py-12">
                  <p className="text-luxury-gray">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12 border border-gray-200">
                  <p className="text-luxury-gray">No products found matching your filters.</p>
                  <button 
                    className="text-luxury-gold hover:underline mt-2"
                    onClick={() => setFilters({
                      category: 'all',
                      brand: 'all',
                      priceRange: 'all',
                      sortBy: 'newest',
                    })}
                  >
                    Reset filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product: Product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="group product-card-hover"
                    >
                      <div className="relative">
                        <Link to={`/product/${product.slug || generateSlug(product.name)}`} className="block aspect-square overflow-hidden mb-4">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <button 
                              className="btn btn-gold w-full text-sm py-2"
                              onClick={(e) => {
                                e.preventDefault();
                                handleQuickView(product.id);
                              }}
                            >
                              Quick View
                            </button>
                          </div>
                        </Link>
                        {product.isNew && (
                          <div className="absolute top-2 left-2 bg-luxury-gold px-2 py-1 text-xs text-luxury-black font-medium">
                            New
                          </div>
                        )}
                        {product.isBestSeller && (
                          <div className="absolute top-2 left-2 bg-luxury-black px-2 py-1 text-xs text-white font-medium">
                            Best Seller
                          </div>
                        )}
                      </div>
                      
                      {/* Display brand if available */}
                      {product.brand && (
                        <div className="uppercase text-xs text-luxury-gray tracking-wider mb-1">
                          {dbBrands.find((b: Brand) => b.id === product.brand)?.name}
                        </div>
                      )}
                      
                      <h3 className="font-serif text-luxury-black text-lg mb-1">{product.name}</h3>
                      <p className="text-luxury-gold font-medium">{product.price.toLocaleString()} MAD</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={closeQuickView}
      />
    </>
  );
};

export default ShopPage;