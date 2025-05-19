import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader, Tag, ShoppingBag, Bookmark, Layers } from 'lucide-react';
import { searchAll, SearchResult } from '../../services/searchService';
import { products } from '../../data/products'; // Keep for placeholder animation
import { supabase } from '../../lib/supabase';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [placeholderKey, setPlaceholderKey] = useState(0);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    products: Array<{id: string, name: string}>;
    brands: Array<{id: string, name: string, slug: string}>;
    categories: Array<{id: string, name: string, slug: string}>;
  }>({ products: [], brands: [], categories: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const productNames = products.map(p => p.name); // Keep for placeholder animation

  // Focus input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Animated placeholder effect
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => {
        const next = (prev + 1) % productNames.length;
        setPlaceholderKey(next); // trigger animation
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isOpen, productNames.length]);

  // Fetch search suggestions
  const fetchSuggestions = async (query: string) => {
    if (query.trim().length < 1) {
      setSuggestions({ products: [], brands: [], categories: [] });
      return;
    }
    
    setIsFetchingSuggestions(true);
    
    try {
      const searchTerm = `%${query.toLowerCase()}%`;
      
      // Get product name suggestions
      const { data: productSuggestions, error: productError } = await supabase
        .from('products')
        .select('id, name')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(4);
        
      if (productError) throw productError;
      
      // Get brand name suggestions
      const { data: brandSuggestions, error: brandError } = await supabase
        .from('brands')
        .select('id, name, slug')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(3);
        
      if (brandError) throw brandError;
      
      // Get category name suggestions
      const { data: categorySuggestions, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .or(`name.ilike.${searchTerm},description.ilike.${searchTerm}`)
        .limit(3);
        
      if (categoryError) throw categoryError;
      
      setSuggestions({
        products: productSuggestions || [],
        brands: brandSuggestions || [],
        categories: categorySuggestions || []
      });
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions({ products: [], brands: [], categories: [] });
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      performSearch(value);
      fetchSuggestions(value);
      setShowSuggestions(true);
    } else {
      setSearchResults([]);
      setSuggestions({ products: [], brands: [], categories: [] });
      setShowSuggestions(false);
    }
  };
  
  // Generate a URL-friendly slug from a product name
  const generateSlug = (name: string) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .replace(/-+/g, '-'); // Replace multiple consecutive hyphens with a single one
  };

  // Handle suggestion click for products
  const handleProductSuggestionClick = async (productId: string, productName: string) => {
    setSearchQuery(productName);
    
    // Try to get the product slug
    try {
      const { data: product, error } = await supabase
        .from('products')
        .select('slug, name')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      // Use slug if available, otherwise generate one from the name
      let slug = product?.slug;
      
      // If no slug found, generate one
      if (!slug) {
        // Use the product name from the database if available, otherwise use the provided name
        const nameToUse = product?.name || productName;
        slug = generateSlug(nameToUse);
        
        // Update the slug in the database for future use
        const { error: updateError } = await supabase
          .from('products')
          .update({ slug })
          .eq('id', productId);
          
        if (updateError) {
          console.error('Error updating product slug:', updateError);
        }
      }
      
      // Navigate to the product page
      navigate(`/product/${slug}`);
    } catch (error) {
      console.error('Error handling product suggestion click:', error);
      // Fallback to using the generated slug
      const fallbackSlug = generateSlug(productName);
      navigate(`/product/${fallbackSlug}`);
    }
    
    onClose();
  };
  
  // Handle suggestion click for brands
  const handleBrandSuggestionClick = (brandSlug: string, brandName: string) => {
    setSearchQuery(brandName);
    navigate(`/brand/${brandSlug}`);
    onClose();
  };
  
  // Handle suggestion click for categories
  const handleCategorySuggestionClick = (categorySlug: string, categoryName: string) => {
    setSearchQuery(categoryName);
    navigate(`/category/${categorySlug}`);
    onClose();
  };
  
  // Handle suggestion click for text
  const handleTextSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    performSearch(suggestion);
    setShowSuggestions(false);
  };
  
  // Perform search with debounce
  const performSearch = async (query: string) => {
    if (query.trim().length < 1) return;
    
    setIsSearching(true);
    setSearchError(null);
    
    try {
      const results = await searchAll(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search submission
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (searchQuery.trim().length >= 1) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      onClose();
    }
  };
  
  // Helper function to highlight matching text in suggestions
  const highlightMatchingText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return (
      <>
        {parts.map((part, i) => (
          regex.test(part) ? 
            <span key={i} className="font-semibold text-black">{part}</span> : 
            <span key={i} className="text-gray-700">{part}</span>
        ))}
      </>
    );
  };

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'product':
        navigate(`/product/${result.id}`);
        break;
      case 'brand':
        navigate(`/brand/${result.slug || result.id}`);
        break;
      case 'category':
        navigate(`/category/${result.slug || result.id}`);
        break;
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-white overflow-auto"
        >
          <div className="container mx-auto px-4 py-5 relative">
            {/* Close button (X) positioned at top-right */}
            <button 
              onClick={onClose}
              className="absolute top-2 right-2 p-2"
              aria-label="Close search"
            >
              <X size={18} className="text-black" />
            </button>

            {/* Brand Header */}
            <div className="text-center mb-5">
              <h2 className="text-2xl font-normal uppercase tracking-widest"
                style={{ fontFamily: "'LV Clemence', 'Futura Medium', Georgia, serif" }}
              >
                MAROC LUXE
              </h2>
            </div>

            {/* Search input and buttons - Always visible */}
            <div className="max-w-4xl mx-auto mb-5 relative">
              <form onSubmit={handleSearch} className={`relative flex items-center border transition-colors duration-300 ${isInputFocused ? 'border-black' : 'border-gray-300'} rounded-full overflow-visible bg-white shadow-sm`}>
                <div className="flex-shrink-0 pl-4">
                  <Search size={16} className="text-gray-500" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    setIsInputFocused(true);
                    if (searchQuery.trim().length > 0) {
                      setShowSuggestions(true);
                    }
                  }}
                  onBlur={() => setIsInputFocused(false)}
                  placeholder=" "
                  className="flex-grow py-3 px-4 text-base focus:outline-none bg-transparent rounded-full placeholder-gray-400 w-full"
                  autoComplete="off"
                  style={{ 
                    fontFamily: "'Futura', 'Lato', sans-serif", 
                    fontWeight: 400, 
                    letterSpacing: '0.3px',
                    fontSize: '15px'
                  }}
                />
                {/* Animated placeholder overlay with fixed "Search" text and animated product names */}
                {!searchQuery && (
                  <div className="absolute left-12 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none select-none flex items-center"
                    style={{ 
                      fontFamily: "'Futura', 'Lato', sans-serif", 
                      fontWeight: 400, 
                      letterSpacing: '0.3px',
                      fontSize: '15px'
                    }}
                  >
                    <span>Search </span>
                    <div className="relative h-[20px] overflow-hidden mx-[1px]" style={{ display: 'inline-block', minWidth: '120px' }}>
                      <AnimatePresence mode="wait">
                        <motion.span
                          key={placeholderKey}
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -20, opacity: 0 }}
                          transition={{ duration: 0.7, ease: "easeInOut" }}
                          style={{ display: 'block', whiteSpace: 'nowrap', fontFamily: "'Futura', 'Lato', sans-serif" }}
                        >
                          "{productNames[placeholderIndex]}"
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                )}
                {searchQuery.trim() && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setSuggestions({ products: [], brands: [], categories: [] });
                      setShowSuggestions(false);
                      searchInputRef.current?.focus();
                    }}
                    className="flex-shrink-0 px-4 py-1 text-base text-gray-500 focus:outline-none"
                    style={{ 
                      fontFamily: "'Futura', 'Lato', sans-serif", 
                      fontWeight: 400 
                    }}
                  >
                    Effacer
                  </button>
                )}
              </form>
              
              {/* Search Suggestions Dropdown */}
              {showSuggestions && (suggestions.products.length > 0 || suggestions.brands.length > 0 || suggestions.categories.length > 0) && (
                <div 
                  ref={suggestionsRef}
                  className="absolute left-0 right-0 top-full mt-1 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200"
                  style={{ maxHeight: '300px', overflowY: 'auto' }}
                >
                  {isFetchingSuggestions ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader size={24} className="text-gold-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="py-1">
                      {/* Products section */}
                      {suggestions.products.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-1 text-xs uppercase tracking-wider text-gray-500 font-medium bg-gray-50 flex items-center">
                            <ShoppingBag size={14} className="mr-2 text-gold-500" />
                            <span>Products</span>
                          </div>
                          <ul>
                            {suggestions.products.map((product) => (
                              <li key={`product-${product.id}`}>
                                <button
                                  onClick={() => handleProductSuggestionClick(product.id, product.name)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                                >
                                  <span className="ml-6">{highlightMatchingText(product.name, searchQuery)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Brands section */}
                      {suggestions.brands.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-1 text-xs uppercase tracking-wider text-gray-500 font-medium bg-gray-50 flex items-center">
                            <Bookmark size={14} className="mr-2 text-gold-500" />
                            <span>Brands</span>
                          </div>
                          <ul>
                            {suggestions.brands.map((brand) => (
                              <li key={`brand-${brand.id}`}>
                                <button
                                  onClick={() => handleBrandSuggestionClick(brand.slug, brand.name)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                                >
                                  <span className="ml-6">{highlightMatchingText(brand.name, searchQuery)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Categories section */}
                      {suggestions.categories.length > 0 && (
                        <div className="mb-1">
                          <div className="px-4 py-1 text-xs uppercase tracking-wider text-gray-500 font-medium bg-gray-50 flex items-center">
                            <Layers size={14} className="mr-2 text-gold-500" />
                            <span>Categories</span>
                          </div>
                          <ul>
                            {suggestions.categories.map((category) => (
                              <li key={`category-${category.id}`}>
                                <button
                                  onClick={() => handleCategorySuggestionClick(category.slug, category.name)}
                                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center"
                                >
                                  <span className="ml-6">{highlightMatchingText(category.name, searchQuery)}</span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* View all results */}
                      {searchQuery.trim().length > 0 && (
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => {
                              handleSearch();
                              setShowSuggestions(false);
                            }}
                            className="w-full px-4 py-2 text-left text-gray-500 hover:bg-gray-50 flex items-center font-medium"
                          >
                            <Search size={16} className="mr-2 text-gold-500" />
                            <span>View all results for "{searchQuery}"</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchQuery.trim() !== '' && (
              <div className="py-4 border-t border-gray-200 mt-4">
                {isSearching ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader className="animate-spin text-gray-400" size={24} />
                    <span className="ml-2 text-gray-500">Searching...</span>
                  </div>
                ) : searchError ? (
                  <div className="text-center py-6">
                    <p className="text-red-500">{searchError}</p>
                  </div>
                ) : searchResults.length === 0 && searchQuery.trim().length >= 1 ? (
                  <div className="text-center py-6">
                    <p className="text-sm mb-2">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-500">Try a different search term or browse our collections</p>
                    <div className="mt-6">
                      <button 
                        onClick={() => {
                          navigate('/shop');
                          onClose();
                        }}
                        className="bg-black text-white px-6 py-2 text-sm uppercase tracking-wider"
                      >
                        Browse Collections
                      </button>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="max-w-6xl mx-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 px-4">Search Results</h3>
                    
                    {/* Hide product IDs */}
                    <style>
                      {`
                        /* Hide any elements that might be displaying product IDs */
                        [data-product-id], .product-id, #product-id, div[data-product-id] {
                          display: none !important;
                        }
                      `}
                    </style>
                    
                    {/* Grid layout similar to ShopPage */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                      {searchResults.map((result) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className="group product-card-hover cursor-pointer"
                          onClick={() => {
                            if (result.type === 'product') {
                              handleProductSuggestionClick(result.id, result.name);
                            } else if (result.type === 'brand') {
                              handleBrandSuggestionClick(result.slug || result.id, result.name);
                            } else if (result.type === 'category') {
                              handleCategorySuggestionClick(result.slug || result.id, result.name);
                            }
                          }}
                        >
                          <div className="relative">
                            {/* Product image */}
                            <div className="block aspect-square overflow-hidden mb-4">
                              {result.image ? (
                                <img 
                                  src={result.image} 
                                  alt={result.name} 
                                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                  {result.type === 'product' && <ShoppingBag size={40} className="text-gray-300" />}
                                  {result.type === 'brand' && <Tag size={40} className="text-gray-300" />}
                                  {result.type === 'category' && <Tag size={40} className="text-gray-300" />}
                                </div>
                              )}
                              
                              {/* Type badge - only show for non-products */}
                              {result.type !== 'product' && (
                                <div className="absolute bottom-2 left-2 bg-white px-2 py-1 text-xs font-medium">
                                  {result.type === 'brand' ? 'Brand' : 'Category'}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {/* Product info */}
                          <div className="text-center">
                            <h3 className="font-serif text-luxury-black text-lg mb-1">{result.name}</h3>
                            {result.type === 'product' && result.price && (
                              <p className="text-luxury-gold font-medium">{result.price.toLocaleString()} MAD</p>
                            )}
                            {result.type !== 'product' && result.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{result.description}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="text-center py-4">
                        <button
                          onClick={handleSearch}
                          className="text-sm text-gray-600 hover:text-black hover:underline"
                        >
                          View all results for "{searchQuery}"
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;