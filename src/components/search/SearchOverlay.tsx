import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      
      // Load recent searches from localStorage
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    }
  }, [isOpen]);

  // Simulate search suggestions based on input
  useEffect(() => {
    if (searchQuery.length > 1) {
      // In a real app, this would be an API call
      const suggestions = [
        `${searchQuery} bags`,
        `${searchQuery} accessories`,
        `luxury ${searchQuery}`,
        `${searchQuery} collection`,
        `new ${searchQuery} arrivals`
      ].filter(s => s.toLowerCase() !== searchQuery.toLowerCase());
      
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const handleSearch = (query: string = searchQuery) => {
    if (!query.trim()) return;
    
    // Save to recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter(s => s !== query)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Navigate to search results
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Close overlay if user clicks outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-start justify-center pt-16 md:pt-24 px-4"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white w-full max-w-3xl rounded-none overflow-hidden shadow-2xl"
          >
            <div className="p-4 flex items-center border-b border-gray-200">
              <Search size={20} className="text-luxury-gray mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for products, collections, and more..."
                className="flex-grow py-2 focus:outline-none text-luxury-black"
                aria-label="Search"
              />
              <button 
                onClick={onClose}
                className="ml-3 text-luxury-gray hover:text-luxury-black transition-colors"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto p-4">
              {/* Recent searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-luxury-gray">Recent Searches</h3>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-luxury-gold hover:underline"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="flex items-center justify-between w-full p-2 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span>{search}</span>
                        <ArrowRight size={16} className="text-luxury-gray" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Search suggestions */}
              {searchSuggestions.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-luxury-gray mb-3">Suggested Searches</h3>
                  <div className="space-y-2">
                    {searchSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className="flex items-center justify-between w-full p-2 hover:bg-gray-100 transition-colors text-left"
                      >
                        <span>{suggestion}</span>
                        <ArrowRight size={16} className="text-luxury-gray" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Popular categories */}
              {!searchQuery && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-luxury-gray mb-3">Popular Categories</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Bags', 'Accessories', 'New Arrivals', 'Best Sellers', 'Collections', 'Sale'].map((category) => (
                      <button
                        key={category}
                        onClick={() => navigate(`/shop/${category.toLowerCase().replace(' ', '-')}`)}
                        className="bg-gray-100 hover:bg-gray-200 transition-colors p-3 text-center"
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;