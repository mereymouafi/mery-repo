import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { products, brands, categories } from '../data/products';
import { X, ChevronDown, ChevronUp, Filter, Grid, List } from 'lucide-react';

interface SearchResult {
  id: number;
  name: string;
  image: string;
  price: number;
  category: string;
  brand?: string;
  type: 'product';
}

const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeBrand, setActiveBrand] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [categoryExpanded, setCategoryExpanded] = useState(false);
  const [brandExpanded, setBrandExpanded] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Category filters
  const categoryFilters = [
    { id: 'all', name: 'All Products' },
    ...categories.filter(cat => cat.id !== 'all')
  ];

  // Brand filters
  const brandFilters = [
    { id: 'all', name: 'All Brands' },
    ...brands.filter(brand => brand.id !== 'all')
  ];

  useEffect(() => {
    if (query) {
      // Set loading state
      setLoading(true);
      
      // Quick immediate search to improve perceived performance
      const normalizedQuery = query.toLowerCase().trim();
      const quickMatchedProducts = products
        .filter(product => 
          product.name.toLowerCase().includes(normalizedQuery) ||
          (product.brand && product.brand.toLowerCase().includes(normalizedQuery)) ||
          product.category.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery)
        )
        .map(product => ({
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          category: product.category,
          brand: product.brand,
          type: 'product' as const
        }));
      
      setResults(quickMatchedProducts);
      
      // Simulate a more thorough search with a slight delay
      // This gives the impression of a more thorough search
      setTimeout(() => {
        setLoading(false);
      }, 300);
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);

  // Apply filters
  const filteredResults = results
    .filter(result => activeCategory === 'all' || result.category === activeCategory)
    .filter(result => activeBrand === 'all' || result.brand === activeBrand);

  // Toggle mobile filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCategoryExpanded(false);
  };

  // Handle brand selection
  const handleBrandChange = (brandId: string) => {
    setActiveBrand(brandId);
    setBrandExpanded(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setActiveCategory('all');
    setActiveBrand('all');
  };

  // Toggle category dropdown
  const toggleCategoryDropdown = () => {
    setCategoryExpanded(!categoryExpanded);
    if (brandExpanded) setBrandExpanded(false);
  };

  // Toggle brand dropdown
  const toggleBrandDropdown = () => {
    setBrandExpanded(!brandExpanded);
    if (categoryExpanded) setCategoryExpanded(false);
  };

  // Get brand name from ID
  const getBrandName = (brandId: string | undefined) => {
    if (!brandId) return null;
    return brands.find(b => b.id === brandId)?.name || brandId;
  };

  // Get active category name
  const getActiveCategoryName = () => {
    return categoryFilters.find(c => c.id === activeCategory)?.name || 'All Products';
  };

  // Get active brand name
  const getActiveBrandName = () => {
    return brandFilters.find(b => b.id === activeBrand)?.name || 'All Brands';
  };

  return (
    <>
      <Helmet>
        <title>{query ? `Results for "${query}"` : 'Search'} | Luxe Maroc</title>
      </Helmet>

      <section className="bg-white py-6 border-b border-gray-200">
        <div className="container text-center">
          <h1 className="text-2xl md:text-3xl font-serif text-luxury-black">
            {query ? `Results for "${query}"` : 'Search'}
          </h1>
          <p className="text-luxury-gray mt-2">
            {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
          </p>
        </div>
      </section>

      <section className="py-8">
        <div className="container">
          <div className="flex flex-wrap items-center justify-between mb-6">
            {/* Compact filters row */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-luxury-black font-medium">Filters</div>
              <div className="relative">
                <button 
                  onClick={toggleCategoryDropdown}
                  className="flex items-center gap-2 px-3 py-1 border rounded-sm text-sm transition-colors hover:border-gray-300"
                >
                  <span>Category: {getActiveCategoryName()}</span>
                  {categoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {categoryExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-2 w-48"
                    >
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                        {categoryFilters.map(category => (
                          <button 
                            key={category.id}
                            onClick={() => handleCategoryChange(category.id)}
                            className={`text-left px-2 py-1 text-sm rounded-sm ${
                              activeCategory === category.id 
                                ? 'bg-luxury-gold/10 text-luxury-black' 
                                : 'hover:bg-gray-100 text-luxury-gray'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="relative">
                <button 
                  onClick={toggleBrandDropdown}
                  className="flex items-center gap-2 px-3 py-1 border rounded-sm text-sm transition-colors hover:border-gray-300"
                >
                  <span>Brand: {getActiveBrandName()}</span>
                  {brandExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                <AnimatePresence>
                  {brandExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-sm shadow-lg p-2 w-48"
                    >
                      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                        {brandFilters.map(brand => (
                          <button 
                            key={brand.id}
                            onClick={() => handleBrandChange(brand.id)}
                            className={`text-left px-2 py-1 text-sm rounded-sm ${
                              activeBrand === brand.id 
                                ? 'bg-luxury-gold/10 text-luxury-black' 
                                : 'hover:bg-gray-100 text-luxury-gray'
                            }`}
                          >
                            {brand.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {(activeCategory !== 'all' || activeBrand !== 'all') && (
                <button 
                  onClick={resetFilters}
                  className="text-luxury-gold text-sm underline"
                >
                  Reset all
                </button>
              )}
            </div>

            {/* View toggle */}
            <div className="flex border border-gray-200 ml-auto mt-2 md:mt-0">
              <button 
                className={`p-2 ${view === 'grid' ? 'bg-gray-100' : 'bg-white'}`}
                onClick={() => setView('grid')}
                aria-label="Grid view"
              >
                <Grid size={18} />
              </button>
              <button 
                className={`p-2 ${view === 'list' ? 'bg-gray-100' : 'bg-white'}`}
                onClick={() => setView('list')}
                aria-label="List view"
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Search results */}
          <div className="w-full">
            {loading ? (
              // Loading state with LV style loading spinner
              <div className="py-12 text-center">
                <motion.div 
                  className="w-20 h-20 mx-auto mb-4 border-t-2 border-luxury-gold rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-luxury-gray">Searching...</p>
              </div>
            ) : filteredResults.length > 0 ? (
              // Search results grid
              <motion.div 
                layout
                className={view === 'grid' 
                  ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6"
                  : "space-y-6"
                }
              >
                {filteredResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.4, 
                      delay: loading ? 0 : Math.min(index * 0.05, 0.5),
                      type: "spring", 
                      stiffness: 150, 
                      damping: 20
                    }}
                    className={view === 'grid' ? "group" : "flex border-b border-gray-200 pb-6"}
                  >
                    <Link to={`/product/${result.id}`} className={view === 'grid' ? "block" : "flex flex-row gap-6"}>
                      <motion.div 
                        whileHover={{ scale: 1.03 }}
                        transition={{ duration: 0.3 }}
                        className={view === 'grid' 
                          ? "aspect-square overflow-hidden mb-4" 
                          : "w-40 h-40 flex-shrink-0 overflow-hidden"
                        }
                      >
                        <img 
                          src={result.image} 
                          alt={result.name} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      </motion.div>
                      
                      <div className={view === 'list' ? "flex-1" : ""}>
                        {/* Brand if available */}
                        {result.brand && (
                          <div className="uppercase text-xs text-luxury-gray tracking-wider mb-1">
                            {getBrandName(result.brand)}
                          </div>
                        )}
                        
                        <h3 className="font-serif text-luxury-black text-lg mb-1 transition-colors group-hover:text-luxury-gold">
                          {result.name}
                        </h3>
                        
                        <p className="text-luxury-gray">{result.price.toLocaleString()} MAD</p>
                        
                        {view === 'list' && (
                          <p className="text-luxury-gray mt-2 line-clamp-2">
                            {products.find(p => p.id === result.id)?.description.substring(0, 120)}...
                          </p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              // No results
              <div className="py-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={32} className="text-luxury-gray" />
                </div>
                <p className="text-luxury-gray mb-4">No results match your search.</p>
                <p className="text-luxury-gray">Try with a different term or browse our collections.</p>
                <div className="mt-8">
                  <Link to="/shop" className="btn btn-primary">
                    Browse our collections
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default SearchResultsPage;