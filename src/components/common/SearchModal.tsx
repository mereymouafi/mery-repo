import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Loader, Tag, ShoppingBag } from 'lucide-react';
import { searchAll, SearchResult } from '../../services/searchService';
import { products } from '../../data/products'; // Keep for placeholder animation

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
  const searchInputRef = useRef<HTMLInputElement>(null);
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

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    if (e.target.value.trim().length > 0) {
      performSearch(e.target.value);
    } else {
      setSearchResults([]);
    }
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
              <form onSubmit={handleSearch} className={`relative flex items-center border transition-colors duration-300 ${isInputFocused ? 'border-black' : 'border-gray-300'} rounded-full overflow-hidden bg-white shadow-sm`}>
                <div className="flex-shrink-0 pl-4">
                  <Search size={16} className="text-gray-500" />
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
                  <div className="max-w-4xl mx-auto">
                    <h3 className="text-sm font-medium text-gray-900 mb-3 px-4">Search Results</h3>
                    <ul className="divide-y divide-gray-100">
                      {searchResults.map((result) => (
                        <li 
                          key={`${result.type}-${result.id}`} 
                          className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="flex items-center px-4 py-3">
                            {result.image ? (
                              <img 
                                src={result.image} 
                                alt={result.name} 
                                className="w-12 h-12 object-cover rounded-sm mr-4"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded-sm flex items-center justify-center mr-4">
                                {result.type === 'product' && <ShoppingBag size={20} className="text-gray-400" />}
                                {result.type === 'brand' && <Tag size={20} className="text-gray-400" />}
                                {result.type === 'category' && <Tag size={20} className="text-gray-400" />}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{result.name}</p>
                              {result.description && (
                                <p className="text-xs text-gray-500 truncate">
                                  {result.description.length > 100 
                                    ? `${result.description.substring(0, 100)}...` 
                                    : result.description}
                                </p>
                              )}
                              <div className="flex items-center mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                  {result.type === 'product' && 'Product'}
                                  {result.type === 'brand' && 'Brand'}
                                  {result.type === 'category' && 'Category'}
                                </span>
                                {result.price && (
                                  <span className="ml-2 text-sm font-medium text-gray-900">
                                    ${result.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
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