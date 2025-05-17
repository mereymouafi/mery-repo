import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ArrowRight, Loader, SlidersHorizontal } from 'lucide-react';
import { products, categories, brands } from '../../data/products';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchSuggestion {
  type: 'product' | 'category' | 'brand';
  id: number | string;
  name: string;
  image?: string;
  price?: number;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [instantResults, setInstantResults] = useState<SearchSuggestion[]>([]);
  const [matchedBrand, setMatchedBrand] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [autoNavigateTimeout, setAutoNavigateTimeout] = useState<number | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [placeholderKey, setPlaceholderKey] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const productNames = products.map(p => p.name);

  // Focus input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    // Clear any navigation timeouts when modal closes
    return () => {
      if (autoNavigateTimeout) {
        clearTimeout(autoNavigateTimeout);
      }
    };
  }, [isOpen, autoNavigateTimeout]);

  // Load recent searches from localStorage
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches).slice(0, 4));
      } catch (error) {
        console.error('Failed to parse recent searches:', error);
      }
    }
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
    }, 2000); // Changed to 2 seconds
    return () => clearInterval(interval);
  }, [isOpen, productNames.length]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Clear any existing navigation timeout
    if (autoNavigateTimeout) {
      clearTimeout(autoNavigateTimeout);
    }

    if (query.trim().length >= 1) {
      setIsSearching(true);
      setShowSuggestions(true);
      
      // Debounce the search for better performance
      const timer = setTimeout(() => {
        getSuggestions(query);
        getInstantResults(query);
        getSearchSuggestions(query);
        setIsSearching(false);
      }, 300);
      
      return () => {
        clearTimeout(timer);
        if (autoNavigateTimeout) clearTimeout(autoNavigateTimeout);
      };
    } else {
      setSuggestions([]);
      setSearchSuggestions([]);
      setInstantResults([]);
      setMatchedBrand(null);
      setIsSearching(false);
      setShowSuggestions(false);
    }
  };

  // Generate suggestions based on search query
  const getSuggestions = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Filter products
    const productSuggestions = products
      .filter(product => 
        product.name.toLowerCase().includes(normalizedQuery) || 
        (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) ||
        product.category.toLowerCase().includes(normalizedQuery) ||
        product.description.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 4)
      .map(product => ({
        type: 'product' as const,
        id: product.id,
        name: product.name,
        image: product.image,
        price: product.price
      }));
    
    // Filter categories
    const categorySuggestions = categories
      .filter(category => 
        category.name.toLowerCase().includes(normalizedQuery) &&
        category.id !== 'all'
      )
      .slice(0, 2)
      .map(category => ({
        type: 'category' as const,
        id: category.id,
        name: category.name
      }));
    
    // Filter brands
    const brandSuggestions = brands
      .filter(brand => 
        brand.name.toLowerCase().includes(normalizedQuery) ||
        brand.id.toLowerCase().includes(normalizedQuery)
      )
      .slice(0, 2)
      .map(brand => ({
        type: 'brand' as const,
        id: brand.id,
        name: brand.name
      }));
    
    // Combine suggestions with products first
    setSuggestions([
      ...productSuggestions,
      ...categorySuggestions,
      ...brandSuggestions
    ]);
  };

  // Generate text-based search suggestions based on query
  const getSearchSuggestions = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    if (normalizedQuery.length === 0) {
      setSearchSuggestions([]);
      return;
    }
    
    // Get category matches
    const categoryMatches = categories
      .filter(category => 
        category.id !== 'all' && 
        (category.name.toLowerCase().startsWith(normalizedQuery) ||
         category.name.toLowerCase().includes(normalizedQuery))
      )
      .map(category => category.name);
    
    // Get brand matches
    const brandMatches = brands
      .filter(brand => 
        brand.id !== 'all' && 
        (brand.name.toLowerCase().startsWith(normalizedQuery) ||
         brand.name.toLowerCase().includes(normalizedQuery))
      )
      .map(brand => brand.name);
    
    // Get product name matches (both starts with and contains)
    const productNameMatches = products
      .filter(product => 
        product.name.toLowerCase().startsWith(normalizedQuery) ||
        product.name.toLowerCase().includes(` ${normalizedQuery}`) || // Word boundaries
        product.category.toLowerCase().includes(normalizedQuery) ||
        (product.description && product.description.toLowerCase().includes(normalizedQuery))
      )
      .map(product => product.name);
    
    // Add common search patterns
    let suggestedCompletions = [
      `${normalizedQuery} `
    ];
    
    // Combine all potential suggestions
    const allPotentialSuggestions = [
      ...categoryMatches,
      ...brandMatches, 
      ...productNameMatches,
      ...suggestedCompletions
    ];
    
    // Remove duplicates
    const uniqueSuggestions = Array.from(new Set(allPotentialSuggestions));
    
    // Filter to keep only unique suggestions that are different from the query
    const filteredSuggestions = uniqueSuggestions.filter(suggestion => 
      suggestion.toLowerCase() !== normalizedQuery &&
      suggestion.length > normalizedQuery.length
    );
    
    // Sort by relevance:
    // 1. First, terms that start with the query
    // 2. Then other matches
    // 3. For equal relevance, sort by length (shorter first)
    const sortedSuggestions = filteredSuggestions.sort((a, b) => {
      const aStartsWith = a.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      const bStartsWith = b.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
      
      if (aStartsWith !== bStartsWith) return aStartsWith - bStartsWith;
      return a.length - b.length;
    });
    
    // Take top 5 results
    setSearchSuggestions(sortedSuggestions.slice(0, 5));
  };

  // Improved instant results function to find more matches
  const getInstantResults = (query: string) => {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Check if query matches any brand name or ID
    const matchedBrandObj = brands.find(
      brand => brand.name.toLowerCase().includes(normalizedQuery) || 
               brand.id.toLowerCase().includes(normalizedQuery)
    );
    
    // Get all matching products
    // 1. First priority: Starts with query
    const startsWithProducts = products.filter(product => 
      product.name.toLowerCase().startsWith(normalizedQuery) ||
      product.category.toLowerCase().startsWith(normalizedQuery) ||
      (product.brand && product.brand.toLowerCase().startsWith(normalizedQuery))
    );
    
    // 2. Second priority: Contains query
    const containsProducts = products.filter(product => {
      // Skip if already in startsWithProducts
      if (startsWithProducts.some(p => p.id === product.id)) return false;
      
      return (
        product.name.toLowerCase().includes(normalizedQuery) || 
        product.category.toLowerCase().includes(normalizedQuery) ||
        (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) ||
        product.description.toLowerCase().includes(normalizedQuery)
      );
    });
    
    // Combine results
    const allMatchingProducts = [...startsWithProducts, ...containsProducts];
    
    if (matchedBrandObj) {
      setMatchedBrand(matchedBrandObj.name);
      
      // Get all products from this brand
      const brandProducts = products
        .filter(product => product.brand === matchedBrandObj.id)
        .map(product => ({
          type: 'product' as const,
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price
        }));
      
      setInstantResults(brandProducts.slice(0, 6));
    } else {
      setMatchedBrand(null);
      
      // Get all products matching the query
      const matchingProducts = allMatchingProducts
        .slice(0, 6) // Limit to 6 products for UI display
        .map(product => ({
          type: 'product' as const,
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price
        }));
      
      setInstantResults(matchingProducts);
    }
  };

  // Handle search submission (if user presses Enter)
  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (searchQuery.trim()) {
      // Save to recent searches
      const updatedSearches = [
        searchQuery,
        ...recentSearches.filter(search => search !== searchQuery)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      // Instead of navigating away, update search results in-place
      setIsSearching(true);
      getSuggestions(searchQuery);
      getInstantResults(searchQuery);
      setShowSuggestions(false);
      
      // Short timeout to simulate search
      setTimeout(() => {
        setIsSearching(false);
      }, 300);
    }
  };

  // Handle search icon click when there's a query
  const handleSearchIconClick = () => {
    if (searchQuery.trim()) {
      // Clear any auto-navigate timeout when user clicks search icon
      if (autoNavigateTimeout) {
        clearTimeout(autoNavigateTimeout);
      }
      
      handleSearch();
    }
  };

  // Handle search suggestion click
  const handleSearchSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    getSuggestions(suggestion);
    getInstantResults(suggestion);
    setShowSuggestions(false);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    // Clear any auto-navigate timeout when user clicks a suggestion
    if (autoNavigateTimeout) {
      clearTimeout(autoNavigateTimeout);
    }
    
    switch (suggestion.type) {
      case 'product':
        navigate(`/product/${suggestion.id}`);
        break;
      case 'category':
        navigate(`/shop/${suggestion.id}`);
        break;
      case 'brand':
        navigate(`/shop/${suggestion.id}`);
        break;
    }
    onClose();
    setSearchQuery('');
  };

  // Handle recent search click
  const handleRecentSearchClick = (search: string) => {
    // Clear any auto-navigate timeout when user clicks a recent search
    if (autoNavigateTimeout) {
      clearTimeout(autoNavigateTimeout);
    }
    
    setSearchQuery(search);
    navigate(`/search?q=${encodeURIComponent(search)}`);
    onClose();
  };

  // Toggle filters panel
  const toggleFilters = () => {
    setShowFilters(!showFilters);
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
                {matchedBrand || "MAROC LUXE"}
              </h2>
            </div>

            {/* Search input and buttons - Always visible */}
            <div className="max-w-4xl mx-auto mb-5 relative">
              <form onSubmit={handleSearch} className={`relative flex items-center border transition-colors duration-300 ${isInputFocused ? 'border-black' : 'border-gray-300'} rounded-full overflow-hidden bg-white shadow-sm`}>
                <div className="flex-shrink-0 pl-4">
                      {isSearching ? (
                    <Loader size={16} className="text-gray-500" />
                      ) : (
                    <Search size={16} className="text-gray-500" onClick={handleSearchIconClick} />
                      )}
                    </div>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                  onFocus={() => setIsInputFocused(true)}
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
                    onClick={() => setSearchQuery('')}
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
              {showSuggestions && searchQuery.trim() && searchSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-gray-100 shadow-lg">
                  {searchSuggestions.map((suggestion, index) => {
                    // Find where the query ends and suggestion begins
                    const queryLower = searchQuery.toLowerCase();
                    const suggestionLower = suggestion.toLowerCase();
                    
                    let displaySuggestion;
                    
                    if (suggestionLower.startsWith(queryLower)) {
                      // Direct completion (e.g. 'jean' -> 'jean homme')
                      displaySuggestion = (
                        <>
                          <span className="font-normal text-black">{searchQuery}</span>
                          <span className="text-gray-500">{suggestion.slice(searchQuery.length)}</span>
                        </>
                      );
                    } else if (suggestionLower.includes(queryLower)) {
                      // Query appears in the middle (less common case)
                      const parts = suggestionLower.split(queryLower);
                      displaySuggestion = (
                        <>
                          <span className="text-gray-500">{parts[0]}</span>
                          <span className="font-normal text-black">{searchQuery}</span>
                          <span className="text-gray-500">{
                            parts.slice(1).join(searchQuery.toLowerCase())
                          }</span>
                        </>
                      );
                    } else {
                      // Fallback - just show the full suggestion
                      displaySuggestion = <span>{suggestion}</span>;
                    }
                    
                    return (
                      <div 
                        key={index}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSearchSuggestionClick(suggestion)}
                      >
                        <Search size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                        <span className="text-sm">{displaySuggestion}</span>
                      </div>
                    );
                  })}
                  <div className="px-3 py-2 border-t border-gray-100">
                    <a href="/stores" className="text-sm hover:underline">Trouvez nos magasins</a>
                  </div>
                </div>
              )}
              </div>

            {/* Popular searches - Always visible */}
            <div className="max-w-3xl mx-auto mb-8 text-center">
              <p className="uppercase text-xs tracking-wider text-gray-500 mb-3" 
                style={{ 
                  letterSpacing: '1px',
                  fontFamily: "'LV Sans', 'Futura Medium', Georgia, serif"
                }}
              >RECHERCHES POPULAIRES</p>
              <div className="flex flex-wrap justify-center gap-8">
                {[
                  { name: 'SPEEDY', id: 'speedy' },
                  { name: 'POCHETTE', id: 'pochette' },
                  { name: 'NEVERFULL', id: 'neverfull' },
                  { name: 'BRACELET', id: 'bracelet' },
                  { name: 'PORTEFEUILLE', id: 'portefeuille' }
                ].map(category => (
                  <button 
                    key={category.id}
                    onClick={() => {
                      setSearchQuery(category.name);
                      getSuggestions(category.name);
                      getInstantResults(category.name);
                      setShowSuggestions(false);
                    }}
                    className="text-sm uppercase hover:underline tracking-wider"
                    style={{ 
                      letterSpacing: '1px', 
                      fontFamily: "'LV Clemence', 'Futura Medium', Georgia, serif" 
                    }}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Products Section */}
            {!searchQuery && (
              <div className="py-12 border-t border-gray-200">
                <h3 className="text-center uppercase text-base mb-8" 
                  style={{ 
                    letterSpacing: '1px',
                    fontFamily: "'LV Clemence', 'Futura Medium', Georgia, serif"
                  }}
                >
                  Produits Populaires
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 px-4">
                  {products.slice(0, 5).map((product, index) => (
                    <div 
                      key={`popular-${product.id}-${index}`}
                      className="group relative cursor-pointer"
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        onClose();
                      }}
                    >
                      {/* Favorite button */}
                      <button 
                        className="absolute right-2 top-2 z-10 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add favorite functionality
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                        </svg>
                      </button>
                      
                      {/* Product image */}
                      <div className="mb-2">
                        <div className="aspect-square bg-gray-50">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      
                      {/* Product info */}
                      <div>
                        <p className="text-xs text-gray-900 font-light leading-tight mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-900">
                          {product.price.toLocaleString()} MAD
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Results section */}
            {searchQuery.trim() !== '' && !isSearching && (
              <>
                {instantResults.length > 0 ? (
                  <div className="border-t border-gray-200 pt-5 mt-2">
                    {/* Results heading and filter on same line */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">{instantResults.length} results found</p>
                      </div>
                      {/* Filter button */}
                      <button 
                        onClick={toggleFilters}
                        className="flex items-center gap-1 border border-gray-300 rounded-full px-4 py-1.5 text-sm"
                        >
                        <span>Filtrer</span> <SlidersHorizontal size={14} />
                      </button>
                    </div>

                    {/* Filter panel */}
                    <AnimatePresence>
                      {showFilters && (
                  <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-white border border-gray-200 rounded-md p-4 mb-4 overflow-hidden"
                  >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Category Filter */}
                            <div>
                              <h4 className="font-medium mb-2">Category</h4>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <input type="radio" id="cat-all" name="category" defaultChecked className="mr-2" />
                                  <label htmlFor="cat-all" className="text-sm">All Products</label>
                                </div>
                                {[
                                  'Handbags',
                                  'Accessories',
                                  'Wallets',
                                  'Collections',
                                  'Footwear',
                                  'Clothing',
                                  'T-shirts',
                                  'Jeans',
                                  'Luggage'
                                ].map((cat) => (
                                  <div key={cat} className="flex items-center">
                                    <input type="radio" id={`cat-${cat}`} name="category" className="mr-2" />
                                    <label htmlFor={`cat-${cat}`} className="text-sm">{cat}</label>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Brand Filter */}
                            <div>
                              <h4 className="font-medium mb-2">Brand</h4>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <input type="radio" id="brand-all" name="brand" defaultChecked className="mr-2" />
                                  <label htmlFor="brand-all" className="text-sm">All Brands</label>
                                </div>
                                {[
                                  'ZEGNA',
                                  'Loro Piana',
                                  'Louis Vuitton',
                                  'Dior',
                                  'Gucci',
                                  'Prada',
                                  'Hermès',
                                  'Dolce & Gabbana',
                                  'Givenchy',
                                  'Fendi',
                                  'Loewe',
                                  'Armani'
                                ].map((brand) => (
                                  <div key={brand} className="flex items-center">
                                    <input type="radio" id={`brand-${brand}`} name="brand" className="mr-2" />
                                    <label htmlFor={`brand-${brand}`} className="text-sm">{brand}</label>
                                  </div>
                      ))}
                    </div>
                            </div>

                            {/* Price Range Filter */}
                            <div>
                              <h4 className="font-medium mb-2">Price Range</h4>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <input type="radio" id="price-all" name="price" defaultChecked className="mr-2" />
                                  <label htmlFor="price-all" className="text-sm">All Prices</label>
                                </div>
                                {[
                                  { label: 'Under 1,000 MAD', id: 'under-1000' },
                                  { label: '1,000 - 2,000 MAD', id: '1000-2000' },
                                  { label: '2,000 - 5,000 MAD', id: '2000-5000' },
                                  { label: 'Over 5,000 MAD', id: 'over-5000' }
                                ].map((price) => (
                                  <div key={price.id} className="flex items-center">
                                    <input type="radio" id={`price-${price.id}`} name="price" className="mr-2" />
                                    <label htmlFor={`price-${price.id}`} className="text-sm">{price.label}</label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Apply filters button */}
                          <div className="mt-4 text-center">
                            <button 
                              onClick={toggleFilters}
                              className="bg-black text-white px-6 py-1.5 text-sm uppercase tracking-wider"
                            >
                              Apply Filters
                            </button>
                          </div>
                        </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Products grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                              {instantResults.map((result, index) => (
                        <div 
                          key={`product-${result.id}-${index}`}
                          className="group relative cursor-pointer"
                                  onClick={() => handleSuggestionClick(result)}
                                >
                          {/* Favorite button */}
                          <button 
                            className="absolute right-1 top-1 z-10 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add favorite functionality
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                            </svg>
                          </button>
                          
                          {/* Product image */}
                          <div className="mb-1">
                            <div className="text-xs text-gray-500 mb-0.5">Nouveau</div>
                                  {result.image && (
                              <div className="aspect-square bg-gray-50">
                                <img 
                                        src={result.image} 
                                        alt={result.name} 
                                  className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                          </div>
                          
                          {/* Product info */}
                                  <div>
                            <p className="text-xs text-gray-900 font-light leading-tight mb-0.5 line-clamp-2">
                                      {result.name}
                                    </p>
                                    {result.price && (
                              <p className="text-xs text-gray-900">
                                        {result.price.toLocaleString()} MAD
                                      </p>
                                    )}
                                  </div>
                        </div>
                              ))}
                            </div>
                          </div>
                ) : (
                  <div className="text-center py-8 border-t border-gray-200 mt-4">
                    <p className="text-sm mb-2">No results found for "{searchQuery}"</p>
                    <p className="text-xs text-gray-500">Try checking your spelling or use more general terms</p>
                          </div>
                        )}
              </>
                    )}

            {/* Loading state */}
            {searchQuery.trim() !== '' && isSearching && (
              <div className="text-center py-8 border-t border-gray-200 mt-4">
                <Loader size={20} className="mx-auto mb-2" />
                <p className="text-sm text-gray-500">Searching...</p>
              </div>
            )}
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal; 